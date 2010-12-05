//stolen from mozilla http://demos.hacks.mozilla.org/openweb/imageUploader/js/extends/xhr.js
XMLHttpRequest.prototype.sendMultipart = function(params) {
  var BOUNDARY = "---------------------------1966284435497298061834782736";
  var rn = "\r\n";

  var req = "--" + BOUNDARY;

  for (var i in params) {
    req += rn + "Content-Disposition: form-data; name=\"" + i + "\"";
    if (typeof params[i] != "string") {
      var file = params[i];
      var url = file.data;
      var base64 = url.substr(url.indexOf(",") + 1);
      var bin = window.atob(base64);
      req += "; filename=\""+file.name+"\"" + rn + "Content-type: "+file.type;

      req += rn + rn + bin + rn + "--" + BOUNDARY;
    } else {
      req += rn + rn + params[i] + rn + "--" + BOUNDARY;
    }
  }
  req += "--";

  this.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + BOUNDARY);
  this.send(req);
};
