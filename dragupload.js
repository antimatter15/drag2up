function initialize(doc){
if(!doc){ console.log('no document'); return}

var isDragging = false;
var dropTargets = [];
var lastDrag = 0;
var postMessageHeader = '!/__drag2up-$/!'; //crammed a bunch of random characters

function clearTargets(){
  isDragging = false;
  for(var i = dropTargets.length; i--;){
    if(dropTargets[i] && dropTargets[i].parentNode && dropTargets[i].hasDropped == false){
      dropTargets[i].parentNode.removeChild(dropTargets[i]);
    }
  }
  dropTargets = [];
}

// determines if an element can be droppable based on several conditions
function isDroppable(el){
  var tag = el.tagName.toLowerCase(), A;
  //if(tag == 'div' && dropTargets.indexOf(el) != -1) return 3;
  if(((tag == 'input' && el.type.toLowerCase() == 'text') || tag == 'textarea') && (el.disabled == false && el.readOnly == false)) A =  1;
  if(el.isContentEditable && (el.parentNode.isContentEditable == false || tag == 'body')) A = 2;
  //structured this weird way because profiling shows this part is the slowest
  if(A){
    var pos = findPos(el)
    if(el.ownerDocument.elementFromPoint(pos[0]+1, pos[1]+1) == el) return A; //ensure that that element is on top
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
  //based on Stephen Colbert's economic "trickle down" theory. Lime flavored event messages are given to 
  //the top 3% root windows, which flow through the system and eventually trickle down to the other 97%
  //http://www.colbertnation.com/the-colbert-report-videos/341481/july-28-2010/the-word---ownership-society
  window.top && top.postMessage && window.top.postMessage(postMessageHeader + 'trickle_' + msg, '*')
  console.log(msg);
}

window.addEventListener('message', function(e){
  if(e.data.substr(0, postMessageHeader.length) != postMessageHeader) return;
  var data = e.data.substr(postMessageHeader.length);
  if(data.substr(0,7) == 'trickle'){
    //propagate downwards
    for(var i = 0; i < frames.length; i++) frames[i] && frames[i].postMessage && frames[i].postMessage(e.data, '*');
    var cmd = data.substr(0, 18), date = parseInt(data.substr(18), 10);
    if(cmd == 'trickle_reactivate'){ //it should just be activate, but re seems like a good prefix to make them the same length
      if(isDragging == false) getTargets();
      lastDrag = date; 
    }else if(cmd == 'trickle_deactivate'){
      var lastBodyLeave = date;
      setTimeout(function(){
        if(lastDrag < lastBodyLeave){
          clearTargets();
        }
      },150)
    }
  }
})


function renderTarget(el){
  var pos = findPos(el);
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  if(!pos[0] && !pos[1] && !width && !height) return;

  var mask = doc.createElement('div');
  var opacity = "0.84";
  var opacity2 = "0.42"
  mask.style.opacity = opacity;
  mask.style.backgroundColor = "rgb(50,150,50)";
  mask.dropTarget = el;

  mask.style.position = 'absolute';
  var pad = 5;
  var elt = isDroppable(el); //get the type of drop mode
  if(elt == 2) pad = 0;
  
  mask.style.left = pos[0]-pad+'px';
  mask.style.top = pos[1]-pad+'px';


  var fontSize = Math.sqrt(Math.min(height,width)/50)*20;
  var tpad = Math.max(0, height/2 - fontSize * 0.6);

    
  mask.style.width = width+'px';
  mask.style.height = height-tpad+'px';
  mask.style.padding = pad+'px';
  mask.style.paddingTop = (pad+tpad)+'px';
  mask.style.zIndex = 9007199254740991;
  mask.style.webkitTransition = 'opacity 0.5s ease'
  mask.style.textAlign = 'center';
  mask.style.fontSize = fontSize+'px';
  mask.style.color = 'white';
  mask.style.borderRadius = pad+'px';
  mask.style.webkitBorderRadius = pad+'px';
  mask.style.fontFamily = 'sans-serif, arial, helvetica'
  mask.innerHTML = 'Drop file here';
  mask.hasDropped = false;

  mask.addEventListener('dragenter', function(e){
    mask.style.opacity = opacity2;
  }, false);
  mask.addEventListener('dragleave', function(e){
    mask.style.opacity = opacity;
  }, false);
  mask.addEventListener('dragover', function(e){
    e.preventDefault();
    e.stopPropagation();
  }, true);
  mask.addEventListener('drop', function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
  }, true);
  doc.body.appendChild(mask);

  dropTargets.push(mask);
}


function getTargets(){
  if(doc && doc.getElementsByTagName){
    var all = doc.getElementsByTagName('*');
    for(var l = all.length; l--;){
      if(isDroppable(all[l])){
        renderTarget(all[l]);
      }
    }
  }
}




doc.documentElement.addEventListener('dragenter', function(e){
  lastDrag = +new Date; 
  if(isDragging == false && e.dataTransfer.types.indexOf('Files') != -1 && e.dataTransfer.types.indexOf('text/uri-list') == -1){
    isDragging = true;
    propagateMessage('reactivate'+lastDrag);
    setTimeout(getTargets, 50);
  }

}, false);

doc.documentElement.addEventListener('dragover', function(e){
  //allow default to happen for normal drag/drops
  isDragging && propagateMessage('reactivate'+lastDrag);
  lastDrag = +new Date; 
}, false);

doc.documentElement.addEventListener('dragleave', function(e){
  var lastBodyLeave = +new Date;
  setTimeout(function(){
    if(lastDrag < lastBodyLeave){
      clearTargets();
      propagateMessage('deactivate'+lastBodyLeave);
    }
  },50)
}, false);


doc.documentElement.addEventListener('mouseup', function(e){
  var lastBodyLeave = +new Date;
  propagateMessage('deactivate'+lastBodyLeave);
  clearTargets();
}, false);

}

initialize(document);


//*
var lastFrameLength = 0;
setInterval(function(){
  if(frames.length > lastFrameLength){
    var init = function(){
      for(var l = INITFRAMELEN; l < frames.length; l++){
        try{initialize(frames[l].document);}catch(err){};
      }
    }
    var script = document.createElement('script');
    script.innerHTML = '(function(){'+initialize.toString()+';('+init.toString().replace('INITFRAMELEN', lastFrameLength)+')();})()';
    document.documentElement.appendChild(script);
    
    lastFrameLength = frames.length;
  }
},1000)
//*/

