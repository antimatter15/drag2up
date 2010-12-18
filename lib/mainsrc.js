const data = require("self").data;
var pageWorkers = require("page-worker");
var pageMod = require("page-mod");
var XMLHttpRequest = require("xhr").XMLHttpRequest;
XMLHttpRequest.prototype.__defineSetter__('onload', function(cb){
  console.log('set onload');
  this.onreadystatechange = function(){
    if(this.readyState == 4){
      console.log('firing clalack');
      cb();
    }
  }
})

function btoa(input) {
	var output = "", i = 0, l = input.length,
	key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	while (i < l) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) enc3 = enc4 = 64;
		else if (isNaN(chr3)) enc4 = 64;
		output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
	}
	return output;
}

function atob(input){
  var output = "", i = 0, l = input.length,
	key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	while (i < l) {
		enc1 = key.indexOf(input.charAt(i++));
		enc2 = key.indexOf(input.charAt(i++));
		enc3 = key.indexOf(input.charAt(i++));
		enc4 = key.indexOf(input.charAt(i++));
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
		output = output + String.fromCharCode(chr1);
		if (enc3 != 64) output = output + String.fromCharCode(chr2);
		if (enc4 != 64) output = output + String.fromCharCode(chr3);
	}
	return output;
}


pageMod.PageMod({
  include: "*",
  contentScriptWhen: 'ready',
  contentScriptFile: data.url("drag2up.js"),
  onAttach: function(worker){
    console.log('onAttach was triggered');
    worker.on('message', function(data) {
      console.log('got message on the pagemod');
      console.log(data);
      
      handleRequest(JSON.parse(data), 42, function(r){
        console.log('super done processing stuffs');
        console.log(r)
        worker.postMessage(JSON.stringify(r));
      })
      
    });
  }
});

var simpleStorage = require("simple-storage");
var localStorage = simpleStorage.storage;
