//no https
//it looks like a small host, but it's got a good ux
//per user request, but no clue if there's an official API

function uploadSnelhest(file, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://upload.snelhest.org/?p=upload");  
  xhr.onload = function(){
    try{
      var link = xhr.responseText.match(/"(.*?u.snelhest.org\/i.*?)"/)[1];
    }catch(err){
      return callback('error: snelhest uploading failed')
    }
    callback(link);
  }
  xhr.onerror = function(){
    callback('error: snelhest uploading failed')
  }
  xhr.sendMultipart({
    "file": file
  })
}
