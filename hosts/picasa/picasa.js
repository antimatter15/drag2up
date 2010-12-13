function uploadPicasa(req, callback){
  var OAUTH = ChromeExOAuth.initBackgroundPage({
    'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
    'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
    'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
    'consumer_key' : 'anonymous',
    'consumer_secret' : 'anonymous',
    'scope' : 'http://picasaweb.google.com/data/',
    'app_name' : 'drag2up'
  });
  
  OAUTH.callback_page = "hosts/picasa/chrome_ex_oauth.html";

  // Constants for various album types.
  var PICASA = 'picasa';
  var ALBUM_TYPE_STRING = {
    'picasa': 'Picasa Web Albums'
  };
  
  
  function complete(resp, xhr){
    window.PRESP = resp;
    window.PXHR = xhr;
    console.log(resp, xhr);
  }
  
  getRaw(req, function(file){
    var builder = new BlobBuilder();
    var bin = file.data;
    var arr = new Uint8Array(bin.length);
    for(var i = 0, l = bin.length; i < l; i++){
      arr[i] = bin.charCodeAt(i)
    }
    builder.append(arr.buffer);
    
    OAUTH.authorize(function() {
      console.log("yay authorized");
      OAUTH.sendSignedRequest(
        'http://picasaweb.google.com/data/feed/api/' +
        'user/default/albumid/' + albumId,
        complete,
        {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
            'Slug': data.srcUrl
          },
          parameters: {
            alt: 'json'
          },
          body: builder.getBlob(file.type)
        }
      );
    });
  });
}
