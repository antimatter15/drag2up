//stolen from mozilla http://demos.hacks.mozilla.org/openweb/imageUploader/js/extends/xhr.js
//http://code.google.com/p/chromium/issues/detail?id=35705#c6
//http://efreedom.com/Question/1-3743047/Uploading-Binary-String-WebKit-Chrome-Using-XHR-Equivalent-Firefoxs-SendAsBinary
//this is a mutilated sendMultipart function. BEWARE!

XMLHttpRequest.prototype.sendMultipart = function(params) {
  var BOUNDARY = "---------------------------1966284435497298061834782736";
  var rn = "\r\n";
  console.log(params)
  
  var binxhr = !!this.sendAsBinary;
  if(binxhr){
    var req = '', append = function(data){req += data}
  }else{
    var req = new BlobBuilder(), append = function(data){req.append(data)}
  }
  
  append("--" + BOUNDARY);
  
  var file_param = -1;
  var xhr = this;
  
  for (var i in params) {
    if (typeof params[i] == "object") {
      file_param = i;
    } else {
      append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
      append(rn + rn + params[i] + rn + "--" + BOUNDARY);
    }
  }
  
  var i = file_param;
  
  append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
  
  getURL(binxhr?'binary':'raw',params[i], function(file){ //Uint8 does clamping, but sendAsBinary doesn't
    console.log('actual data entity', file);
    

    append("; filename=\""+file.name+"\"" + rn + "Content-type: "+file.type);

    append(rn + rn);

    if(binxhr){
      append(file.data);
    }else{
      var bin = file.data
      var arr = new Uint8Array(bin.length);
      for(var i = 0, l = bin.length; i < l; i++)
        arr[i] = bin.charCodeAt(i);
      
      append(arr.buffer)
    }
    append(rn + "--" + BOUNDARY);
  
    append("--");


    xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + BOUNDARY);
    
    if(binxhr){
      xhr.sendAsBinary(req);
    }else{
      superblob = req.getBlob();
      xhr.send(req.getBlob());
    }
  });
};
