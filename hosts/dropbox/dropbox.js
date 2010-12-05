function uploadDropbox(file, callback){
  //hey! this is a file that has a oauth secret! close your eyes!
  //it probably does not compromise the security for other people to know it
  //but using oauth secrets inside a client app is just wrong. it's sort
  //of an abuse of oauth anyway.
  //<spoiler alert>
  var dropbox = new ModernDropbox("eicw1uywyigukn4", "xkapobwa2r0i8y1");
  //</spoiler alert>
  var poll = function(){
    if(dropbox.isAccessGranted()){
      var fname = Math.random().toString(36).substr(2,4) + '_' + file.name;
      var folder = 'drag2up/'
      dropbox.putFileContents('Public/'+folder + fname, file,
        function(){
          console.log('done uploading');
          //yay done. hopefully
          dropbox.getAccountInfo(function(user){
            console.log('got stuffs now');
            //http://dl.dropbox.com/u/1024307/drag2up/testing.txt
            //console.log(arguments)
            var url = "http://dl.dropbox.com/u/"+user.uid+"/"+folder+fname;
            callback(url)
          })
        });
    }else{
      setTimeout(poll, 300);
    }
  };
  poll();
}
