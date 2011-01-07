/*
 * uploadPastebin({data:btoa('hello world')},function(url){console.log(url)})
 * http://pastebin.com/x43mgnhf
 * */
 //no https
Hosts.pastebin = function uploadPastebin(req, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://pastebin.com/api_public.php");  
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	getText(req, function(file){
  	xhr.send("paste_code="+encodeURIComponent( file.data  ));
	})
	xhr.onload = function(){
		callback(xhr.responseText.replace(/^error:/ig,'error:'))
	}
	
}
