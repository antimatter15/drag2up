/*
  Thanks so much to the chemical servers hosting for this!
  Designed the API myself, wrote the hosting code too.
*/
//no https
Hosts.chemical = function uploadChemical(req, callback){
  //http://files.chemicalservers.com/api.php
  var api_url = "http://files.chemicalservers.com/api.php";
  var download_url = "http://files.chemicalservers.com/download.php";
  
  function params(obj){
    var str = [];
    for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
    return str.join('&');
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', api_url);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  
  xhr.oneror = function(){
    callback('error: some error happened when uploading to chemical servers')
  }
  
  getBinary(req, function(file){
    if(file.size > 10 * 1000 * 1000){ //this is actually less than the limit of 15, but lets be nice to the server.
      return callback("error: file exceeds maximum size for host. Files must be less than 10MB.");
    }
  
    xhr.onload = function(){
      var code = xhr.responseText;
      if(/error:/.test(code)) return callback(code);
      callback(download_url + '?' + params({
        code: code,
        fn: file.name
      }))
    }
    
    
    xhr.send('file='+encodeURIComponent(btoa(file.data)))
  });
}
