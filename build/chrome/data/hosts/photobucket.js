function upload(){


  var message = {
	  action: 'http://api.photobucket.com/album/pbapi/upload',
	  method: "POST",
      parameters: [
        	["oauth_token", localStorage.pb_reqToken || 'superfail'],
        	["oauth_consumer_key", '149830906'],
        	["oauth_signature_method", "HMAC-SHA1"],
        	["type", "base64"],
        	["identifier", "pbapi"]
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
  xhr.open(message.method, 'http://api244.photobucket.com/album/pbapi/upload', true);
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





