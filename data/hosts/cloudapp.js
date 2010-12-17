//uses multipart helper function.
//does not support https
function uploadCloudApp(file, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://my.cl.ly/items/new');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function(){
    if(xhr.status == 401){
      //i can haz login
      chrome.tabs.create({url: "http://my.cl.ly/login"}, function(tab){
        var poll = function(){
          chrome.tabs.get(tab.id, function(info){
            if(info.url == 'http://my.cl.ly/'){
              chrome.tabs.remove(tab.id);
              uploadCloudApp(file, callback);
            }else{
              setTimeout(poll, 300)
            }
          })
        };
        poll();
      })
    }else{
      var json = JSON.parse(xhr.responseText);
      var xhr2 = new XMLHttpRequest();
      xhr2.open('POST', json.url);
      json.params.key = json.params.key.replace('${filename}', file.name);
      json.params.file = file;
      xhr2.sendMultipart(json.params);
      xhr2.onload = function(){
        //since ajax cant add the Accept: header to the redirects, heres a hack
        var xhr3 = new XMLHttpRequest();
        xhr3.open('GET', 'http://my.cl.ly/items');
        xhr3.setRequestHeader('Accept', 'application/json');
        xhr3.onload = function(){
          callback(JSON.parse(xhr3.responseText)[0].content_url)
        }
        xhr3.send()
      }
    }
  }
  xhr.send()
}
