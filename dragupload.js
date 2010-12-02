function initialize(doc){
if(!doc){ console.warn('no document'); return}

var isDragging = false;
var dropTargets = [];
var lastDrag = 0;
var postMessageHeader = '!/__drag2up-$/!'; //crammed a bunch of random characters

function clearTargets(){
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
    if(data == 'trickle_reactivate'){ //it should just be activate, but re seems like a good prefix to make them the same length
      if(isDragging == false){
        isDragging = true;
        getTargets();
      }
    }else if(data == 'trickle_deactivate') clearTargets();
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
          //console.warn('fuh reeelz!')
          
        }
      },200);
    }else if(cmd == 'root_forcedkill'){ //woot, same length!
      isDragging && trickleMessage('deactivate');
    }
  }
})


function renderTarget(el){
  var pos = findPos(el), width = el.offsetWidth, height = el.offsetHeight;
  if(!width && !height) return; //no zero widther
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
  if(width * height > 32000){ //a random magic number. Basically, it's derived from twitter's whats happening box which is 482x56
    //and thats close to 500x60 which is 30,000 but 32,000 feels nicer.
    //here, the box is too big, so instead of covering it, you make a smaller one in the center  
  
  }else{
    var padding = 5; //five pixel padding for normal thingsies
  }
  
  mask.style.left = pos[0]-pad+'px';
  mask.style.top = pos[1]-pad+'px';


  var fontSize = Math.sqrt(Math.min(height,width)/50)*20;
  var tpad = Math.max(0, height/2 - fontSize * 0.6);

    
  mask.style.width = width+'px';
  mask.style.height = height-tpad+'px';
  mask.style.padding = pad+'px';
  mask.style.paddingTop = (pad+tpad)+'px';
  
  

  
  mask.style.fontSize = fontSize+'px';

  mask.addEventListener('dragenter', function(e){
    mask.style.opacity = opacity2;
  }, false);
  mask.addEventListener('dragleave', function(e){
    mask.style.opacity = opacity;
  }, false);
  mask.addEventListener('dragover', function(e){
    e.preventDefault();
  }, true);
  mask.addEventListener('drop', function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    mask.hasDropped = true;
    clearTargets();
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
  propagateMessage('deactivate');
}, false);


doc.documentElement.addEventListener('mouseup', function(e){
  if(isDragging) propagateMessage('forcedkill');
}, false);


//TODO: shift key forcedkill

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

