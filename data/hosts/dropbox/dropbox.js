//uses multipart helper function.


function uploadDropbox(req, callback){
  var rant = "hey! this is a file that has a oauth secret! close your eyes!'"+
  "OAuth is a pretty bad idea anyway, ESPECIALLY for apps that '"+
  "run on hardware. It's a really stupid idea to use OAuth on any'"+
  "desktop or mobile application. Running the strings command on'"+
  "the executable you pull from /var/mobile/Applications on a developer'"+
  "or jailbroken iPhone is all you need to take those oh so precious'"+
  '"secrets". But this whole ridiculous "security through obscurity" '+
  "approach still seems very prevalent.'";

  //<spoiler alert>

var key = [1.5522799247268875, 1.561705668129837, 1.5532542667374942, 1.5601584302193552, 1.5405025668761214, 1.5623931632472496, 1.5526165117219184, 1.5609927193156006, 1.5624631863547607, 1.5610878939607877, 1.560380036863927, 1.5604874136486533, 1.5609927193156006, 1.5599271896176263, 1.5625320521352455, 1.5519306407732258, 1.5606956602095747, 1.5599271896176263, 1.562599789044984, 1.5611812384951942, 1.5601584302193552, 1.561705668129837, 1.5624631863547607, 1.561705668129837, 1.562599789044984, 1.5522799247268875, 1.5624631863547607, 1.5607966601082315, 1.5601584302193552, 1.5613626443888957, 1.5551725981744198];

key = key.slice(+!1).reverse().map(function(e,i){
var w = window,W=['Math','round','tan',42,6,'String','fromCharCode'];
var d = w[W[0]][W[1]](w[W[0]][W[2]](e));
var c = ((d-W[3]+((W[3]/(+!(W-w)-(-(+!(W-w)))))-W[3]/W[4]))^W[3])+(+!(w-w));
return w[W[5]][W[6]](c);
}).join('');
var dropbox = new ModernDropbox(key.substr(1,key.charCodeAt(0)),key.substr(key.charCodeAt(0)+1))

  //</spoiler alert>
  
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
