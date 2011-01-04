//box.net

function uploadBox(){
  function auth_token(url){
    var auth = url.match(/auth_token=([^\&]+)/)[1];
    localStorage.box_auth = auth;
    
    console.log(localStorage.box_auth, localStorage.box_ticket);
  }


  var xhr = new XMLHttpRequest();
  xhr.open('GET', https()+'www.box.net/api/1.0/rest?action=get_ticket&api_key='+Keys.box, true);
  xhr.send();
  xhr.onload = function(){
    var ticket = xhr.responseXML.getElementsByTagName('ticket')[0].firstChild.nodeValue;
    localStorage.box_ticket = ticket;
    var redirect = https()+"www.box.net/api/1.0/auth/"+ticket;
    
    if(typeof chrome != 'undefined'){
      chrome.tabs.create({
        url: redirect
      }, function(tab){
        var poll = function(){
          chrome.tabs.get(tab.id, function(info){
            if(info.url.indexOf('auth_token') != -1){
              auth_token(info.url);
              chrome.tabs.remove(tab.id);
            }else{
              setTimeout(poll, 100)
            }
          })
        };
        poll();
      })
    }else if(typeof tabs != 'undefined'){
      tabs.open({
        url: redirect,
        onOpen: function(tab){
          var poll = function(){
            if(tab.url.indexOf('auth_token') != -1){
              auth_token(tab.url);
              tab.close()
            }else{
              setTimeout(poll, 100)
            }
          };
          poll();
        }
      })
    }
  }
}
