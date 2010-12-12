//stolen from mozilla http://demos.hacks.mozilla.org/openweb/imageUploader/js/extends/xhr.js
//http://code.google.com/p/chromium/issues/detail?id=35705#c6
//http://efreedom.com/Question/1-3743047/Uploading-Binary-String-WebKit-Chrome-Using-XHR-Equivalent-Firefoxs-SendAsBinary
XMLHttpRequest.prototype.sendMultipart = function(params) {
  var BOUNDARY = "---------------------------1966284435497298061834782736";
  var rn = "\r\n";
  console.log(params)
  var req = new BlobBuilder();
  req.append("--" + BOUNDARY);
  
  var file_param = -1;
  var xhr = this;
  
  for (var i in params) {
    if (typeof params[i] == "object") {
      file_param = i;
    } else {
      req.append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
      req.append(rn + rn + params[i] + rn + "--" + BOUNDARY);
    }
  }
  
    var i = file_param;
    
    req.append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
    
    getRaw(params[i], function(file){
      console.log('actual data entity', file);
      
      //file.data = 'blah blah'
      
      var bin = file.data
      var arr = new Uint8Array(bin.length);
      for(var i = 0, l = bin.length; i < l; i++){
        arr[i] = bin.charCodeAt(i)
      }

      //bb.append(arr.buffer)
      //var blob = bb.getBlob(file.type);
      req.append("; filename=\""+file.name+"\"" + rn + "Content-type: "+file.type);

      req.append(rn + rn);
      req.append(arr.buffer)
      req.append(rn + "--" + BOUNDARY);
    
      req.append("--");


      xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + BOUNDARY);
      superblob = req.getBlob();
      xhr.send(req.getBlob());
    });
};
