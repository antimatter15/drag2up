function shorten(url, func){
  var svc = 'goo.gl';
  var shortSvc = shortSvcList[svc];
  var param = (typeof(shortSvc.param) == "string" ? shortSvc.param : shortSvc.param(url))+encodeURIComponent(url);

  // load credentials into param string
  if (shortSvc.cred) {
          for (var i in shortSvc.cred) {
                  var c = shortSvc.defcred[i];
                  param = param.replace("%"+shortSvc.cred[i]+"%", c);
          }
  }

  $.ajax({
          type: shortSvc.method,
          url: shortSvc.s_url,
          data: param,
          dataType: shortSvc.dataType,
          timeout: 10000,
          error: function(xhr, errmsg) {
                  switch (errmsg) {
                          case "timeout": func({status: "error", error: "Timeout connecting to "+svc}); break;
                          case "error": func({status: "error", error: "HTTP Status Code: "+xhr.status}); break;
                          default: func({status: "error", error: errmsg}); break;
                  }
          },
          success: function(r) {
                  shortSvc.s_proc(r, func);
          }
  });

}

                                
                                
                                



var expandApi = "http://api.longurl.org/v2/"
//var expandSvcList;

// compares two version numbers
// returns:
//   1: a>b
//   0: a=b
//  -1: a<b
function compareVersion(sa, sb) {
        function parseVerString(str) {
            if (typeof(str) != 'string') { return false; }
            var x = str.split(".");
            // parse from string or default to 0 if can't parse
            var maj = parseInt(x[0]) || 0;
            var min = parseInt(x[1]) || 0;
            var pat = parseInt(x[2]) || 0;
            var patm = parseInt(x[3]) || 0;
            return {
                major: maj,
                minor: min,
                patch: pat,
                patchmin: patm
            }
        }

        var a = parseVerString(sa);
        var b = parseVerString(sb);

        // handle cases for non-strings
        if (!a && !b) return 0;
        if (!a) return -1;
        if (!b) return 1;

        if (a.major > b.major) return 1;
        if (b.major > a.major) return -1;

        if (a.minor > b.minor) return 1;
        if (b.minor > a.minor) return -1;

        if (a.patch > b.patch) return 1;
        if (b.patch > a.patch) return -1;

        if (a.patchmin > b.patchmin) return 1;
        if (b.patchmin > a.patchmin) return -1;

        return 0;
}

// check if JSON object is empty
function isEmpty(ob){
        for(var i in ob){ if(ob.hasOwnProperty(i)){return false;}}
        return true;
}

var linkCache = {
        length: 0,
        c: {},
        q: [],
        connections: 0,
        ajax_queue: [],

        // get link from cache
        get: function(short_url, f) {
                var link = this.c[short_url];
                if (link !== undefined)
                        f({status: "ok", url: link.url, title: link.title});
                else
                        this.queue(short_url, f);
        },

        // queue link
        queue: function(short_url, f) {
                // check if link in current queue
                for (var i=0; i<this.q.length; i++) {
                        if (this.q[i].url == short_url) {
                                this.q[i].callback.push(f);
                                return;
                        }
                }
                // add new queue item
                this.q.push({url: short_url, callback: [f]});

                // add to ajax queue
                this.ajax_queue.push(this.q[this.q.length-1]);

                // start new ajax get if max connections not reached
                if (this.connections < 4)
                        this.ajax();
        },

        // ajax get
        ajax: function() {
                this.connections++;
                // get first queue item
                var item = this.ajax_queue.shift();
                $.ajax({
                        type: "GET",
                        url: expandApi+"expand?format=json&title=1&url="+encodeURIComponent(item.url),
                        dataType: "json",
                        timeout: 10000,
                        error: function(xhr, errmsg) {
                                linkCache.connections--;
                                item.callback.forEach(function(f) {
                                        f({status: "error", error: errmsg});
                                });
                                // remove item from queue
                                linkCache.q.splice(linkCache.q.indexOf(item), 1);
                                // start new ajax get if there are still items on the queue
                                if (linkCache.ajax_queue.length > 0)
                                        linkCache.ajax();
                        },
                        success: function(r) {
                                linkCache.connections--;
                                if (r["long-url"] == item.url) {
                                        item.callback.forEach(function(f) {
                                                f({status: "noexp"});
                                        });
                                }
                                else {
                                        item.callback.forEach(function(f) {
                                                f({status: "ok", url: r["long-url"], title: r.title});
                                        });
                                        linkCache.add(item.url, r["long-url"], r.title);
                                }
                                // remove item from queue
                                linkCache.q.splice(linkCache.q.indexOf(item), 1);
                                // start new ajax get if there are still items on the queue
                                if (linkCache.ajax_queue.length > 0)
                                        linkCache.ajax();
                        }
                });
        },

        // add link to cache
        add: function(short_url, long_url, title) {
                if (this.length >= localStorage["muse_cache_size"])
                        this.clear();
                // only increment if not in list
                if (this.c[short_url] === undefined)
                        this.length++;
                this.c[short_url] = {url: long_url, title: title};
        },

        // clear cache
        clear: function() {
                this.c = {};
                this.length = 0;
        }
};

