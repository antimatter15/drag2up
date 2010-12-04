//magic totally obfuscated key that you shall never see
//39ACEJNQa5b92fbce7fd90b1cb6f1104d728eccb

function uploadImageshack(file, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://www.imageshack.us/upload_api.php");  
	var formData = new FormData();  
	formData.append("key", "39ACEJNQa5b92fbce7fd90b1cb6f1104d728eccb"); 
	var bb = new BlobBuilder();
	bb.append(atob(file.data.replace(/^data.+base64,/i,'')));
	var blob = bb.getBlob();
	formData.append("fileupload", blob);
	xhr.onload = function(){
		
	}
	xhr.send(formData);
}
