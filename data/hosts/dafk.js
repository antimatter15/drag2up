//no https
//it looks like a small host, but it's got a good ux

Hosts.dafk = function uploadDAFK(file, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://up.dafk.net/up.php");  
  xhr.onload = function(){
    var json = JSON.parse(xhr.responseText);
    if(json.error){
      callback('error: '+json.msg);
    }else{
      callback({direct: json.msg});
    }
  }
  xhr.onerror = function(){
    callback('error: dafk uploading failed')
  }
  xhr.sendMultipart({
    "uploaded-file": file
  })
}


