function initialize(doc){
function isDroppable(el){
  var tag = el.tagName.toLowerCase();
  if((tag == 'input' && el.type.toLowerCase() == 'text') || tag == 'textarea'){
		if(el.disabled == false && el.readOnly == false){
    	return 1
		}
  }
  if(el.isContentEditable){ //two differnt modes of insertion
    return 2; //content editable divs are a bit hard
  }

  return false;
}

var dropTargets = [];

function sendRequest(data, callback){
  if(typeof chrome != 'undefined'){
    chrome.extension.sendRequest(data, callback);
  }else{
    var customEvent = document.createEvent('Event');
    customEvent.initEvent('drag2upbubble', true, true);
    customEvent.xeventdata = data;
    document.documentElement.dispatchEvent(customEvent);
  }
}

//stolen from http://www.quirksmode.org/js/findpos.html
function findPos(obj) {
	var curleft = curtop = 0;
	do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
	} while (obj = obj.offsetParent);
	return [curleft,curtop];
}


function renderTarget(el){
  var pos = findPos(el);
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  if(!pos[0] && !pos[1] && !width && !height) return;

  var mask = doc.createElement('div');
  mask.style.opacity = "0.6";
  mask.style.backgroundColor = "green";
  mask.dropTarget = el;

  mask.style.position = 'absolute';
  var pad = 5;
  
  mask.style.left = pos[0]-pad+'px';
  mask.style.top = pos[1]-pad+'px';
  mask.style.width = width+'px';
  mask.style.height = height+'px';
  mask.style.padding = pad+'px';
  mask.style.zIndex = 9007199254740991;
  
  mask.style.textAlign = 'center';
  mask.style.fontSize = 'x-large';
  mask.style.color = 'white';
	mask.style.borderRadius = pad+'px';
	mask.style.webkitBorderRadius = pad+'px';
  mask.style.fontFamily = 'sans-serif, arial, helvetica'
  mask.innerHTML = 'Drop file here';
  mask.hasDropped = false;
  
  mask.addEventListener('drop', function(e){
    var files = e.dataTransfer.files;

    if(files.length == 0) return;
    
    mask.hasDropped = true;
    mask.style.backgroundColor = '#007fff';
    mask.style.fontSize = 'large';

    mask.innerHTML = 'Uploading '+files.length+' file(s)';

    for(var i = 0; i < files.length; i++){
      if(files[i].size > 1024 * 1024 * 5) {
        if(!confirm('The file "'+files[i].name+'" is over 5MB. Are you sure you want to upload it?')) break;
      }
      var reader = new FileReader();  
      reader.onerror = function(e){
        console.log(e)
      }
      reader.onload = (function(el, file){
        return function(e){
          console.log('Read file.');
          sendRequest({
            'action' : 'upload',
            'type': file.type,
            'size': file.size,
            'name': file.name,
            'data': e.target.result
            }, function(data){
              console.log('Done uploading file');
              var elt = isDroppable(el);
              try{mask.parentNode.removeChild(mask);}catch(err){};
              try{el.focus();}catch(err){};
              //try{el.select();}catch(err){};
              setTimeout(function(){
                if(elt == 1){ //input
                  if(el.value.slice(-1) != ' ' && el.value != '') el.value += ' ';
                  el.value = data.url + ' ';
                }else if(elt == 2){ //contentEditable
                  var a = doc.createElement('a');
                  a.href = data.url;
                  a.innerText = data.url;
                  el.appendChild(a);
                }
              },100);
            });
        }
      })(el, files[i]);
      reader.readAsDataURL(files[i]);
    }
  },false);
  
  doc.body.appendChild(mask);

  dropTargets.push(mask);
}


function getTargets(){
  var all = doc.getElementsByTagName('*');
  for(var l = all.length; l--;){
    if(isDroppable(all[l])){
      renderTarget(all[l]);
    }
  }
}


function clearTargets(){
  for(var i = dropTargets.length; i--;){
    if(dropTargets[i] && dropTargets[i].parentNode && dropTargets[i].hasDropped == false){
      dropTargets[i].parentNode.removeChild(dropTargets[i]);
    }
  }
  dropTargets = [];
}

doc.documentElement.addEventListener('dragenter', function(e){
  e.stopPropagation();  
  e.preventDefault();

  if(dropTargets.length == 0 && e.dataTransfer.types.indexOf('Files') != -1){
    getTargets();
  }
}, false);

doc.documentElement.addEventListener('dragover', function(e){
  e.stopPropagation();  
  e.preventDefault();
  
}, false);

doc.documentElement.addEventListener('drop', function(e){
  e.stopPropagation();  
  e.preventDefault();  
  clearTargets();
}, false);


doc.documentElement.addEventListener('click', function(e){
  clearTargets();
}, false);
}

initialize(document);

var script = document.createElement('script');
script.innerHTML = '(function(){'+initialize.toString()+';})()';
document.documentElement.appendChild(script);

document.documentElement.addEventListener('drag2upbubble', function(e){
  console.log(e.blahblah);
})
