//uses multipart helper function.


function uploadDropbox(req, callback){

var dropbox = new ModernDropbox(Keys.dropbox.key, Keys.dropbox.secret)

  
  var poll = function(){
    if(dropbox.isAccessGranted()){
      getRaw(req, function(file){
        var fname = Math.random().toString(36).substr(2,4) + '/' + file.name;
        var folder = 'drag2up/'
        dropbox.putFileContents('Public/'+folder + fname, file,
          function(){
            console.log('done uploading');
            //yay done. hopefully
            dropbox.getAccountInfo(function(user){
              console.log('got stuffs now');
              //http://dl.dropbox.com/u/1024307/drag2up/testing.txt
              //console.log(arguments)
              var url = https()+"dl.dropbox.com/u/"+user.uid+"/"+folder+fname;
              callback(url)
            })
          });
      })
    }else{
      setTimeout(poll, 300);
    }
  };
  poll();
  
  
}
