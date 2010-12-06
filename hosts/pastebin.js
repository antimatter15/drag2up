/*
 * uploadPastebin({data:btoa('hello world')},function(url){console.log(url)})
 * http://pastebin.com/x43mgnhf
 * */
 //no https
function uploadPastebin(file, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://pastebin.com/api_public.php");  
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.send("paste_code="+encodeURIComponent(atob(file.data.replace(/^data.+base64,/i,''))));
	xhr.onload = function(){
		callback(xhr.responseText.replace(/^error:/ig,'error:'))
	}
}
