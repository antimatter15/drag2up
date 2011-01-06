//based on description from http://gist.github.com/4277
  
function uploadGist(req, callback){
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

  getText(req, function(file){
    var data = {};
    data['files['+encodeURIComponent(file.name||'untitled')+']'] = file.data;
    postJSON(https()+"gist.github.com/api/v1/json/new", data, function(data){
      if(data){
        callback(https()+'gist.github.com/'+data.gists[0].repo)
      }else{
        callback('error: could not upload github gist');
      }
    })
  })

}
