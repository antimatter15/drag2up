var Hosts = {};
var instant_host = 'drag2up.appspot.com/'//'localhost:8080/'


function hostName(file){
  var typehost = {
    binary: localStorage.binhost || 'chemical',
	  text: localStorage.texhost || 'gist',
	  image: localStorage.imghost || 'imgur'
	}
	
	var type = fileType(file);
	
	return typehost[type]
}


function uploadData(file, callback){
  console.log('uploading data');
  var hostname = hostName(file);
  console.log('selecte dhostname',hostname);
  var fn = Hosts[hostname];
  if(fn){
    try{
      fn(file, callback);
    }catch(err){
      callback('error: An error occured while running the upload script for '+hostname);
    }
  }else{
    callback('error: No script found for uploading '+fileType(file)+' files to '+hostname);
  }
  
  //uploadDataURL(file, callback);
}



var filetable = {};

function params(obj){
  var str = [];
  for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
  return str.join('&');
}


var tabqueue = {};

function https(){
  if(localStorage.no_https == 'on'){
    return 'http://'; //idk why someone would want this
  }
  return 'https://';
}

function handleRequest(request, tab, sendResponse){
  if(request.action == 'settings'){
    console.log('opening settings page');
    if(typeof chrome != 'undefined'){
      chrome.tabs.create({url: "data/options.html", selected: true});
    }else if(typeof tabs != 'undefined'){
      tabs.open({
        url: data.url('options.html')
      });

    }else{
      console.log('no means to create tab');
    }
    return;
  }
  

  console.log('handle request', +new Date, request.id);
  
  function returned_link(obj){
    //here you apply the shorten methods before sending response
    var shortener = localStorage.url_shortener;
    if(shortSvcList[shortener]){ //if there's a url shortener selected
      var orig = obj.url;
      console.log('quering url shortenr', shortSvcList[shortener], 'for', orig)
      shorten(shortener, orig, function(res){
        if(res.status == 'ok'){
          obj.url = res.url;
        }else{
          obj.url = 'error: the url shortener '+shortener+' is broken. The original URL was '+orig;
        }
		    console.log('sending delayed response', obj);
        sendResponse(obj); //yay returned call! albeit slightly delayed
      })
    }else{
		  console.log('immediately sent resposne',obj)
      sendResponse(obj); //yay returned call!
    }
  }
  
  var instant = (localStorage.instant || 'on') == 'on'; //woot. its called instant because google made google instant.

  if(instant){
    var car = new racer(2, function(data){
      linkData(request.id, data.url);
    });
  }
  
  console.log('progress of instant',instant);
  
  if(instant){
    console.log('initializing instnat', request.url);
    instantInit({
        id: request.id,
        name: request.name || 'unknown.filetype', 
        type: request.type || 'application/octet-stream', 
        size: request.size || -1,
        url: request.url
      }, function(parts){
      car.done();
      console.log('finished initializing instant', +new Date);
      var shorturl = https()+instant_host+''+parts[0];
      if(localStorage.descriptive == 'on' && request.name){
        shorturl += '?'+request.name;
      }
      returned_link({
        callback: request.id,
        url: shorturl
      })
    })
  }
  console.log('read file', +new Date);

  console.log('set queue');
  if(typeof chrome != 'undefined'){
    tabqueue[tab] = (tabqueue[tab] || 0) + 1;
    chrome.pageAction.show(tab);  
    chrome.pageAction.setTitle({tabId: tab, title: 'Uploading '+tabqueue[tab]+' files...'});
  }
  console.log('going to upload');
  uploadData(request, function(url){
  	console.log('done uploading stuff')
    if(/^error/.test(url) && typeof chrome != 'undefined'){
      var notification = webkitNotifications.createNotification(
        'icon/64sad.png',  // icon url - can be relative
        "Something went terribly awry...",  // notification title
        url  // notification body text
      );
      notification.show();
    }
    if(instant){
      car.done({url: url});
    }else{ //non-instant
      console.log('non instant callback')
      returned_link({callback: request.id, url: url})
    }
    if(typeof chrome != 'undefined'){
      tabqueue[tab]--;
      chrome.pageAction.setTitle({tabId: tab, title: 'Uploading '+tabqueue[tab]+' files...'});
      if(tabqueue[tab] == 0){
        chrome.pageAction.hide(tab);
        if(localStorage.notify == 'on' && typeof chrome != 'undefined'){
          var notification = webkitNotifications.createNotification(
            'icon/64.png',  // icon url - can be relative
            "Uploading Complete",  // notification title
            "All files have been uploaded."  // notification body text
          );
          notification.show();
        }
      }
    }
  });
  
}

