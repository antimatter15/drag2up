//magic totally obfuscated key that you shall never see
//39ACEJNQa5b92fbce7fd90b1cb6f1104d728eccb



function uploadImageshack(file, callback){
  var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://www.imageshack.us/upload_api.php");  
	xhr.onload = function(){

	}
	xhr.sendMultipart({
	  key: "39ACEJNQa5b92fbce7fd90b1cb6f1104d728eccb",
	  fileupload: file
	})
}
