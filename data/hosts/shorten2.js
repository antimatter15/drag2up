/* PLEASE don't look at the source code. it used to be nicely
 * formatted and commented and all, but laziness turned it into the
 * bloat of code you see here D:
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */
 
 /*
 
 HA HA HA HA. I'm looking at your source code!
 */


// some helpers for getting/setting settings
function get(a)
{
    try
    {
        return JSON.parse(localStorage[a]);
    }
    catch(err)
    {
        return null
    }
}
function set(a,b) { localStorage[a] = JSON.stringify(b); }

// the huge hashtable containing all the services. this is horrible, I know D:
services =
{
    "0mk": {
        name: "0.mk",
        url: "http://0.mk",
        account: [ 1, 0, 1 ],
        register: "http://0.mk/registracija",
        category: "normal",
        
        method: "GET",
        api: "http://api.0.mk/v2/skrati",
        args: function(url, user, pass, api)
        {
            ret = { link: url };
            if (user != "" && api != "")
            {
                ret.korisnik = user;
                ret.apikey = api;
            }
            //return "link=" + url + (user != "" && api != "" ? "&korisnik=" + user + "&apikey=" + api + "&": "");
            return ret;
        },
        callback: function (raw, parsed, url, xhr)
        {
            if (parsed.status == 1)
            {
                return { status: true, msg: parsed.kratok };
            }
            else
            {
                return { status: false, msg: parsed.greskaMsg };
            }
            
        },
        format: "json",
    },
    
    "2zeus" : {
        name: "2ze.us",
        url: "http://2ze.us",
        account: [ 0, 0, 0 ],
        category: "normal",
        
        method: "GET",
        api: "http://2ze.us/generate/",
        args: "url=%URL%",
        callback: function (raw, parsed, url, xhr)
        {
            if (parsed.errors)
            {
                return { status: false, msg: parsed.errors[url] };
            }
            return { status: true, msg: parsed.urls[url].shortcut };
        },
        format: "json",
    },
    
    "4ly" : {
        name: "4.ly",
        url: "http://4.ly",
        account: [ 0, 0, 0 ],
        category: "normal",
        
        method: "GET",
        api: "http://4.ly/api/short",
        args: "longurl=%URL%",
        callback: function (raw, parsed, url, xhr)
        {
            if (parsed.error.code == 0)
            {
                return { status: true, msg: parsed.url };
            }
            else
            {
                return { status: false, msg: parsed.error.msg };
            }
            
        },
        format: "json",
    },
    
    armin : {
        name: "arm.in",
        url: "http://arm.in",
        account: [ 0, 0, 0 ],
        register: "http://arm.in/login.php",
        category: "normal",
        
        method: "GET",
        api: "http://arm.in/arminize/",
        args: "%URL%",
        callback: function (raw, parsed, url, xhr)
        {
            if (parsed.getElementsByTagName("error")[0])
            {
                return { status: false, msg: parsed.getElementsByTagName("error")[0].childNodes[0].nodeValue };
            }
            else
            {
                return { status: true, msg: parsed.getElementsByTagName("arminized_url")[0].childNodes[0].nodeValue };
            }
        },
        format: "xml",
    },
    
    bitly: {
        name: "bit.ly",
        url: "http://bit.ly",
        account: [ 1, 0, 1 ],
        register: "http://bit.ly/account/register",
        category: "recommended",
        
        method: "GET",
        api: "http://api.bit.ly/v3/shorten",
        args: "format=json&login=%USER%&apiKey=%API%&longUrl=%URL%",
        callback: function (raw, parsed, url, xhr)
        {
            if (parsed.status_code == 200)
            {
                return { status: true, msg: parsed.data.url };
            }
            else
            {
                return { status: false, msg: parsed.status_txt };
            }
            
        },
        format: "json",
    },
    
    btgd: {
        name: "bt.gd",
        url: "http://bt.gd",
        account: [ 0, 0, 0 ],
        category: "normal",
        
        method: "GET",
        api: "http://bt.gd/shorten",
        args: "url=%URL%",
        callback: function (raw, parsed, url, xhr)
        {
            return { status: raw.substring(0,4) == "http", msg: raw };
        },
        format: "text",
    },
    
    budurl: {
        name: "budurl.com",
        url: "http://budurl.com",
        account: [ 0, 0, 1 ],
        register: "http://budurl.com/?register",
        category: "normal",
        
        method: "GET",
        api: "http://budurl.com/api/v1/budurls/shrink",
        args: function(url, user, pass, api)
        {
            //return "long_url=" + url + (api != "" ? "&api_key=" + api : "");
            
            ret = { "long_url": url };
            if (api != "")
            {
                ret["api_key"] = api;
            }
            return ret;
        },
        callback: function (raw, parsed, url, xhr)
        {
            if (parsed.success == 1)
            {
                return { status: true, msg: parsed.budurl };
            }
            else
            {
                return { status: false, msg: parsed.error_message };
            }
            
        },
        format: "json",
    },
    
    canurl: {
        name: "canurl.com",
        url: "http://canurl.com",
        account: [ 0, 0, 0 ],
        category: "normal",
        
        method: "GET",
        api: "http://canurl.com/api.php",
        args: "url=%URL%",
        callback: function (raw, parsed, url, xhr)
        {
            return { status: raw.substring(0,4) == "http", msg: raw };
        },
        format: "text",
    },
    
    cligs: {
        name: "cli.gs",
        url: "http://cli.gs",
        account: [ 0, 0, 2 ],
        register: "http://cli.gs/user/new",
        category: "recommended",
        
        method: "GET",
        api: "http://cli.gs/api/v1/cligs/create",
        args: function(url, user, pass, api)
        {
            return "url=" + url + (api != "" ? "&key=" + api : "") + "&appid=%3Ca+href%3D%22https%3A%2F%2Fchrome.google.com%2Fextensions%2Fdetail%2Feclilalbnmdonojgjmkekinflhodgoii%22%3EMiniscurl%3C%2Fa%3E";
        },
        callback: function (raw, parsed, url, xhr)
        {
            return { status: raw.substring(0,4) == "http", msg: raw };
        },
        format: "text",
    },
    
    "chilpit" : {
        "name" : "chilp.it",
        "url" : "http://chilp.it",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://chilp.it/api.php",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "cogela" : {
        "name" : "coge.la",
        "url" : "http://coge.la",
        "account" : [ 2, 2, 0 ],
        "register" : "http://coge.la/altausuarios.php",
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://coge.la/api.php",
        "args" : function (url, user, pass, api)
        {
            return "url=" + url + (user != "" && pass != "" ? "&user=" + user + "&password=" + pass : "");
        },
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    godafk: {
        name: "go.dafk.net",
        url: "http://go.dafk.net",
        account: [ 0, 0, 0 ],
        category: "recommended",

        method: "GET",
        api: "http://go.dafk.net/new.php",
        args: "type=json&url=%URL%",
        callback: function (raw, parsed, url, xhr)
        {
            return { status: !(parsed.error), msg: parsed.out };
        },
        format: "json",
    },
    
    "durl" : {
        "name" : "durl.me",
        "url" : "http://durl.me",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",

        "method" : "GET",
        "api" : "http://durl.me/api/Create.do",
        "args" : "longurl=%URL%&type=json",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.status == "ok")
            {
                return { "status" : true, "msg" : parsed.shortUrl };
            }
            else
            {
                return { "status" : false, "msg" : "Error" };
            }
            
        },
        "format" : "json",
    },
    
    "expandurl" : {
        "name" : "ExpandURL",
        "url" : "http://expandurl.appspot.com",
        "account" : [ 0, 0, 0 ],
        "category" : "expansion",
        
        "method" : "POST",
        "api" : "http://expandurl.appspot.com/expand",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            errors = {
                InvalidURL: "Invalid URL!",
                TooManyRedirects: "Too many redirects; redirect loop?",
                InternalError: "Internal error"
            }
            return { status: parsed.status == "OK" && parsed.redirects > 0, "msg" : parsed.status == "OK" ? parsed.redirects == 0 ? "URL Redirects nowhere!" : parsed.end_url : errors[parsed.status] };
        },
        "format" : "json",
    },
    
    "ez" : {
        "name" : "ez.com",
        "url" : "http://ez.com",
        "account" : [ 0, 0, 1 ],
        "register" : "http://ez.com/?register",
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://ez.com/api/v1/ezlinks/shrink",
        "args" : function(url, user, pass, api)
        {
            return "long_url=" + url + (api != "" ? "&api_key=" + api : "");
        },
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.success == 1)
            {
                return { "status" : true, "msg" : parsed.ezlink };
            }
            else
            {
                return { "status" : false, "msg" : parsed.error_message };
            }
            
        },
        "format" : "json",
    },
    
    "foly" : {
        "name" : "fo.ly",
        "url" : "http://fo.ly",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",

        "method" : "GET",
        "api" : "http://api.fo.ly/shorten",
        "args" : "longUrl=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.statusCode == "OK")
            {
                for (var a in parsed.results)
                {
                    if (a.substring(0,5) == "ERROR")
                    {
                        return { "status" : false, "msg" : a };
                    }
                    else
                    {
                        return { "status" : true, "msg" : parsed.results[a].shortUrl };
                    }
                }
            }
            else
            {
                return { "status" : false, "msg" : parsed.errorMessage };
            }
            
        },
        "format" : "json",
    },

    
    "googl" : {
        "name" : "goo.gl",
        "url" : "http://goo.gl",
        "account" : [ 0, 0, 0 ],
        "category" : "recommended",
        
        "method" : "POST",
        "api" : "http://goo.gl/api/url",
        "args" : function(b, user, pass, api)
        {
            b = decodeURIComponent(b);
            function c(){for(var l=0,m=0;m<arguments["length"];m++){l=l+arguments[m]&4294967295;} ;return l;} ;function d(l){l=l=String(l>0?l:l+4294967296);var m;m=l;for(var o=0,n=false,p=m["length"]-1;p>=0;--p){var q=Number(m["charAt"](p));if(n){q*=2;o+=Math["floor"](q/10)+q%10;} else {o+=q;} ;n=!n;} ;m=m=o%10;o=0;if(m!=0){o=10-m;if(l["length"]%2==1){if(o%2==1){o+=9;} ;o/=2;} ;} ;m=String(o);m+=l;return l=m;} ;function e(l){for(var m=5381,o=0;o<l["length"];o++){m=c(m<<5,m,l["charCodeAt"](o));} ;return m;} ;function f(l){for(var m=0,o=0;o<l["length"];o++){m=c(l["charCodeAt"](o),m<<6,m<<16,-m);} ;return m;} ;var h={byteArray_:b,charCodeAt:function (l){return this["byteArray_"][l];} };h["length"]=h["byteArray_"]["length"];var i=e(h["byteArray_"]);i=i>>2&1073741823;i=i>>4&67108800|i&63;i=i>>4&4193280|i&1023;i=i>>4&245760|i&16383;var j="7";h=f(h["byteArray_"]);var k=(i>>2&15)<<4|h&15;k|=(i>>6&15)<<12|(h>>8&15)<<8;k|=(i>>10&15)<<20|(h>>16&15)<<16;k|=(i>>14&15)<<28|(h>>24&15)<<24;j+=d(k);
            return {
                user: "toolbar@google.com",
                url: b,
                auth_token: j
            };
        },
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.short_url)
            {
                return { "status" : true, "msg" : parsed.short_url };
            }
            else
            {
                return { "status" : false, "msg" : parsed.error_message };
            }
        },
        "format" : "json",
    },
    
    "gonetius" : {
        "name" : "go.neti.us",
        "url" : "http://go.neti.us",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://go.neti.us/api.php",
        "args" : "create=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "idek" : {
        "name" : "idek.net",
        "url" : "http://idek.net",
        "account" : [ 0, 0, 0 ],
        "register" : "http://idek.net//userHome/register",
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://idek.net/shorten/",
        "args" : function(url, user, pass, api)
        {
            /* Anchor tag thing not working on their side
            
            if (url.indexOf("#") >= 0)
            {
                return "idek-api=true&idek-ref=Miniscurl&idek-anchortag=" + url.substring(url.indexOf("#") + 1) + "&idek-url=" + url.substring(0, url.indexOf("#"));
            }
            else
            {*/
                return "idek-api=true&idek-ref=Miniscurl&idek-url=" + url;;
            //}
        },
        "callback" : function(raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "ikrme" : {
        "name" : "ikr.me",
        "url" : "http://ikr.me",
        "account" : [ 0, 2, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://iKr.me/api/",
        "args" : function(url, user, pass, id)
        {
            return "url=" + url + (pass != "" ? "&pwd=" + pass : "");
        },
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(6, 10) == "http", "msg" : raw.substring(6,raw.length-2) };
        },
        "format" : "text",
    },
    
    "irpe" : {
        "name" : "ir.pe",
        "url" : "http://ir.pe",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://ir.pe/",
        "args" : "url=%URL%&api=1",
        "callback" : function(raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "isgd" : {
        "name" : "is.gd",
        "url" : "http://is.gd",
        "account" : [ 0, 0, 0 ],
        "category" : "recommended",
        
        "method" : "GET",
        "api" : "http://is.gd/api.php",
        "args" : "longurl=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,5) != "Error", "msg" : raw };
        },
        "format" : "text",
    },
    
    "jmp" : {
        "name" : "j.mp",
        "url" : "http://j.mp",
        "account" : [ 1, 0, 1 ],
        "register" : "http://j.mp/account/register",
        "category" : "recommended",
        
        "method" : "GET",
        "api" : "http://api.j.mp/v3/shorten",
        "args" : "format=json&login=%USER%&apiKey=%API%&longUrl=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.status_code == 200)
            {
                return { "status" : true, "msg" : parsed.data.url };
            }
            else
            {
                return { "status" : false, "msg" : parsed.status_txt };
            }
            
        },
        "format" : "json",
    },
    
    "lnkby" : {
        "name" : "lnk.by",
        "url" : "http://lnk.by",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://lnk.by/Shorten",
        "args" : "url=%URL%&applicationId=miniscurl&format=json",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : parsed.shortUrl.substring(0,4) == "http", "msg" : parsed.shortUrl };
        },
        "format" : "json",
    },
    
    longurl: {
        name: "LongURL.org",
        url: "http://longurl.org",
        account: [ 0, 0, 0 ],
        category: "expansion",
        
        method: "GET",
        api: "http://api.longurl.org/v2/expand",
        args: "url=%URL%&format=json&user-agent=Miniscurl%2F" + VERSION,
        callback: function (raw, parsed, url, xhr)
        {
            if ("long-url" in parsed)
            {
                return { status: true, msg: parsed["long-url"] };
            }
            else if ("messages" in parsed)
            {
                return { status: false, msg: parsed.messages.message }
            }
        },
        format: "json",
    },
    
    "longurlplease" : {
        "name" : "Long URL Please",
        "url" : "http://longurlplease.com",
        "account" : [ 0, 0, 0 ],
        "category" : "expansion",
        
        "method" : "GET",
        "api" : "http://longurlplease.appspot.com/api/v1.1",
        "args" : "q=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : parsed[url] != null, "msg" : parsed[url] };
        },
        "format" : "json",
    },
    
    "metamark" : {
        "name" : "Metamark",
        "url" : "http://metamark.net",
        "account" : [ 0, 0, 0 ],
        "category" : "recommended",
        
        "method" : "GET",
        "api" : "http://metamark.net/api/rest/simple",
        "args" : "long_url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "migre" : {
        "name" : "migre.me",
        "url" : "http://migre.me",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://migre.me/api.xml",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.getElementsByTagName("error")[0].childNodes[0].nodeValue == 0)
            {
                return { "status" : true, "msg" : parsed.getElementsByTagName("migre")[0].childNodes[0].nodeValue };
            }
            else
            {
                return { "status" : false, "msg" : parsed.getElementsByTagName("errormessage")[0].childNodes[0].nodeValue };
            }
        },
        "format" : "xml",
    },
    
    "miudin" : {
        "name" : "miud.in",
        "url" : "http://miud.in",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://miud.in/api-create.php",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "nnnf" : {
        "name" : "nn.nf",
        "url" : "http://nn.nf",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "POST",
        "api" : "http://nn.nf/api.php",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "rurl" : {
        "name" : "rurl.org",
        "url" : "http://rurl.org",
        "account" : [ 0, 0, 1 ],
        "category" : "normal",
        
        "method" : "POST",
        "api" : "http://rurl.org/api/",
        "args" : "url=%URL%&apikey=%API%",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.getElementsByTagName("error")[0])
            {
                return { "status" : false, "msg" : parsed.getElementsByTagName("error")[0].childNodes[0].nodeValue };
            }
            else
            {
                return { "status" : true, "msg" : parsed.getElementsByTagName("url")[0].childNodes[0].nodeValue };
            }
        },
        "format" : "xml",
    },
    
    "s8hk" : {
        "name" : "s8.hk",
        "url" : "http://s8.hk",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://s8.hk/api/shorten",
        "args" : "longUrl=%URL%&source=Miniscurl&format=json",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : true, "msg" : parsed.shortUrl };
            
        },
        "format" : "json",
    },
    
    "safli" : {
        "name" : "saf.li",
        "url" : "http://saf.li",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : " http://saf.li/en/create",
        "args" : "ws=1&url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    samlain:
    {
        name: "samla.in",
        url: "http://samla.in",
        account: [0,0,0],
        category: "normal",
        
        method: "GET",
        api: "http://samla.in/",
        args: "action=api&url=%URL%",
        callback: function(raw, parsed, url, xhr)
        {
            return { status: raw.substring(0,4) == "http", msg: raw }
        },
        format: "text",
    },
    
    "shrim" : {
        "name" : "shr.im",
        "url" : "http://shr.im",
        "account" : [ 1, 0, 1 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://shr.im/api/1.0/post.json",
        "args" : "url_src=%URL%&api_user=%USER%&api_key=%API%",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (raw == "")
            {
                return { "status" : false, "msg" : "Error" };
            }
            else
            {
                return { "status" : true, "msg" : JSON.parse(raw.substring(1, raw.length - 1)).alias };
            }
        },
        "format" : "text",
    },
    
    "slkiru" : {
        "name" : "slki.ru",
        "url" : "http://slki.ru",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://slki.ru/api/add/",
        "args" : "url=%URL%&format=plain",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "smrl" : {
        "name" : "smrl.tk",
        "url" : "http://smrl.tk",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : " http://api.smrls.net/api",
        "args" : "?url=%URL%&domain=smrl.tk",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "tinyarrows" : {
        "name" : "Tinyarrows",
        "url" : "http://tinyarro.ws",
        "account" : [ 0, 0, 0 ],
        "register" : "http://tinyarro.ws/auth/login",
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://tinyarro.ws/api-create.php",
        "args" : "utfpure=1&url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "tinyurl" : {
        "name" : "TinyURL",
        "url" : "http://tinyurl.com",
        "account" : [ 0, 0, 0 ],
        "category" : "recommended",
        
        "method" : "GET",
        "api" : "http://tinyurl.com/api-create.php",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "tllg" : {
        "name" : "tllg.net",
        "url" : "http://tllg.net",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://tllg.net/",
        "args" : "u=%URL%&api=tllgapi",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "turl" : {
        "name" : "turl.ca",
        "url" : "http://turl.ca",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://turl.ca/api.php",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            success = raw.substring(0,7) == "SUCCESS";
            return { "status" : raw.substring(0,7) == "SUCCESS", "msg" : (success ? "http://turl.ca/" + raw.substring(8) : raw.substring(6)) };
        },
        "format" : "text",
    },
    
    "tweetburner" : {
        "name" : "Tweetburner",
        "url" : "http://tweetburner.com",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "POST",
        "api" : "http://tweetburner.com/links",
        "args" : "link[url]=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "twimn" : {
        "name" : "twi.mn",
        "url" : "http://twi.mn",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "POST",
        "api" : "http://twi.mn/api.json",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.error > 0)
            {
                return { "status" : false, "msg" : parsed.message };
            }
            else
            {
                return { "status" : true, "msg" : parsed.url };
            }
        },
        "format" : "json",
    },
    
    "untiny" : {
        "name" : "Untiny",
        "url" : "http://untiny.com",
        "account" : [ 0, 0, 0 ],
        "category" : "expansion",
        
        "method" : "GET",
        "api" : "http://untiny.me/api/1.0/extract",
        "args" : "url=%URL%&format=json",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.error)
            {
                return { "status" : false, "msg" : parsed.error[1] };
            }
            else
            {
                return { "status" : true, "msg" : parsed.org_url };
            }
        },
        "format" : "json",
    },
    
    "unu" : {
        "name" : "u.nu",
        "url" : "http://u.nu",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://u.nu/unu-api-simple",
        "args" : "url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "urlcorta" : {
        "name" : "URL Corta",
        "url" : "http://urlcorta.es",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://urlcorta.es/api/text/",
        "args" : "url=%URL%",
        "callback" : function(raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "urli" : {
        "name" : "urli.nl",
        "url" : "http://urli.nl",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://urli.nl/api.php",
        "args" : "format=json&action=shorturl&url=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            if (parsed.shorturl)
            {
                return { "status" : true, "msg" : parsed.shorturl };
            }
            else
            {
                return { "status" : false, "msg" : parsed.message };
            }
            
        },
        "format" : "json",
    },
    
    "urly" : {
        "name" : "ur.ly",
        "url" : "http://ur.ly",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://ur.ly/new.json",
        "args" : "href=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : xhr.status == 200, "msg" : "http://ur.ly/" + parsed.code };
        },
        "format" : "json",
    },
    
    "voizle" : {
        "name" : "voizle.com",
        "url" : "http://voizle.com",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://api.voizle.com/",
        "args" : "format=json&type=short&u=%URL%",
        "callback" : function(raw, parsed, url, xhr)
        {
            return { "status" : parsed.voizle.success, "msg" : parsed.voizle.voizleurl };
        },
        "format" : "json",
    },
    
    "xr" : {
        "name" : "xr.com",
        "url" : "http://xr.com",
        "account" : [ 2, 0, 0 ],
        "register" : "http://host.xr.com/signup.php",
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://api.xr.com/api",
        "args" : function(url, user, pass, api)
        {
            return "link=" + url + (user != "" ? "&pid=" + user : "");
        },
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
    
    "yanclex" : {
        "name" : "yanclex.com",
        "url" : "http://yanclex.com",
        "account" : [ 0, 0, 0 ],
        "category" : "normal",
        
        "method" : "GET",
        "api" : "http://yanclex.com/url/api.php",
        "args" : "create=%URL%",
        "callback" : function (raw, parsed, url, xhr)
        {
            return { "status" : raw.substring(0,4) == "http", "msg" : raw };
        },
        "format" : "text",
    },
};
