
if(localStorage.currentVersion == '1.0.3'){
  if(typeof chrome != 'undefined'){
    chrome.tabs.create({url: "options.html", selected: true});
  }
}

localStorage.currentVersion = '2.0';

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
  var hostfn = {
    hotfile: uploadHotfile,
    gist: uploadGist,
    imgur: uploadImgur,
    imageshack: uploadImageshack,
    dropbox: uploadDropbox,
    pastebin: uploadPastebin,
    cloudapp: uploadCloudApp,
    flickr: uploadFlickr,
    immio: uploadImmio,
    picasa: uploadPicasa,
    chemical: uploadChemical,
    mysticpaste: uploadMysticpaste,
    dafk: uploadDAFK
  };
  var hostname = hostName(file);
  console.log('selecte dhostname',hostname);
  var fn = hostfn[hostname];
  if(fn){
    fn(file, callback);
  }else{
    callback('error: no host function for type '+hostName(file)+' for file type '+fileType(file));
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
  console.log(request)
  console.log('handle request', +new Date, request.id);
  
  function returned_link(obj){
    //here you apply the shorten methods before sending response
    var shortener = localStorage.url_shortener;
    if(shortSvcList[shortener]){ //if there's a url shortener selected
      var orig = obj.url;
      shorten(shortener, orig, function(res){
        if(res.status == 'ok'){
          obj.url = res.url;
        }else{
          obj.url = 'error: the url shortener '+shortener+' is broken. The original URL was '+orig;
        }
        sendResponse(obj); //yay returned call! albeit slightly delayed
      })
    }else{
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
    console.log('initializing instnat');
    instantInit({
        id: request.id,
        name:request.name || 'unknown.filetype', 
        type: request.type || 'application/octet-stream', 
        size: request.size || -1, 
        data: '\xff'
      }, function(parts){
      car.done();
      console.log('finished initializing instant', +new Date);
      returned_link({
        callback: request.id,
        url: https()+instant_host+''+parts[0]
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
    if(instant){
      car.done({url: url});
    }else if(filetable[request.id]){ //non-instant
      returned_link({callback: request.id, url: url})
    }
    if(typeof chrome != 'undefined'){
      tabqueue[tab]--;
      chrome.pageAction.setTitle({tabId: tab, title: 'Uploading '+tabqueue[tab]+' files...'});
      if(tabqueue[tab] == 0) chrome.pageAction.hide(tab);
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
    name: file.name
  }), true);
  console.log('getted things');
  xhr.onload = function(){
    console.log('done initializing instnat', xhr.responseText)
    callback(filetable[file.id] = xhr.responseText.split(','));
  }

  xhr.send();
    console.log('sent');
}


function getURL(type, request, callback){
  if(request.data) return callback(request); //no need reconverting!
  if(/^data:/.test(request.url)){
    console.log('opened via data url');
    var parts = request.url.match(/^data:(.+),/)[1].split(';');
    var mime = parts[0], b64 = parts.indexOf('base64') != -1;
    var enc = request.url.substr(request.url.indexOf(',')+1);
    var data = b64 ? atob(enc) : unescape(enc);
    //data urls dont have any weird encoding issue as far as i can tell
    callback({
      data: data,
      type: mime,
      id: request.id,
      size: data.length,
      name: enc.substr(enc.length/2 - 6, 6) + '_' + mime.replace('/','.')
    });
    
    //callback(new dFile(data, name, mime, id, size)
  }else{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', request.url, true);
    if(type == 'binary' || type == 'raw'){
      xhr.overrideMimeType('text/plain; charset=x-user-defined'); //should i loop through and do that & 0xff?
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
    chrome.tabs.create({url: "options.html", selected: true});
  });
}



function fileType(file){
  var text_ext = 'log,less,sass,coffee,yaml,json,md,css,cfm,yaws,html,htm,xhtml,js,pl,php,php4,php3,phtml,py,rb,rhtml,xml,rss,svg,cgi'.split(',');
  var ext = file.name.toLowerCase().replace(/^.*\.(\w+?)(\#|\?)?.*$/,'$1');
  var image_ext = 'jpg,jpeg,tiff,raw,png,gif,bmp,ppm,pgm,pbm,pnm,webp'.split(','); //woot webp
  if(image_ext.indexOf(ext) != -1) file.type = 'image/'+ (ext == 'jpg'?'jpeg':ext);
  if(file.type){
    if(file.type.indexOf('image/') == 0){
	    //image type
	    return 'image'
	  }else if(file.type.indexOf('text/') == 0){
	    return 'text'
	  }else if(text_ext.indexOf(ext) != -1){
	    return 'text'
	  }else if(file.type.indexOf('script') != -1 || file.type.indexOf('xml') != -1){
	    return 'text'; //scripts or xml usually means code which usually means text
	  }else if(file.size < 1024 * 1024) { //its rare for text files to be so huge
	    /*
	    var src = file.data;//atob(file.data.replace(/^data.+base64,/i,''));
	    var txt = src.substr(0,512) + src.slice(-512);
	    for(var i = 0, isAscii = true; i < 128; i++){
	      if((txt.charCodeAt(i) & 0xff) > 128){
	       isAscii = false;
	       continue
        }
      }
      if(isAscii && file.size < 1024 * 300) return 'text';
      */
	  }
	}
	return 'binary'
}




function uploadDataURL(file, callback){
  //here's the lazy data url encoding system :P
  setTimeout(function(){
    callback(file.data.replace('data:base64','data:text/plain;base64'));
  },1337);
}




function linkData(id, url){
  var xhr = new XMLHttpRequest();
  xhr.open('GET',https()+instant_host+'update/'+filetable[id][0]+'/'+filetable[id][1]+'?'+params({
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
}




