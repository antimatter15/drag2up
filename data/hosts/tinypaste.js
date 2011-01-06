//no https
Hosts.pastebin = function uploadPastebin(req, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://tinypaste.com/api/create.json");  
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	getText(req, function(file){
  	xhr.send("paste="+encodeURIComponent( file.data  ));
	})
	xhr.onload = function(){

		//callback(xhr.responseText.replace(/^error:/ig,'error:'))
	}
	
}
