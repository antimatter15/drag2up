function uploadImgur(file, callback){
	function postJSON(url, data, callback){
	  var xhr = new XMLHttpRequest();
	  xhr.open("POST", url);  
	  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	  xhr.send(Object.keys(data).map(function(i){
		return i+'='+encodeURIComponent(data[i]);
	  }).join('&'));
	  xhr.onreadystatechange = function () {
		if(this.readyState == 4) {
		  if(this.status == 200) {
			var stuff = JSON.parse(xhr.responseText);
			callback(stuff)
		  } else {
			callback(null);
		  }
		}
	  };
	}
	postJSON(https()+"api.imgur.com/2/upload.json", {
        key: '390230bc94c4cc1354bcdb2dae0b9afd', /*should i invent a meaningless means of obfuscating this? no.*/
        type: 'base64',
        name: file.name,
        image: file.data.replace(/^data.+base64,/i,'')
      }, function(data){
        if(data){
          callback(data.upload.links.original)
        }else{
          callback('error: could not upload to imgur')
        }
      })
}
