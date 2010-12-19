function initialize(){

  if(!document){ /*console.warn('no document'); */return}
  if(!window.top){ /*console.warn('no top', location.href); */return};
  if(document.__drag2up){/*console.warn('already exists in this window');*/ return}

  document.__drag2up = true;
  /*
  window.addEventListener('drag2upTestEvent', function(e){ 
    e.preventDefault(); 
    e.stopPropagation(); 
    e.stopImmediatePropagation(); 
    return false
  }, true);
  */

  var isDragging = false;
  var dropTargets = [];
  var lastDrag = 0;
  var postMessageHeader = '!/__drag2up-$/!'; //crammed a bunch of random characters
  var callbacks = {};

  //instance ID. useful for debugging.


  var iId = Math.random().toString(36).substr(2,3);


  //console.log('initialized ',iId,' at', location.href);

  function clearTargets(){
  console.log('clear targets');
  //return;
    isDragging = false;
    for(var i = dropTargets.length; i--;){
      if(dropTargets[i] && dropTargets[i].parentNode && dropTargets[i].hasDropped == false){
        //TODO: move function declaration outside of loop for speed/mem
        (function(target){
          target.style.opacity = '0';
          setTimeout(function(){
            if(target.parentNode) target.parentNode.removeChild(target);
          },500);
        })(dropTargets[i]);
      }
    }
    dropTargets = [];
  }

  // determines if an element can be droppable based on several conditions
  function isDroppable(el){
    if(!el) return false;
    var tag = 'unknown', A;
    
    if(el.offsetWidth * el.offsetHeight < 100) return false;
    
    if(el.tagName && typeof el.tagName.toLowerCase == 'function') tag = el.tagName.toLowerCase();
    
    //if(tag == 'div' && dropTargets.indexOf(el) != -1) return 3;
    if(((tag == 'input' && el.type.toLowerCase() == 'text') || tag == 'textarea') && (el.disabled == false && el.readOnly == false)) A =  1;
    if(el.isContentEditable && el.parentNode.isContentEditable == false) A = 2.5; //aaah! close your eyes! it's too hacky!
    if(el.isContentEditable && tag == 'body') A = 2;
    //structured this weird way because profiling shows this part is the slowest
    if(A == 2){
      return A;
    }else if(A == 1 || A == 2.5){
      //console.log('got close to soemthign');
      //return true
      var pos = findPos(el); //oh crap this is hacky
      //for fixed positioned elements
      var over_el = el.ownerDocument.elementFromPoint(pos[0]+4, pos[1]+4);
      if(over_el == el) return ~~A;
      if(over_el && over_el.tagName.toLowerCase() == 'label') return ~~A;
      //for absolutely positioned elements
      var over_mid = el.ownerDocument.elementFromPoint(pos[0]+4 - scrollX, pos[1]+4-scrollY);
      if(over_mid == el) return ~~A;
      
      if(over_mid && over_mid.tagName.toLowerCase() == 'label') return ~~A;
      
      //console.log('booooooo', el, over_mid, over_el, pos, scrollX, scrollY);
      
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
    
    //console.log('hey root', msg,window, window.top, window.parent);
  }

  function trickleMessage(msg){
    //based on Stephen Colbert's economic "trickle down" theory. Lime flavored event messages are given to 
    //the top 3% root windows, which flow through the system and eventually trickle down to the other 97%
    //http://www.colbertnation.com/the-colbert-report-videos/341481/july-28-2010/the-word---ownership-society
    window.top && top.postMessage && window.top.postMessage(postMessageHeader + 'trickle_' + msg, '*');
    //console.log('trikling', window.top, window.top.postMessage);
  }
  
  
  var rootSearching = false;
  function testDragRoot(){
    rootSearching = true;
    if(lastDrag < +new Date - 500){
      trickleMessage('deactivate');
    }
    
    if(isDragging){
      setTimeout(testDragRoot, 100);
    }else{
      rootSearching = false
    }
  }
  

  window.addEventListener('message', function(e){
    if(e.data.substr(0, postMessageHeader.length) != postMessageHeader) return;
    var data = e.data.substr(postMessageHeader.length);
    if(data.substr(0,7) == 'trickle'){
      //propagate downwards
      for(var i = 0; i < frames.length; i++){
        if(frames[i]){
          frames[i] && frames[i].postMessage && frames[i].postMessage(e.data, '*');
        }else{
          //bypass the weird stuff that content scripts do
          var s = document.createElement('script');
          s.innerHTML = "frames["+i+"] && frames["+i+"].postMessage && frames["+i+"].postMessage("+JSON.stringify(e.data)+", '*');";
          document.documentElement.appendChild(s);
          s.parentNode.removeChild(s);
        }
      }
      

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
        if(isDragging == false){
          addSettingsDropper()
          trickleMessage('reactivate');
        }
        lastDrag = (+new Date); //TODO; utilize the value that got passed
        
        if(rootSearching == false){
          testDragRoot();
        }
      }else if(cmd == 'root_deactivate'){
        var lastDeactivation = +new Date;
        setTimeout(function(){
          //console.log('check deact', lastDrag - lastDeactivation);
          if(lastDrag < lastDeactivation){
          
            trickleMessage('deactivate');
            //console.warn('fuh reeelz!',lastDeactivation - lastDrag)
            
          }
        },300);
      }else if(cmd == 'root_forcedkill'){ //woot, same length!
        trickleMessage('deactivate');
        
      //}else if(cmd == 'root_initupload' || cmd == 'root_uploaddata'){
      }else if(cmd == 'root_background'){
        var json = JSON.parse(data.substr(15));
        try{
          if(window.chrome && chrome.extension && chrome.extension.sendRequest){
            chrome.extension.sendRequest(json, function(data){
              trickleMessage('docallback'+JSON.stringify(data));
            });
          }else{
            console.log('used postMessage trickle');
            onMessage = function(msg) {
              trickleMessage('docallback'+msg);
            }
            postMessage(JSON.stringify(json)); //TODO: make it more efficient. don't decode and reencode json
          }
        }catch(err){
          console.log('could not transmit');
          trickleMessage('docallback'+JSON.stringify({
            callback: json.id,
            url: 'error: could not send request to background page'
          }))
        }
      }
    }
  }, true)

  

  function insertLink(el, url, type){
    console.log('insertLink',iId, el, url, type);
    try{
      el.focus();
      /*
      var evt = el.ownerDocument.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, true, el.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      el.dispatchEvent(evt);
      */
      el.focus();
    }catch(err){};
    //try{el.select();}catch(err){};
    setTimeout(function(){
      try{el.focus();}catch(err){};
    },100);
    setTimeout(function(){
    try{el.focus();}catch(err){};
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
        var a = document.createElement('a');
        a.href = url;
        a.innerText = url;
        el.appendChild(a);
        el.appendChild(document.createTextNode(' ')); //add a space at the end
        //links dont tend to work as well
        
        //var span = document.createElement('span');
        //span.innerText = data.url;
        //el.appendChild(span);
      }
    },200);
  }


  function addSettingsDropper(){
    console.log('showing magic thing');
    var mask = document.createElement('div'); //this is what we're making!
    document.body.appendChild(mask);
    dropTargets.push(mask);
    
    var opacity_normal = '0.84', opacity_hover = '0.42';
    mask.style.opacity = opacity_normal;
    mask.style.backgroundColor = "rgb(224,167,67)"; //a shade of orange
    mask.style.position = 'absolute';
    mask.style.zIndex = 9007199254740991;
    mask.style.webkitTransition = 'opacity 0.5s ease'
    mask.style.MozTransition = 'opacity 0.5s ease'
    mask.style.textAlign = 'center';
    mask.style.color = 'white';
    mask.style.borderRadius = '5px';
    mask.style.webkitBorderRadius = '5px';
    mask.style.MozBorderRadius = '5px';
    mask.style.fontFamily = 'sans-serif, arial, helvetica'
    mask.innerHTML = 'drag2up <b>settings</b>';
    mask.hasDropped = false;
    
    mask.style.bottom = '20px';
    mask.style.right = '20px';
    mask.style.padding = '7px';
    mask.style.paddingTop = '10px';
    mask.style.paddingBottom = '10px';
    mask.style.fontSize = '16px';

    mask.addEventListener('dragenter', function(e){ mask.style.opacity = opacity_hover; }, false);
    mask.addEventListener('dragleave', function(e){ mask.style.opacity = opacity_normal;}, false);
    //
    mask.addEventListener('dragover', function(e){ 
      if(isDragging) propagateMessage('reactivate');
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
  }


  function renderTarget(el){
    for(var i = dropTargets.length; i-- && dropTargets[i].dropTarget != el;){};
    
    if(i != -1) return; //already rendered
    
    if(!el || !el.parentNode) return;
    var pos = findPos(el), width = el.offsetWidth, height = el.offsetHeight;
    if(!width && !height) return; //no zero widther
    
    console.log('render drop target',iId, el);
    
    
    var opacity_normal = '0.84', opacity_hover = '0.42';
    var mask = document.createElement('div'); //this is what we're making!
    mask.style.opacity = '0'; //set to zero initially, for nice fade in

    document.body.appendChild(mask);
    dropTargets.push(mask);
    
    setTimeout(function(){ mask.style.opacity = opacity_normal;},10);
    
    mask.style.backgroundColor = "rgb(50,150,50)"; //a shade of green
    mask.dropTarget = el; //reference original element
    mask.style.position = 'absolute';
    
    
    
    mask.style.zIndex = 9007199254740991;
    mask.style.webkitTransition = 'opacity 0.5s ease'
    mask.style.MozTransition = 'opacity 0.5s ease'
    mask.style.textAlign = 'center';
    mask.style.color = 'white';
    mask.style.borderRadius = '5px';
    mask.style.webkitBorderRadius = '5px';
    mask.style.MozBorderRadius = '5px';
    mask.style.fontFamily = 'sans-serif, arial, helvetica'
    mask.innerHTML = '<b>drop files</b> here';
    mask.hasDropped = false;
    
    mask.contentEditable = 'false'; //hey - everyone who is bored by waiting long durations can have fun editing it
    //actually that was a really dumb idea. undid it.
    
    //so apparently, Apple synces the blinky power light with human breathing which is more emotionally awesome
    //so logically, this is totally what I'm going to do. It's going to blinky blinky with the pattern of breathing
    //so you aren't annoyed by how slow imgur is at uploading a two megabyte image that you took in paris that
    //totally looks like that scene from Inception.
    
    //http://en.wikipedia.org/wiki/Respiratory_rate says that the human breathing rate is 12/60 hertz
    //that means that you breathe once every five seconds on average
    //and that means each half-breath is 2.5 seconds

    //this was more important the last version when there wasnt the magical instant feature


    
    var cx = pos[0] + width/2 , cy = pos[1] + height/2 ;
    var pad = 5; //five pixel padding for normal thingsies
    if(el.tagName.toLowerCase() == 'body'){
      mask.style.position = 'fixed';
      
      height = el.ownerDocument.documentElement.offsetHeight;
      width = el.ownerDocument.documentElement.offsetWidth;
      
      height = Math.min(height, innerHeight/2);
      width = Math.min(width, innerWidth/2);
      
      width = Math.min(200, width);
      height = Math.min(80, height);
    }
    
    if(width * height > 32000){ //a random magic number. Basically, it's derived from twitter's whats happening box which is 482x56
      //and thats close to 500x60 which is 30,000 but 32,000 feels nicer.
      //here, the box is too big, so instead of covering it, you make a smaller one in the center  
      width = Math.min(200, width);
      height = Math.min(80, height);
    }
    
    mask.style.left = Math.max(0,cx - width/2 - pad)+'px';
    mask.style.top = Math.max(0,cy - height/2 - pad)+'px';
    
    mask.style.width = width+'px';
    mask.style.height = height+'px';
    
    mask.style.padding = pad+'px';

    mask.style.fontSize = '16px';

    mask.addEventListener('dragenter', function(e){ mask.style.opacity = opacity_hover; }, false);
    mask.addEventListener('dragleave', function(e){ mask.style.opacity = opacity_normal;}, false);
    mask.addEventListener('dragover', function(e){ 
      if(isDragging) propagateMessage('reactivate');
      e.preventDefault();
      e.stopPropagation();
      e.stopPropagation();
      return false;
    }, true);
    
    mask.addEventListener('drop', function(e){
      setTimeout(function(){
        if(mask.parentNode){
          mask.style.webkitTransition = 'opacity 2.5s ease'
          mask.style.MozTransition = 'opacity 2.5s ease'
          var opacity_breathe = "0.2"
          mask.style.opacity = (mask.style.opacity == opacity_breathe)?opacity_normal:opacity_breathe;
          setTimeout(arguments.callee, 2500);
        }
      }, 2500);
      
      console.log('file was dropped');
      
      setTimeout(function(){
        propagateMessage('forcedkill');
        var leaveEvent = document.createEvent('Event');
        leaveEvent.initEvent('drop', true, true);
        el.dispatchEvent(leaveEvent);
      },0);
      
      e.preventDefault();
      e.stopPropagation();

    
      console.log('drop event', +new Date);
      
      var files = e.dataTransfer.files;
      
      console.log(files.length);
      var url, numleft = 0;
      
      function uploadFile(file){
        numleft++;
        var cb = Math.random().toString(36).substr(3);
        callbacks[cb] = function(data){
          numleft--;
          insertLink(el, data.url, file.type);
          if(numleft == 0) mask.parentNode.removeChild(mask);
          delete callbacks[cb];
        }
        file.id = cb;
        console.log('sent upload msg', +new Date);
        propagateMessage('background'+JSON.stringify(file))
      }
      
      if(files.length == 0 && (url = e.dataTransfer.getData('url'))){
        console.log('uploading URL', url);
        uploadFile({url: url, name: url.replace(/^.+\/([^\?\#]+).*$/,'$1'), type: "image/png" /*more or less all iamges dropped this way for now are going to be images*/ });
      }else if(files.length > 0){
        console.log('uploading actual files', files.length);
        for(var i = 0; i < files.length; i++){
          var file = files[i];
          console.log('found file', file);
          //10MB is the new limit. why? it's yet another random number. drag2up crashed with a 20MB file.
          if(file.size > 1024 * 1024 * 10 && !confirm('The file "'+file.name+'" is over 10MB. Are you sure you want to upload it?')) continue;
          var url;
          if(window.createObjectURL){
            url = window.createObjectURL(file)
          }else if(window.createBlobURL){
            url = window.createBlobURL(file)
          }else if(window.URL && window.URL.createObjectURL){
            url = window.URL.createObjectURL(file)
          }
          if(url){
            uploadFile({url: url, name: file.name, size: file.size, type: file.type});
          }else{
            var fr = new FileReader();
            fr.onload = function(){
              uploadFile({url: fr.result, name: file.name, size: file.size, type: file.type});
            }
            fr.readAsDataURL(file);
          }
        }
      }
      
      if(numleft != 0){
        mask.hasDropped = true;
        
        mask.style.backgroundColor = '#007fff';
        if(numleft == 1){
          mask.innerHTML = 'uploading file';
        }else{
          mask.innerHTML = 'uploading '+numleft+' files';
        }
      }else{
        mask.parentNode.removeChild(mask);
      }
    }, true);
    
  }


  function getTargets(){
    if(document.body && document.body.isContentEditable){
      renderTarget(document.body);
    }else{
      var all = document.getElementsByTagName('*');
      for(var l = all.length; l--;){
        if(isDroppable(all[l])) renderTarget(all[l]);
      }
    }
    

  }




  document.documentElement.addEventListener('dragenter', function(e){
    //console.log(e.dataTransfer, e)
    if(!e.dataTransfer) return;
    var types = Array.prototype.slice.call(e.dataTransfer.types, 0);
    //console.log(types);
    if(types.indexOf('Files') != -1 && types.indexOf('text/uri-list') == -1){
      propagateMessage('reactivate');
    }else if(types.join(',') == 'text/html,text/uri-list,url'){ //images from other pages
      propagateMessage('reactivate');
    }
    
  }, false);

  document.documentElement.addEventListener('dragover', function(e){
    //allow default to happen for normal drag/drops
    isDragging && propagateMessage('reactivate');
  }, false);

  document.documentElement.addEventListener('mousemove', function(e){
    //allow default to happen for normal drag/drops
    isDragging && propagateMessage('reactivate');
  }, false);

  document.documentElement.addEventListener('dragleave', function(e){
    //console.log('leaving dragging');
    
    //go ahed
    isDragging && propagateMessage('deactivate');
  }, false);


  document.documentElement.addEventListener('mouseup', function(e){
    if(isDragging) propagateMessage('forcedkill');
  }, false);


  /*
  document.documentElement.addEventListener('drop', function(e){
    console.log(e);
  }, false);
  */

  //*
  var lastFrameLength = 0;
  window.setInterval(function(){
    if(frames.length > lastFrameLength){
    //console.log('found a new frame');
      var init = function(){
        for(var l = 0; l < frames.length; l++){
          try{
            //check to make sure drag2up isnt already loaded
            if(!frames[l].document.__drag2up){
              frames[l].eval("("+initialize.toString()+")()");
            }
            
          }catch(err){};
        }
      }
      var script = document.createElement('script');
      script.innerHTML = '(function(){'+initialize.toString()+';('+init.toString()+')();})()';

      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
      lastFrameLength = frames.length;
    }
  },1000)
  //*/




}

initialize();




