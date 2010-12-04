function initialize(doc){
if(!doc){ console.warn('no document'); return}
if(!window.top){ console.warn('no top'); return};

window.addEventListener('drag2upTestEvent', function(e){ 
	e.preventDefault(); 
	e.stopPropagation(); 
	e.stopImmediatePropagation(); 
	return false
}, true);

var isDragging = false;
var dropTargets = [];
var lastDrag = 0;
var postMessageHeader = '!/__drag2up-$/!'; //crammed a bunch of random characters
var callbacks = {};

//instance ID. useful for debugging.
var iId = Math.random().toString(36).substr(2,3);

console.log('initialized ',iId,' at',window);

function clearTargets(){
//return;
  isDragging = false;
  for(var i = dropTargets.length; i--;){
    if(dropTargets[i] && dropTargets[i].parentNode && dropTargets[i].hasDropped == false){
      //TODO: move function declaration outside of loop for speed/mem
      (function(target){
        target.style.opacity = '0';
        setTimeout(function(){
          target.parentNode.removeChild(target);
        },500);
      })(dropTargets[i]);
    }
  }
  dropTargets = [];
}

// determines if an element can be droppable based on several conditions
function isDroppable(el){
  var tag = el.tagName.toLowerCase(), A;
  //if(tag == 'div' && dropTargets.indexOf(el) != -1) return 3;
  if(((tag == 'input' && el.type.toLowerCase() == 'text') || tag == 'textarea') && (el.disabled == false && el.readOnly == false)) A =  1;
  if(el.isContentEditable && el.parentNode.isContentEditable == false) A = 2.5; //aaah! close your eyes! it's too hacky!
  if(el.isContentEditable && tag == 'body') A = 2;
  //structured this weird way because profiling shows this part is the slowest
  if(A == 2){
    return A;
  }else if(A == 1 || A == 2.5){
    var pos = findPos(el); //oh crap this is hacky
    if(el.ownerDocument.elementFromPoint(pos[0]+1, pos[1]+1) == el) return ~~A; //ensure that that element is on top
  }
  return false;
}

//stolen from ppk
function findPos(obj) {
  var curleft = curtop = 0;
  do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
  } while (obj = obj.offsetParent);
  return [curleft,curtop];
}

function propagateMessage(msg){
  window.top && top.postMessage && window.top.postMessage(postMessageHeader + 'root_' + msg, '*');
  
  //console.log(msg,window, window.top, window.parent);
}

function trickleMessage(msg){
  //based on Stephen Colbert's economic "trickle down" theory. Lime flavored event messages are given to 
  //the top 3% root windows, which flow through the system and eventually trickle down to the other 97%
  //http://www.colbertnation.com/the-colbert-report-videos/341481/july-28-2010/the-word---ownership-society
  window.top && top.postMessage && window.top.postMessage(postMessageHeader + 'trickle_' + msg, '*')
}

window.addEventListener('message', function(e){
  if(e.data.substr(0, postMessageHeader.length) != postMessageHeader) return;
  var data = e.data.substr(postMessageHeader.length);
  if(data.substr(0,7) == 'trickle'){
    //propagate downwards
    for(var i = 0; i < frames.length; i++) frames[i] && frames[i].postMessage && frames[i].postMessage(e.data, '*');
    var cmd = data.substr(0,18);
    if(cmd == 'trickle_reactivate'){ //it should just be activate, but re seems like a good prefix to make them the same length
      if(isDragging == false){
        isDragging = true;
        getTargets();
      }
    }else if(cmd == 'trickle_deactivate'){
      clearTargets();
    }else if(cmd == 'trickle_docallback'){
      var json = JSON.parse(data.substr(18))
      var cb = callbacks[json.callback];
      if(cb) cb(json);
    }
  }else if(data.substr(0, 4) == 'root'){
    var cmd = data.substr(0,15);
    if(cmd == 'root_reactivate'){
      if(isDragging == false) trickleMessage('reactivate');
      lastDrag = (+new Date); //TODO; utilize the value that got passed
    }else if(cmd == 'root_deactivate'){
      var lastDeactivation = +new Date;
      setTimeout(function(){
        if(lastDrag < lastDeactivation){
          trickleMessage('deactivate');
          //console.warn('fuh reeelz!',lastDeactivation - lastDrag)
          
        }
      },200);
    }else if(cmd == 'root_forcedkill'){ //woot, same length!
      isDragging && trickleMessage('deactivate');
    }else if(cmd == 'root_initupload' || cmd == 'root_uploaddata'){
      chrome.extension.sendRequest(JSON.parse(data.substr(15)), function(data){
        trickleMessage('docallback'+JSON.stringify(data));
      });
    }
  }
})

