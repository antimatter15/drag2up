var PicasaOAUTH = ChromeExOAuth.initBackgroundPage({
  'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key' : 'anonymous',
  'consumer_secret' : 'anonymous',
  'scope' : 'http://picasaweb.google.com/data/',
  'app_name' : 'drag2up'
});


function uploadPicasa(req, callback){

  //PicasaOAUTH.callback_page = "hosts/picasa/chrome_ex_oauth.html";

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
    
    PicasaOAUTH.authorize(function() {
      console.log("yay authorized");
      
      
      
  var postdata = "<entry xmlns='http://www.w3.org/2005/Atom' xmlns:media='http://search.yahoo.com/mrss/' xmlns:gphoto='http://schemas.google.com/photos/2007'>"+
  "<title type='text'>drag2up album</title>"+
  "<summary type='text'>Public images uploaded from drag2up.</summary>"+
  "<gphoto:access>public</gphoto:access>"+
  "<gphoto:timestamp>"+(+new Date)+"</gphoto:timestamp>"+
  "<media:group><media:keywords>drag2up</media:keywords></media:group>"+
  "</entry>";
  PicasaOAUTH.sendSignedRequest(
  'http://picasaweb.google.com/data/feed/api/user/default/',
  function(){
    console.log('done creating album', arguments);
  },
  {
    method: 'POST',
    parameters: {
      alt: 'json'
    },
    body: postdata
  });
  
      /*
      PicasaOAUTH.sendSignedRequest(
        'http://picasaweb.google.com/data/feed/api/' +
        'user/default/albumid/'+albumId,
        complete,
        {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
            'Slug': file.name
          },
          parameters: {
            alt: 'json'
          },
          body: builder.getBlob(file.type)
        });
        */
    });
  });
}
