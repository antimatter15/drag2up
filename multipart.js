//stolen from mozilla http://demos.hacks.mozilla.org/openweb/imageUploader/js/extends/xhr.js
//http://code.google.com/p/chromium/issues/detail?id=35705#c6
//http://efreedom.com/Question/1-3743047/Uploading-Binary-String-WebKit-Chrome-Using-XHR-Equivalent-Firefoxs-SendAsBinary
XMLHttpRequest.prototype.sendMultipart = function(params) {
  var BOUNDARY = "---------------------------1966284435497298061834782736";
  var rn = "\r\n";

  var req = new BlobBuilder();
  req.append("--" + BOUNDARY);
  
  var file_param = -1;
  
  for (var i in params) {
    req.append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
    if (params[i].data) {
      file_param = i;
    } else {
      req.append(rn + rn + params[i] + rn + "--" + BOUNDARY);
    }
  }
  
  if(file_param != -1){
    var i = file_param;
    var file = params[i];
    //var url = file.data;
    //var base64 = url.substr(url.indexOf(",") + 1);
    //var bin = window.atob(base64);
    var bin = file.data;
    if(window.Int8Array){
      var arr = new Int8Array(bin.length);
      
      for(var i = 0, l = bin.length; i < l; i++){
        arr[i] = bin.charCodeAt(i)
      }

    }else{
      for(var i = 0, l = bin.length; i < l; i++){
        var b = bin.charCodeAt(i);
        if(b > 240){
          //return alert('fail over 240');
        }
      }
    }
    //bb.append(arr.buffer)
    //var blob = bb.getBlob(file.type);

    req.append("; filename=\""+file.name+"\"" + rn + "Content-type: "+file.type);

    req.append(rn + rn);
    req.append(arr.buffer)
    req.append(rn + "--" + BOUNDARY);
  }
  
  req.append("--");

  this.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + BOUNDARY);
  
  this.send(req.getBlob());
};