function insertLink(el, url, type){
  console.log(el, url, type);
  try{el.focus();}catch(err){};
  //try{el.select();}catch(err){};
  setTimeout(function(){
    var elt = isDroppable(el); //get the type of drop mode
    if(elt == 1){ //input
      if(el.value.slice(-1) != ' ' && el.value != '') el.value += ' ';
      console.log('input yay');
      //simple little test to use bbcode insertion if it's something that looks like bbcode
      if(/\[img\]/i.test(document.body.innerHTML) && type.indexOf('image/') == 0){
        el.value += '[img]'+url+'[/img]' + ' ';
      }else{
        el.value += url + ' ';
      }

      
    }else if(elt == 2){ //contentEditable
      var a = doc.createElement('a');
      a.href = url;
      a.innerText = url;
      el.appendChild(a);
      //links dont tend to work as well
      
      //var span = doc.createElement('span');
      //span.innerText = data.url;
      //el.appendChild(span);
    }
  },100);
}



function renderTarget(el){
  if(!el || !el.parentNode) return;
  var pos = findPos(el), width = el.offsetWidth, height = el.offsetHeight;
  if(!width && !height) return; //no zero widther
  
  console.log(iId, el);
  
  
  var opacity_normal = '0.84', opacity_hover = '0.42';
  var mask = doc.createElement('div'); //this is what we're making!
  mask.style.opacity = '0'; //set to zero initially, for nice fade in
  setTimeout(function(){ mask.style.opacity = opacity_normal;},0);
  
  mask.style.backgroundColor = "rgb(50,150,50)"; //a shade of green
  mask.dropTarget = el; //reference original element
  mask.style.position = 'absolute';
  mask.style.zIndex = 9007199254740991;
  mask.style.webkitTransition = 'opacity 0.5s ease'
  mask.style.textAlign = 'center';
  mask.style.color = 'white';
  mask.style.borderRadius = '5px';
  mask.style.webkitBorderRadius = '5px';
  mask.style.fontFamily = 'sans-serif, arial, helvetica'
  mask.innerHTML = 'Drop file here';
  mask.hasDropped = false;
  
  var cx = pos[0] + width/2, cy = pos[1] + height/2;
  var pad = 5; //five pixel padding for normal thingsies
  
  if(width * height > 32000){ //a random magic number. Basically, it's derived from twitter's whats happening box which is 482x56
    //and thats close to 500x60 which is 30,000 but 32,000 feels nicer.
    //here, the box is too big, so instead of covering it, you make a smaller one in the center  
    width = Math.min(200, width);
    height = Math.min(80, height);
  }
  
  mask.style.left = cx - width/2 - pad+'px';
  mask.style.top = cy - height/2 - pad+'px';
  
  mask.style.width = width+'px';
  mask.style.height = height+'px';
  
  mask.style.padding = pad+'px';

  mask.style.fontSize = '16px';

  mask.addEventListener('dragenter', function(e){ mask.style.opacity = opacity_hover; }, false);
  mask.addEventListener('dragleave', function(e){ mask.style.opacity = opacity_normal;}, false);
  mask.addEventListener('dragover', function(e){ 
	  propagateMessage('reactivate')
	  e.preventDefault();
	  e.stopImmediatePropagation();
	  e.stopPropagation();
	  return false;
  }, true);
  
  mask.addEventListener('drop', function(e){
	console.log('file was dropped');
    setTimeout(function(){
		propagateMessage('forcedkill');
		var leaveEvent = document.createEvent('Event');
		leaveEvent.initEvent('drop', true, true);
		el.dispatchEvent(leaveEvent);
	},0);
    e.preventDefault();
    e.stopImmediatePropagation();

	
    
    var files = e.dataTransfer.files;
    if(files.length == 0) return;
    
    
    mask.hasDropped = true;
    //clearTargets();
    
    mask.style.backgroundColor = '#007fff';
    mask.innerHTML = 'Uploading '+files.length+' file(s)';
    var numleft = files.length;
    for(var i = 0; i < files.length; i++){
      (function(file){
      if(file.size > 1024 * 1024 * 5) if(!confirm('The file "'+file.name+'" is over 5MB. Are you sure you want to upload it?')) continue;
      
      var cb = Math.random().toString(36).substr(3);
      callbacks[cb] = function(data){
        numleft--;
        console.log('got magic data', data, el);
        insertLink(el, data.url, file.type);
        if(numleft == 0) mask.parentNode.removeChild(mask);
      }
      
      propagateMessage('initupload'+JSON.stringify({
        action: 'initupload',
        name: file.name, 
        size: file.size, 
        callback: cb,
        id: cb
      }));
      
      var reader = new FileReader();  
      
      reader.onerror = function(e){
          numleft--;
          if(numleft == 0) mask.parentNode.removeChild(mask);
      }
      reader.onload =  function(e){
        console.log('Read file.');
        
        propagateMessage('uploaddata'+JSON.stringify({
          action: 'uploaddata',
          name: file.name, 
		  size: file.size, 
          data: e.target.result,
          id: cb //use the callback as a file id
        }));
      }
      
      reader.readAsDataURL(file);
      
      })(files[i]);
    }
    
    
  }, true);
  doc.body.appendChild(mask);

  dropTargets.push(mask);
}


