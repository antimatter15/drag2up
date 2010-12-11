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

  // Constants for various album types.
  var PICASA = 'picasa';
  var ALBUM_TYPE_STRING = {
    'picasa': 'Picasa Web Albums'
  };
  
  OAUTH.authorize(function() {
  OAUTH.sendSignedRequest(
    'http://picasaweb.google.com/data/feed/api/' +
    'user/default/albumid/' + albumId,
    complete,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        'Slug': data.srcUrl
      },
      parameters: {
        alt: 'json'
      },
      body: builder.getBlob('image/png')
    }
  );
});
}
