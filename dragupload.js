function initialize(doc){
var isDragging = false;
var dropTargets = [];
var lastDrag = 0;


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
  var tag = el.tagName.toLowerCase(), pos = findPos(el);
  //ensure that that element is on top
  if(el.ownerDocument.elementFromPoint(pos[0]+1, pos[1]+1) != el) return false;
  //if(tag == 'div' && dropTargets.indexOf(el) != -1) return 3;
  if(((tag == 'input' && el.type.toLowerCase() == 'text') || tag == 'textarea') && (el.disabled == false && el.readOnly == false)) return 1;
  if(el.isContentEditable && (el.parentNode.isContentEditable == false || tag == 'body')) return 2;
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
  var all = doc.getElementsByTagName('*');
  for(var l = all.length; l--;){
    if(isDroppable(all[l])){
      renderTarget(all[l]);
      console.log(window);
      var x = window, z = 0;
      while(x != top){ x = x.parent; z++}
      console.log(z);
      //dropTargets.push(all[l]);
    }
  }
}




doc.documentElement.addEventListener('dragenter', function(e){
  lastDrag = +new Date; 
  
  if(isDragging == false && e.dataTransfer.types.indexOf('Files') != -1 && e.dataTransfer.types.indexOf('text/uri-list') == -1){
    isDragging = true;
    setTimeout(getTargets, 500);
  }

}, false);

doc.documentElement.addEventListener('dragover', function(e){
  //allow default to happen for normal drag/drops
  console.log('dragover');
  lastDrag = +new Date; 
}, false);

doc.documentElement.addEventListener('dragleave', function(e){
  var lastBodyLeave = +new Date;
  console.log('dragleave');
  setTimeout(function(){
    if(lastDrag < lastBodyLeave){
      clearTargets();
    }
  },50)
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

