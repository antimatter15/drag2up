//no https
//user requested!

var minusGallery = {};

Hosts.minus = function uploadMinus(file, callback){
  function newGallery(cb){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://min.us/api/CreateGallery", true);
    xhr.onload = function(){
      var info = JSON.parse(xhr.responseText);
      info.time = +new Date;
      minusGallery = info;
      cb();
    }
    xhr.onerror = function(){
      callback('error: min.us could not create gallery')
    }
    xhr.send();
  }
  
  function upload(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://min.us/api/UploadItem");  
    xhr.onload = function(){
    
      callback(link);
    }
    xhr.onerror = function(){
      callback('error: min.us uploading failed')
    }
    xhr.sendMultipart({
      "Body": file
    })
  }
  
  if(minusGallery.time && minusGallery.time > (+new Date) - (1000 * 60 * 10)){
    //keep uploading to the same gallery until 10 minutes of inactivity
    upload();
  }else{
    newGallery(upload)
  }
}
