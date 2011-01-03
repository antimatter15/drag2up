function uploadImgur(req, callback){
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
	getBinary(req, function(file){
	  postJSON(https()+"api.imgur.com/2/upload.json", {
      key: Keys.imgur, 
      type: 'base64',
      name: file.name,
      image: btoa(file.data)
    }, function(data){
      if(data){
        callback(data.upload.links.original)
      }else{
        callback('error: could not upload to imgur')
      }
    })
  })
}
