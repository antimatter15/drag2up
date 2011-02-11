//based on ChromeMuse GPLv3


function shorten(svc, url, func){
  var shortSvc = shortSvcList[svc];
  var param = (typeof(shortSvc.param) == "string" ? shortSvc.param : shortSvc.param(url))+encodeURIComponent(url);

  // load credentials into param string
  if (shortSvc.cred) {
          for (var i in shortSvc.cred) {
                  var c = shortSvc.defcred[i];
                  param = param.replace("%"+shortSvc.cred[i]+"%", c);
          }
  }

  var xhr = new XMLHttpRequest();
  
  
  if(shortSvc.method.toLowerCase() == 'post'){
    xhr.open(shortSvc.method, shortSvc.s_url, true);
  	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  }else{
    xhr.open(shortSvc.method, shortSvc.s_url + '?' + param, true);
  }

  xhr.onerror = function(){
   func({status: "error", error: "HTTP Status Code: "+xhr.status})
  }
  
  xhr.onload = function(){
      var r = xhr.responseText;
      if(shortSvc.dataType == 'json'){
        r = JSON.parse(r);
      }
     shortSvc.s_proc(r, func);
  }
  xhr.send(param);
  /*
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
  */
}


/// URL Shortening Services


var shortSvcList = {
"goo.gl": {
                method: "POST",
                s_url: "http://goo.gl/api/shorten",
                param: "url=",
                dataType: "json",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r.short_url});
        }},
        "bit.ly": {
                method: "GET",
                s_url: "http://api.bit.ly/shorten",
                param: "version=2.0.1&history=1&login=%API Login%&apiKey=%API Key%&longUrl=",
                cred: ["API Login", "API Key"],
                defcred: ["drag2up", "R_4eabbd16b41219259f86122d74d1c5e0"],
                reg_url: "http://bit.ly/account/register",
                dataType: "json",
                s_proc: function(r,f) {
                        for (var r1 in r.results) {
                                var r2 = r.results[r1];
                                break;
                        }
                        f(r2 ? {status: "ok", url: r2.shortUrl}: {status: "error", error: r.errorMessage});
        }},
"is.gd": {
                method: "GET",
                s_url: "http://is.gd/api.php",
                param: "longurl=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        "j.mp": {
                method: "GET",
                s_url: "http://api.j.mp/shorten",
                param: "version=2.0.1&history=1&login=%API Login%&apiKey=%API Key%&longUrl=",
                cred: ["API Login", "API Key"],
                defcred: ["drag2up", "R_4eabbd16b41219259f86122d74d1c5e0"],
                reg_url: "http://j.mp/account/register",
                dataType: "json",
                s_proc: function(r,f) {
                        for (var r1 in r.results) {
                                var r2 = r.results[r1];
                                break;
                        }
                        f(r2 ? {status: "ok", url: r2.shortUrl}: {status: "error", error: r.errorMessage});
        }},/*
        "ow.ly": {
                method: "GET",
                s_url: "http://slki.ru/api/add/",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},*/
        "tinyurl": {
                method: "GET",
                s_url: "http://tinyurl.com/api-create.php",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        "0rz.tw": {
                method: "GET",
                s_url: "http://0rz.tw/createget",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
		/*
        "3.ly": {
                method: "GET",
                s_url: "http://3.ly/",
                param: "api=em5893833&u=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        */
        "chilp.it": {
                method: "GET",
                s_url: "http://chilp.it/api.php",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        
        "iKr.me": {
                method: "GET",
                s_url: "http://ikr.me/api/",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        
        "tllg.net": {
                method: "GET",
                s_url: "http://tllg.net/",
                param: "api=tllgapi&u=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        "ur1.ca": {
                method: "POST",
                s_url: "http://ur1.ca/",
                param: "longurl=",
                dataType: "html",
                s_proc: function(r,f) {
                        r1 = r.match(/Your ur1 is: <a href="(http:\/\/ur1\.ca\/.+)">/i);
                        f(r1 ? {status: "ok", url: r1[1]} : {status: "error", error: r.match(/<p .lass="error">([^<]+)<\/p>/i)});
        }},
        "voizle": {
                method: "GET",
                s_url: "http://api.voizle.com",
                param: "format=json&crawl=no&type=short&u=",
                dataType: "json",
                s_proc: function(r,f) {
                        f((r.voizle !== undefined && r.voizle.success) ? {status: "ok", url: r.voizle.voizleurl} : {status: "error", error: "Error shortening URL."});
        }}
};
