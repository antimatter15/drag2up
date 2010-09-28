function isDroppable(el){
  var tag = el.tagName.toLowerCase();
  if((tag == 'input' && el.type.toLowerCase() == 'text') || tag == 'textarea'){
    return 1
  }
  if(el.isContentEditable){ //two differnt modes of insertion
    return 2;
  }

  return false;
}

var dropTargets = [];

function sendRequest(data, callback){
  if(typeof chrome != 'undefined'){
    chrome.extension.sendRequest(data, callback);
  }else{
    setTimeout(function(){
      calback({url: 'http://blahblah.com/'+Math.random().toString(36)});
    },500 + Math.random() * 1337);
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

  var mask = document.createElement('div');
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
  mask.style.fontFamily = 'sans-serif, arial, helvetica'
  mask.innerHTML = 'Drop file here';
  mask.hasDropped = false;
  
  mask.addEventListener('drop', function(e){
    mask.hasDropped = true;
    mask.style.backgroundColor = '#007fff';
    mask.style.fontSize = 'large';
    var files = e.dataTransfer.files;
    
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
                  el.value += ' '+data.url+' ' //nice and simple
                }else if(elt == 2){ //contentEditable
                  var a = document.createElement('a');
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
  
  document.body.appendChild(mask);

  dropTargets.push(mask);
}


function getTargets(){
  var all = document.getElementsByTagName('*');
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

document.documentElement.addEventListener('dragenter', function(e){
  e.stopPropagation();  
  e.preventDefault();

  if(dropTargets.length == 0){
    getTargets();
  }
}, false);

document.documentElement.addEventListener('dragover', function(e){
  e.stopPropagation();  
  e.preventDefault();
  
}, false);

document.documentElement.addEventListener('drop', function(e){
  e.stopPropagation();  
  e.preventDefault();  
  clearTargets();
}, false);


document.documentElement.addEventListener('click', function(e){
  clearTargets();
}, false);