//solve race conditions
function racer(num, callback){
  this.num = num;
  this._done = 0;
  this.data = {};
  this.id = callback;
}
racer.prototype.done = function(data){
  if(data) for(var i in data) this.data[i] = data[i];
  if(++this._done >= this.num) this.id(this.data);
}


function instantInit(file, callback){
  var xhr = new XMLHttpRequest();
  console.log('created xhr')
  xhr.open('GET', https()+instant_host+'new?'+params({
    host: hostName(file),
    size: file.size,
    name: file.name.replace(/\n/g,' ') //newlines suck. they cause errors.
  }), true);
  console.log('getted things');
  xhr.onload = function(){
    console.log('done initializing instnat', xhr.responseText)
    callback(filetable[file.id] = xhr.responseText.split(','));
  }

  xhr.send();
    console.log('sent');
}


function getURL(type, request, callback, sync){
  if(request.data && sync) return request.data;
  
  if(request.data) return callback(request); //no need reconverting!
  
  if(/^data:/.test(request.url)){
    console.log('opened via data url');
    var parts = request.url.match(/^data:(.+),/)[1].split(';');
    var mime = parts[0], b64 = parts.indexOf('base64') != -1;
    var enc = request.url.substr(request.url.indexOf(',')+1);
    var data = b64 ? atob(enc) : unescape(enc);
    //data urls dont have any weird encoding issue as far as i can tell
    var name = '';
    if(request.name){
      name = request.name;
    }else{
      name = enc.substr(enc.length/2 - 6, 6) + '.' + mime.split('/')[1];
    }
    if(sync) return data;
    callback({
      data: data,
      type: mime,
      id: request.id,
      size: data.length,
      name: name
    });
    
    //callback(new dFile(data, name, mime, id, size)
  }else{
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', request.url, !sync);
    if(type == 'binary' || type == 'raw'){
      xhr.overrideMimeType('text/plain; charset=x-user-defined'); //should i loop through and do that & 0xff?
    }
    if(sync){
      xhr.send();
      return xhr.responseText;
    }
    xhr.onload = function(){
      console.log('opened via xhr ', request.url);
      var raw = xhr.responseText, data = '';
      //for(var l = raw.length, i=0; i<l;i++){ data += String.fromCharCode(raw.charCodeAt(i) & 0xff); if(!(i%(1024 * 1024))) console.log('1mb') };
      //var data = postMessage(raw.split('').map(function(a){return String.fromCharCode(a.charCodeAt(0) & 0xff)}).join(''));
      //window.fd = data;
      
      //var obj = {id: request.id, bin: function(){return raw}, b64: function(){return btoa(data)},type: request.type, size: data.length, name: request.name}
      //callback(obj);
      //because running it here since js is single threaded causes the asynchrouously running instantInit request to be delayed, slowing it down substantially.
      //using a web worker: probably overkill.

      if(type == 'binary'){
        //*
        if(typeof BlobBuilder == 'undefined'){
        
          for(var raw = xhr.responseText, l = raw.length, i = 0, data = ''; i < l; i++) data += String.fromCharCode(raw.charCodeAt(i) & 0xff);
          
          callback({id: request.id, data: data, type: request.type, size: data.length, name: request.name});
        }else{
        
          var bb = new BlobBuilder();//this webworker is totally overkill
          bb.append("onmessage = function(e) { for(var raw = e.data, l = raw.length, i = 0, data = ''; i < l; i++) data += String.fromCharCode(raw.charCodeAt(i) & 0xff); postMessage(data) }");
          var worker = new Worker(createObjectURL(bb.getBlob()));
          worker.onmessage = function(e) {
            var data = e.data;
            callback({id: request.id, data: data, type: request.type, size: data.length, name: request.name});
          };
          
          worker.postMessage(xhr.responseText);
        }
        
        //*/
      }else if(type == 'raw'){
        var data = xhr.responseText;
        callback({id: request.id, data: data, type: request.type, size: data.length, name: request.name});
      }else{
        callback({id: request.id, data: raw, type: request.type, size: data.length, name: request.name});
      }
    }
    xhr.send();
  }
}


