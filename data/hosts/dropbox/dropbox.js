//uses multipart helper function.


Hosts.dropbox = function uploadDropbox(req, callback){
  var dropbox = new ModernDropbox(Keys.dropbox.key, Keys.dropbox.secret)

  var poll = function(){
    if(dropbox.isAccessGranted()){
      getRaw(req, function(file){
        var fname =  file.name;
        var folder = 'drag2up/'
        
        dropbox.getAccountInfo(function(user){
        dropbox.getDirectoryMetadata('Public/'+folder + encodeURIComponent(file.name), function(json){
          if(json.error && json.error.indexOf('not found') != -1){
            //yay plop it on the top
          }else{
            fname = Math.random().toString(36).substr(2,4) + '_' + fname;
          }
          
          
        dropbox.putFileContents('Public/'+folder + fname, file,
          function(){
            console.log('done uploading');
            //yay done. hopefully
              console.log('got stuffs now');
              //http://dl.dropbox.com/u/1024307/drag2up/testing.txt
              //console.log(arguments)
              var url = https()+"dl.dropbox.com/u/"+user.uid+"/"+folder+fname;
              callback({direct: url})
          });
        })
          
          })
          
      })
    }else{
      setTimeout(poll, 300);
    }
  };
  poll();
  
  
}
