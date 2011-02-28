//https://chrome.google.com/extensions/detail/mdddabjhelpilpnpgondfmehhcplpiin (A stretch, but it introduced me to the imm.io hosting service and I made my implementation by sniffing traffic data)


Hosts.immio = function uploadImmio(req, callback){
  if(supports_binary()){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://imm.io/?callback=true&name=drag2up');
    xhr.onload = function(){
      if(xhr.responseText.indexOf('ERR:') != -1){
        callback('error: could not upload to immio (multipart) '+ xhr.responseText);
      }else{
        var url = xhr.responseText;
        
        callback({
          url: url,
          direct: url.replace(/^(.*)\/(..)(.*)$/,'$1/media/$2/$2$3.')+req.name.replace(/^.*\./g,'')
        })
      }
    }
    xhr.sendMultipart({
      image: req
    })
  }else{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://imm.io/?callback=true&name=drag2up');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    getBinary(req, function(file){
      xhr.onload = function(){
        if(xhr.responseText.indexOf('ERR:') != -1){
          callback('error: could not upload to immio (b64) '+ xhr.responseText);
        }else{
          var url = xhr.responseText;
          
          callback({
            url: url,
            direct: url.replace(/^(.*)\/(..)(.*)$/,'$1/media/$2/$2$3.')+file.name.replace(/^.*\./g,'').toLowerCase().replace('jpg','jpeg')
          })
        }
      }
      xhr.send('image='+encodeURIComponent('data:'+file.type+';base64,'+btoa(file.data)))
    });
  }
}

