
function createAlbum(){


  var message = {
	  action: 'http://api.photobucket.com/album/',
	  method: "GET",
    parameters: [
      ["format", "json"],
    	["oauth_token", localStorage.pb_reqToken || 'superfail'],
    	["oauth_consumer_key", '149830906'],
    	["oauth_signature_method", "HMAC-SHA1"]
  	]
  };

  var accessor = {
	  consumerSecret: "60a58b565c00487ade4a44850db2e5b5",
	  tokenSecret: localStorage.pb_tokenSecret || 'willfail'
  };
		
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  var xhr = new XMLHttpRequest();
  var data = message.parameters.map(function(e){return e[0]+'='+encodeURIComponent(e[1])}).join('&');
  xhr.open(message.method, 'http://api.photobucket.com/album/?'+data, true);
  xhr.send(null);

}


function upload(){


  var message = {
	  action: 'http://api.photobucket.com/album/antimatter15/upload',
	  method: "POST",
      parameters: [
        	["oauth_token", localStorage.pb_reqToken || 'superfail'],
        	["oauth_consumer_key", '149830906'],
        	["oauth_signature_method", "HMAC-SHA1"],
        	["type", "base64"],
        	["identifier", "drag2up"]
    	]
  };

  var accessor = {
	  consumerSecret: "60a58b565c00487ade4a44850db2e5b5",
	  tokenSecret: localStorage.pb_tokenSecret || 'willfail'
  };
		
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  var xhr = new XMLHttpRequest();
  function params(obj){
    var str = [];
    for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
    return str.join('&');
  }
  var obj = OAuth.getParameterMap(message.parameters);
  obj.uploadfile = img;
  
  var data =  params(obj);
  xhr.open(message.method, message.action+'?'+data, true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  
  xhr.send(data);
  
  xhr.onload = function(){
    if(xhr.status == 401){
      //do authentication again. unauth
    }else if(xhr.status == 404){
      //album doesnt exist create album
    }
  }

}



var message = {
	action: 'http://api.photobucket.com/login/request',
	method: "POST",
    parameters: [
      	["oauth_consumer_key", '149830906'],
      	["oauth_signature_method", "HMAC-SHA1"]
  	]
};

var accessor = {
	consumerSecret: "60a58b565c00487ade4a44850db2e5b5"
};
		
OAuth.setTimestampAndNonce(message);
OAuth.SignatureMethod.sign(message, accessor);

var xhr = new XMLHttpRequest();
function params(obj){
  var str = [];
  for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
  return str.join('&');
}

var data =  params(OAuth.getParameterMap(message.parameters));
xhr.open(message.method, message.action, true);
xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
xhr.send(data);


function init(){
  console.log('totally done');
}


xhr.onload = function(){
  var reqToken=xhr.responseText.match(/(oauth_token=)([^&]*)/)[0];
  localStorage.pb_reqToken = xhr.responseText.match(/(oauth_token=)([^&]*)/)[2];
  
  var tokenSecret=xhr.responseText.match(/(oauth_token_secret=)([^&]*)/)[2];
  localStorage.pb_tokenSecret = tokenSecret;
  
  var url = 'http://photobucket.com/apilogin/login?'+reqToken;
  console.log(url);
  
  if(typeof chrome != 'undefined'){
    chrome.tabs.create({
      url: url
    }, function(tab){
      var poll = function(){
        chrome.tabs.get(tab.id, function(info){
          if(info.url.indexOf('apilogin/done') != -1){
            chrome.tabs.remove(tab.id);
            init();
          }else{
            setTimeout(poll, 100)
          }
        })
      };
      poll();
    })
  }else if(typeof tabs != 'undefined'){
    tabs.open({
      url: url,
      onOpen: function(tab){
        var poll = function(){
          if(tab.url.indexOf('apilogin/done') != -1){
            tab.close()
            init();
          }else{
            setTimeout(poll, 100)
          }
        };
        poll();
      }
    })
  }
}






//http://mmondora.mondora.com/2008/05/quick-and-dirty-photobucket-access.html
var consumer_secret ="149830906";
var consumer_key="60a58b565c00487ade4a44850db2e5b5";

function getAlbums( user, album ) {
var url = "http://api.photobucket.com/album/";

url = url + encodeURIComponent( user + "/" + album )
var json = callPhotobucket( url, "format=json" );

}

function getTag( media ) {
var url = "http://api.photobucket.com/media/";

url = url + encodeURIComponent( media ) + "/tag" ;
var json = callPhotobucket( url, "format=json" );
}

function getTimestamp() {
var timestamp = new Date().valueOf();
timestamp = timestamp / 1000;
timestamp = Math.ceil( timestamp );
return timestamp;
}

function ping() {
auth_url = callPhotobucket( "http://api.photobucket.com/ping", "format=json" );
}

function callPhotobucket( url, format ) {
try {
if( url == undefined ) {
url = "http://api.photobucket.com/ping";
}

if( format == undefined ) {
format = "format=json";
}

var timestamp = getTimestamp();
auth_nonce="nonce" + timestamp;

auth_method = "HMAC-SHA1";
auth_timestamp = "" + timestamp;

auth_version="1.0";

auth_consumer = "&oauth_consumer_key="+ encodeURIComponent( consumer_key );
nonce = "&oauth_nonce="+ encodeURIComponent( auth_nonce );
auth_sig_method = "&oauth_signature_method="+ encodeURIComponent( auth_method );
auth_timestamp = "&oauth_timestamp="+ encodeURIComponent( auth_timestamp );
version = "&oauth_version=" + encodeURIComponent( auth_version );

paramstring = format + auth_consumer + nonce + auth_sig_method + auth_timestamp + version;

method = "GET";

base = encodeURIComponent( method ) + "&" +
encodeURIComponent( url ) + "&" +
encodeURIComponent( paramstring );

sig_hash = getSignature( consumer_secret+"&", base );
auth_sign = "&oauth_signature=" + sig_hash;

auth_url = url + "?" + paramstring + "&" + auth_sign;
alert( ""+ auth_url+"");
return auth_url;
}
catch (err) {
alert( "Error " + err );
}
}

function getSignature(key, baseString) {
b64pad = '=';
var signature = b64_hmac_sha1(key, baseString);
return signature;
} 





