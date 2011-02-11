Hosts.yfrog = function uploadyfrog(file, callback){
  function core_upload(){
    var message = {
      action: 'https://api.twitter.com/1/account/verify_credentials.xml',
      method: "GET",
        parameters: [
          	["oauth_consumer_key", Keys.twitter.key],
          	["oauth_signature_method", "HMAC-SHA1"],
          	["oauth_token", localStorage.twitter_token]
      	]
    };

    // Define the accessor
    var accessor = {
      consumerSecret: Keys.twitter.secret,
      tokenSecret: localStorage.twitter_secret
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var auth = OAuth.getAuthorizationHeader("", message.parameters).substr(15);
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://yfrog.com/api/xauth_upload");  
    xhr.setRequestHeader('X-Verify-Credentials-Authorization', auth);
    xhr.setRequestHeader('X-Auth-Service-Provider', 'https://api.twitter.com/1/account/verify_credentials.xml');
    
    xhr.onload = function(){
      console.log(xhr);
      if(xhr.status == 401){
        twitter_login(core_upload);
      }else if(xhr.status == 200){
        var link = xhr.responseXML.getElementsByTagName('image_link');
  	    callback(link[0].childNodes[0].nodeValue);
  	    //also: imageurl element
      }else{
        callback('error: yfrog uploading failed')
      }
    }
    xhr.onerror = function(){
      callback('error: yfrog uploading failed')
    }
    xhr.sendMultipart({
      key: Keys.imageshack,
      media: file,
      username: localStorage.twitter_username
    })
  }
  if(localStorage.twitter_token && localStorage.twitter_secret && localStorage.twitter_username){
    core_upload();
  }else{
    twitter_login(core_upload);
  }
}