function getText(request, callback){
  getURL('text', request, callback);
}

function getRaw(request, callback){
  getURL('raw', request, callback);
}

function getBinary(request, callback){
  getURL('binary', request, callback);
}

if(typeof chrome != 'undefined'){
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    setTimeout(function(){
      handleRequest(request, sender.tab.id, sendResponse)
    }, 0); //chrome has weird event handling things that make debugging stuff harder
  });
  
  chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url: "data/options.html", selected: true});
  });
}


var text_ext = 'log,less,sass,coffee,yaml,json,md,conf,config,css,cfm,yaws,html,htm,xhtml,js,pl'.split(',') //do not add semicol
.concat('php,php4,php3,phtml,py,rb,rhtml,xml,rss,svg,cgi,yaml,md,markdown,shtml,asp,java,c'.split(',')) //do not add semicol
.concat('README,sh,make,automake,configure,LICENSE,h,m,info,nfo,classdescription,in'.split(','));


function fileType(file){
  console.log('checking file type for file',file);
  var ext = file.name.toLowerCase().replace(/^.*\.(\w+)(\#|\?)?.*?$/,'$1');
  var image_ext = 'jpg,jpeg,tiff,raw,png,gif,bmp,ppm,pgm,pbm,pnm,webp'.split(','); //woot webp
  
  if(image_ext.indexOf(ext) != -1) file.type = 'image/'+ (ext == 'jpg'?'jpeg':ext);
  
  if(file.type.indexOf('text/') == -1) if(text_ext.indexOf(ext) != -1) file.type = 'text/plain';
	  
  if(file.type){
    console.log('the file type was', file.type, 'file extension was ', ext);
    if(file.type.indexOf('image/') == 0){
	    //image type
	    return 'image'
	  }else if(file.type.indexOf('text/') == 0){
	    return 'text'
	  }else if(file.type.indexOf('script') != -1 || file.type.indexOf('xml') != -1){
	    return 'text'; //scripts or xml usually means code which usually means text
	  }
	}
	
	
	if(file.size < 1024 * 300) { //its not as common for there to be 1 meg text files
    console.log('checking for file type');
    var src = getURL('raw', file, function(){}, true); //binary sync xhr.. its baddd.
    console.log(src);
    for(var l = src.length, i = 0; i < l; i++){
      var code = src.charCodeAt(i) & 0xff;
      if(code <= 8 || (code >= 14 && code <= 31) || code == 127 || code >= 240){
        console.log('failed test: binary', code, src.charAt(i));
        return 'binary'; //non printable ascii
      }
    }
    file.type = 'text/plain';
    return 'text';
  }
	return 'binary'
}


function linkData(id, url){
  var xhr = new XMLHttpRequest();
  var file_id = filetable[id][0];0
  var edit_code = filetable[id][1];
  if(file_id.length < 15 && edit_code.length < 15){
    xhr.open('GET',https()+instant_host+'update/'+file_id+'/'+edit_code+'?'+params({
      url: url
    }), true);
    xhr.onload = function(e){
      if(xhr.status != 200){
        //doomsday scenario: error leads to error leading to error leading to effective DoS
        linkData(id, 'error: could not link to upload url because of '+xhr.status+' '+xhr.statusText)
      }
    }
    xhr.onerror = function(e){
      console.log(e)
      linkData(id, 'error: could not link.')
    }
    xhr.send();
  }else{
    console.log('probably this was an invalid thing');
  }
}