function addRequestListener() {
        // display pageAction icon
        chrome.tabs.onUpdated.addListener(function(tabId, info) {
                chrome.tabs.get(tabId, function(tab) {
                        var protocol = tab.url.split(":")[0];
                        if (localStorage["muse_shorten_url"] == "shorten_url" && (protocol == "http" || protocol == "https")) {
                                chrome.pageAction.show(tab.id);
                        }
                });
        });

        chrome.extension.onRequest.addListener(function(msg, sender, func) {
                switch (msg.action) {
                        case "checkexpand": {
                                func({status: "ok", expand: localStorage["muse_expand_url"] == "expand_url"});
                                break;
                        }
                        case "checkreplacelink": {
                                func({status: "ok", replace: localStorage["muse_replace_link_text"] == "replace_link_text", size: localStorage["muse_replace_link_size"]});
                                break;
                        }
                        case "clearcache": {
                                linkCache.clear();
                                break;
                        }
                        case "shorten": {
                                var custom = JSON.parse(localStorage["muse_custom_svc"]);
                                shortSvcList["custom"] = {type: "GET", s_url: custom["API URL"], param: custom["Parameters"], dataType: "text", s_proc: function(r,f) { f({status: "ok", url: r}); }};
                                var shortSvc = shortSvcList[msg.svc];
                                var param = (typeof(shortSvc.param) == "string" ? shortSvc.param : shortSvc.param(msg.url))+encodeURIComponent(msg.url);

                                // load credentials into param string
                                if (shortSvc.cred) {
                                        var creds = JSON.parse(localStorage["muse_creds"]);
                                        var cred = creds[msg.svc];
                                        for (var i in shortSvc.cred) {
                                                var c = (cred && cred[shortSvc.cred[i]]) ? cred[shortSvc.cred[i]] : shortSvc.defcred[i];
                                                param = param.replace("%"+shortSvc.cred[i]+"%", c);
                                        }
                                }

                                $.ajax({
                                        type: shortSvc.method,
                                        url: shortSvc.s_url,
                                        data: param,
                                        dataType: shortSvc.dataType,
                                        timeout: 10000,
                                        error: function(xhr, errmsg) {
                                                switch (errmsg) {
                                                        case "timeout": func({status: "error", error: "Timeout connecting to "+msg.svc}); break;
                                                        case "error": func({status: "error", error: "HTTP Status Code: "+xhr.status}); break;
                                                        default: func({status: "error", error: errmsg}); break;
                                                }
                                        },
                                        success: function(r) {
                                                shortSvc.s_proc(r, func);
                                        }
                                });
                                break;
                        }
                        case "expand": {
                                linkCache.get(msg.url, func);
                                break;
                        }
                }
        });
}

// set default options/update options if not present
function checkOptions() {
        var v;

        // display new install message and changelog
        if (compareVersion(curVer, localStorage["muse_saved_ver"]) == 1) {
                localStorage["muse_saved_ver"] = curVer;
//              localStorage["runonce"] = "true";
//              window.open(chrome.extension.getURL("changelog.html"),"muse_install","width=800,height=500");
        }

        v = localStorage["muse_shorten_url"];
        if (v === undefined) localStorage["muse_shorten_url"] = "shorten_url";

        v = localStorage["muse_short_svc"];
        if (v === undefined) localStorage["muse_short_svc"] = defaultSvc;

        v = localStorage["muse_custom_svc"];
        if (v === undefined) localStorage["muse_custom_svc"] = "{}";

        v = localStorage["muse_creds"];
        if (v === undefined) localStorage["muse_creds"] = "{}";
        // check for empty creds from <1.2.6
        v = JSON.parse(localStorage["muse_creds"]);
        for (i in v) {
                for (j in v[i]) {
                        // remove credentials with empty value
                        if (v[i][j] == "")
                                delete v[i][j];
                }
                // remove service with no saved credentials
                if (JSON.stringify(v[i]) == "{}")
                        delete v[i];
        }
        localStorage["muse_creds"] = JSON.stringify(v);

        v = localStorage["muse_advanced"];
        if (v === undefined) localStorage["muse_advanced"] = "undefined";
        // update options from <1.2
        if (v == "true") localStorage["muse_advanced"] = "advanced";

        v = localStorage["muse_adv_list"];
        if (v === undefined) localStorage["muse_adv_list"] = "bit.ly,goo.gl,is.gd,TinyURL";

        v = localStorage["muse_expand_url"];
        if (v === undefined) localStorage["muse_expand_url"] = "expand_url";
        // update options from <1.2
        if (v == "true") localStorage["muse_expand_url"] = "expand_url";

        v = localStorage["muse_adv_buttons"];
        if (v === undefined) localStorage["muse_adv_buttons"] = "adv_buttons";

        v = localStorage["muse_replace_link_text"];
        if (v === undefined) localStorage["muse_replace_link_text"] = "undefined";

        v = localStorage["muse_replace_link_size"];
        if (v === undefined) localStorage["muse_replace_link_size"] = "60";

        v = localStorage["muse_cache_size"];
        if (v === undefined) localStorage["muse_cache_size"] = "1000";
}

checkOptions();
addRequestListener();