function getTargets(){
  if(doc && doc.getElementsByTagName){
    var all = doc.getElementsByTagName('*');
    for(var l = all.length; l--;){
      if(isDroppable(all[l])){
        //search to make sure it doesnt already exist there
        for(var i = dropTargets.length; i-- && dropTargets[i].dropTarget != all[l];){};
        if(i == -1) renderTarget(all[l]);
      }
    }
  }
}




doc.documentElement.addEventListener('dragenter', function(e){
  if(isDragging == false && e.dataTransfer.types.indexOf('Files') != -1 && e.dataTransfer.types.indexOf('text/uri-list') == -1){
    //isDragging = true;
    propagateMessage('reactivate');
    //setTimeout(getTargets, 50);
  }
}, false);

doc.documentElement.addEventListener('dragover', function(e){
  //allow default to happen for normal drag/drops
  isDragging && propagateMessage('reactivate');
}, false);

doc.documentElement.addEventListener('dragleave', function(e){
  isDragging && propagateMessage('deactivate');
}, false);


doc.documentElement.addEventListener('mouseup', function(e){
  if(isDragging) propagateMessage('forcedkill');
}, false);

doc.documentElement.addEventListener('drop', function(e){
  console.log(e);
}, false);


}

initialize(document);

var customEvent = document.createEvent('Event');
customEvent.initEvent('myCustomEvent', true, true);


//*
var lastFrameLength = 0;
setInterval(function(){
  if(frames.length > lastFrameLength){
    var init = function(){
      for(var l = 0; l < frames.length; l++){
        try{
          //check to make sure drag2up isnt already loaded
          var customEvent = frames[l].document.createEvent('Event');
          customEvent.initEvent('drag2upTestEvent', true, true);
          if(frames[l].dispatchEvent(customEvent)){
            initialize(frames[l].document);
          }
        }catch(err){};
      }
    }
    var script = document.createElement('script');
    script.innerHTML = '(function(){'+initialize.toString()+';('+init.toString()+')();})()';
    document.documentElement.appendChild(script);
    setTimeout(function(){
		if(script.parentNode) script.parentNode.removeChild(script);
	},0)
    lastFrameLength = frames.length;
  }
},1000)
//*/

