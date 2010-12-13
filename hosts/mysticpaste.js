//https://github.com/kinabalu/mysticpaste/blob/master/idea-plugin/src/com/mysticcoders/mysticpaste/plugin/PastebinAction.java
//no https
function uploadMysticpaste(req, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://www.mysticpaste.com/servlet/plugin");  
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.onload = function(){
	  callback("http://www.mysticpaste.com/view/"+xhr.responseText);
	}
	getText(req, function(file){
  	xhr.send("content="+encodeURIComponent( file.data  ));
	})
}
