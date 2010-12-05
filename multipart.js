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
      var bin = window.atob(base64).split('').map(function(x){
        return String.fromCharCode(x.charCodeAt(0) & 0xff)
      }).join('');
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


function ajaxMultipart(url, parameters) {
    var _xhr = new XMLHttpRequest();
		_xhr.open("POST", url, true);
		
		var boundary = '---------------------------';
		boundary += Math.floor(Math.random() * 32768);
		boundary += Math.floor(Math.random() * 32768);
		boundary += Math.floor(Math.random() * 32768);
		_xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
	
		var body = '';

		for (i in parameters) {
			if(typeof parameters[i][1] == 'string'){
			  body += '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="';
			  body += parameters[i][0];
			  body += '"\r\n\r\n';
			  body += parameters[i][1];
			  body += '\r\n';
			}else{
        var file = parameters[i][1];
		    body += '--' + boundary + "\r\n";
		    body += 'Content-Disposition: form-data; name="'+parameters[i][0]+'"; filename="' + file.name + '"\r\n';
		    body += "Content-type: "+file.type+"\r\n\r\n";
		    body += atob(file.data.replace(/^data.+base64,/i,''));
		    body += "\r\n";
			}
		}

		
		body += '--' + boundary + '--';
		
		_xhr.onreadystatechange = function() {
			console.log(_xhr);
		}
		
		_xhr.send(body);
	}
