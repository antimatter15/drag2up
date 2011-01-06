/*
  do not venture below, i hate this.
  wont bother seeing if https works
*/
var PicasaOAUTH = ChromeExOAuth.initBackgroundPage({
  'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key' : 'anonymous',
  'consumer_secret' : 'anonymous',
  'scope' : 'http://picasaweb.google.com/data/',
  'app_name' : 'drag2up'
});


Hosts.picasa = function uploadPicasa(req, callback){
  // Constants for various album types.
  var PICASA = 'picasa';
  var ALBUM_TYPE_STRING = {
    'picasa': 'Picasa Web Albums'
  };
  
  
  function complete(resp, xhr){
    var prs = JSON.parse(resp);
    console.log(resp, xhr);
    var href = prs.entry.link.filter(function(e){return e.type.indexOf('image/') == 0})[0].href
    callback(href);
    
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
      
      
      
       PicasaOAUTH.sendSignedRequest(
        'http://picasaweb.google.com/data/feed/api/user/default',
        function(resp, xhr) {
          if (!(xhr.status >= 200 && xhr.status <= 299)) {
            alert('Error: Response status = ' + xhr.status +
                  ', response body = "' + xhr.responseText + '"');
            return;
          }
          var jsonData = JSON.parse(resp);
          var albums = []
          var msg = "Please select an album to upload to (enter the number): \n"
          for(var index = 0; index < jsonData.feed.entry.length; index++){
            var entryData = jsonData.feed.entry[index];
            albums[1+index] = {id: entryData['gphoto$id']['$t'], title: entryData.title['$t']};
            msg += (1+index) + ' - ' + entryData.title['$t'] + '\n';
          }
          var num = parseInt(prompt(msg));
          if(albums[num] && num){
            var albumId = albums[num].id;
            
            
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
        
        
        
          }else if(num){
            alert('invalid album selection');
          }
          
        },
        {method: 'GET', parameters: {'alt': 'json'}})
    
    
    
      /*

        */
    });
  });
}
