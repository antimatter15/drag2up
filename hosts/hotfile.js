function uploadHotfile(file, callback){
//http://api.hotfile.com/?action=getuploadserver

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://api.hotfile.com/?action=getuploadserver");  
	xhr.send();
	xhr.onload = function(){
		var post_url = 'http://'+xhr.responseText.trim()+'/upload.cgi?'+(+new Date);
		
		
	  var xhr2 = new XMLHttpRequest();
	  xhr2.open("POST", post_url);  
	  /*
	  var formData = new FormData();  
	
	  //var file = imgtest;
	  var bb = new BlobBuilder(file.type);
	  var bin = atob(file.data.replace(/^data.+base64,/i,''));
	  var arr = new Int8Array(bin.length);
	  for(var i = 0, l = bin.length; i < l; i++){
	    arr[i] = bin.charCodeAt(i)
	  }
	
	  bb.append(arr.buffer)
	  var blob = bb.getBlob(file.type);
	
	  blob.name = file.name;
	  formData.append("uploads[]", blob);
	  formData.append("iagree", "on"); 
	  xhr2.onload = function(){
		  var url = xhr.responseText.match(/value="(http.*?)"/);
		  if(url){
		    //xx2 = xhr2;
		    callback(url[1])
		  }
		  
	  }
	  xhr2.onerror = function(){
	    callback('error: hotfile hosting error')
	  }
	  xhr2.send(formData);
		*/
		xhr2.onload = function(){
		  var url = xhr2.responseText.match(/value="(http.*?)"/);
		  if(url){
		    //xx2 = xhr2;
		    callback(url[1])
		  }
		  console.log(xhr2, url)
	  }
		xhr2.sendMultipart({
		  iagree: 'on',
		  'uploads[]': file
		})
		
	}
	xhr.onerror = function(){
	  callback('error: hotfile could not get upload server');
	}
	
}
