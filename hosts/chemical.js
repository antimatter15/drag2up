/*
  Thanks so much to the chemical servers hosting for this!
  Designed the API myself, wrote the hosting code too.
*/
function uploadChemical(req, callback){
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
  
  getBinary(req, function(file){
    if(file.size * 1.5 > 23000000){
      return callback("error: file exceeds maximum size for host. Files must be less than 15MB.");
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
