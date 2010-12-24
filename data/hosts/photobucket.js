
var message = {
	action: 'http://api.photobucket.com/login/request',
	method: "POST",
    parameters: [
      	["oauth_consumer_key", '149830906'],
      	["oauth_signature_method", "HMAC-SHA1"]
  	]
};

var accessor = {
	consumerSecret: "60a58b565c00487ade4a44850db2e5b5",
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
xhr.send(data);








var bucket = new OAuthSimple('149830906', "60a58b565c00487ade4a44850db2e5b5");
var req = bucket.sign({
  path: 'http://api.photobucket.com/login/request',
  method: 'POST',
  parameters: ''
})

//var p = []; for(var i in req.parameters) p.push(i + '=' + encodeURIComponent(req.parameters[i])); p = p.join('&');
var p = req.signed_url.split('?')[1];

var xhr = new XMLHttpRequest();
xhr.open('POST', 'http://api.photobucket.com/login/request', true);
xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
xhr.send(p);
