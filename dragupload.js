function initialize(doc){
function isDroppable(el){
  var tag = el.tagName.toLowerCase();

  if((tag == 'input' && el.type.toLowerCase() == 'text') || tag == 'textarea'){
		if(el.disabled == false && el.readOnly == false){
    	return 1
		}
  }
  if(el.isContentEditable){ //two differnt modes of insertion
		if(el.parentNode.isContentEditable == false || tag == 'body'){
    	return 2; //content editable divs are a bit hard
		}
  }

  return false;
}

var dropTargets = [];

function sendRequest(data, callback){
  if(typeof chrome != 'undefined' && typeof chrome.extension != 'undefined' && typeof chrome.extension.sendRequest != 'undefined'){
    chrome.extension.sendRequest(data, callback);
  }else{
    //var customEvent = document.createEvent('Event');
    //customEvent.initEvent('drag2upbubble', true, true);
    //customEvent.xeventdata = JSON.stringify(data);
    //window.top.document.documentElement.dispatchEvent(customEvent);
		var n = '_$c411b4ck_'+Math.random().toString(36).substr(4,6);
		window[n] = function(superdata){
			callback(superdata);
		}
		data._callback = n;

		window.top.postMessage('$$D2U##'+JSON.stringify(data), '*')
  }
}


window.addEventListener('message', function(e){
	//hi.
	console.log(e.data.substr(0,8))
	if(e.data.substr(0,7) == '__D2U@@'){
		var json = JSON.parse(e.data.substr(7));
		window[json._callback](json);
	}
}, false);

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
	var opacity = "0.84";
	var opacity2 = "0.42"
  mask.style.opacity = opacity;
  mask.style.backgroundColor = "rgb(50,150,50)";
  mask.dropTarget = el;

  mask.style.position = 'absolute';
  var pad = 5;
  
  mask.style.left = pos[0]-pad+'px';
  mask.style.top = pos[1]-pad+'px';
  mask.style.width = width+'px';
  mask.style.height = height+'px';
  mask.style.padding = pad+'px';
  mask.style.zIndex = 9007199254740991;
  mask.style.webkitTransition = 'opacity 0.5s ease'
  mask.style.textAlign = 'center';
  mask.style.fontSize = 'large';
  mask.style.color = 'white';
	mask.style.borderRadius = pad+'px';
	mask.style.webkitBorderRadius = pad+'px';
  mask.style.fontFamily = 'sans-serif, arial, helvetica'
  mask.innerHTML = 'Drop file here';
  mask.hasDropped = false;
  mask.addEventListener('dragenter', function(e){
		mask.style.opacity = opacity2; //so long and thanks for all the fish
	}) 
	mask.addEventListener('dragleave', function(e){
		mask.style.opacity = opacity;
	}) 
  mask.addEventListener('drop', function(e){
		mask.style.opacity = opacity2;
    var files = e.dataTransfer.files;

    if(files.length == 0) return;
    
    mask.hasDropped = true;
    mask.style.backgroundColor = '#007fff';
    mask.style.fontSize = 'large';


		//so apparently, Apple synces the blinky power light with human breathing which is more emotionally awesome
		//so logically, this is totally what I'm going to do. It's going to blinky blinky with the pattern of breathing
		//so you aren't annoyed by how slow imgur is at uploading a two megabyte image that you took in paris that
		//totally looks like that scene from Inception.
		
		//http://en.wikipedia.org/wiki/Respiratory_rate says that the human breathing rate is 12/60 hertz
		//that means that you breathe once every five seconds on average
		//and that means each half-breath is 2.5 seconds
		
		var indicators = [];
		var files_left = 0;
		
		
		var rate = 2.5;
  	mask.style.webkitTransition = 'opacity '+rate+'s ease';
		var breathe = function(){
			if(mask && mask.parentNode && files_left > 0){
				mask.style.opacity = mask.style.opacity == opacity ? opacity2: opacity;
				//toggle the opacity
				setTimeout(breathe, rate * 1000)
			}
		};
		setTimeout(breathe, 0);
		
    for(var i = 0; i < files.length; i++){
			
      if(files[i].size > 1024 * 1024 * 5) {
        if(!confirm('The file "'+files[i].name+'" is over 5MB. Are you sure you want to upload it?')) continue;
      }
			files_left++;
			mask.innerHTML = 'Uploading '+files_left+' file(s)';
      var reader = new FileReader();  
      reader.onerror = function(e){
        console.log(e)
      }
      reader.onload = (function(el, file, index){
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
							files_left--;
    					mask.innerHTML = 'Uploading '+files_left+' file(s)';

							if(files_left == 0){
	              try{
		  						mask.style.webkitTransition = 'opacity 0.6s ease'
									mask.style.opacity = '0';
									setTimeout(function(){
										mask.parentNode.removeChild(mask);	
									},700);
								}catch(err){};
							}
							try{el.focus();}catch(err){};
              //try{el.select();}catch(err){};
              setTimeout(function(){
                if(elt == 1){ //input
                  if(el.value.slice(-1) != ' ' && el.value != '') el.value += ' ';
                  el.value += data.url + ' ';
                }else if(elt == 2){ //contentEditable
                  //var a = doc.createElement('a');
                  //a.href = data.url;
                  //a.innerText = data.url;
                  //el.appendChild(a);
									//links dont tend to work very well
									var span = doc.creatElement('span');
									span.innerText = data.url;
									el.appendChild(span);
                }
              },100);
            });
        }
      })(el, files[i], i);
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
	lastDrag = +new Date; 
  if(dropTargets.length == 0 && e.dataTransfer.types.indexOf('Files') != -1){
    getTargets();
  }

  if(dropTargets.length != 0){
		e.stopPropagation();
  	e.preventDefault();
	}

}, false);

var lastDrag = 0;

doc.documentElement.addEventListener('dragover', function(e){
	//allow default to happen for normal drag/drops
	lastDrag = +new Date; 
  if(dropTargets.length != 0){
		e.stopPropagation();  
  	e.preventDefault();
	}
}, false);

doc.documentElement.addEventListener('drop', function(e){
	//dont do anything if theres nowhere to drag to
	if(dropTargets.length != 0){
  	e.stopPropagation();  
  	e.preventDefault();  
  	clearTargets();
	}
}, false);

doc.documentElement.addEventListener('dragleave', function(e){
	var lastBodyLeave = +new Date;
	setTimeout(function(){
		if(lastDrag < lastBodyLeave){
			//go ahead and leave me.
			//i think i prefer
			//to stay
			//inside
			//...even though
			//you broke my heart
			//and killed me
			//aperture science
			//we do what we must
			//because
			//we can
			//maybe you'll find someone else
			//to help you
			
			clearTargets();
		}
	},50)
}, false);


doc.documentElement.addEventListener('click', function(e){
	//hi.
  clearTargets();
}, false);
}

initialize(document);

window.addEventListener('message', function(e){
	//hi.
	console.log(e.data.substr(0,8))
	if(e.data.substr(0,7) == '$$D2U##'){
		var json = JSON.parse(e.data.substr(7));
		console.log('json')
		chrome.extension.sendRequest(json, function(res){
			console.log('got data back woot')
			res._callback = json._callback;
			e.source.postMessage('__D2U@@'+JSON.stringify(res), "*")
		})
	}
}, false);



setTimeout(function(){
	if(frames.length > 0){
		var init = function(){
			for(var l = frames.length; l--;){
				try{initialize(frames[l].document);}catch(err){};
			}
		}
		var script = document.createElement('script');
		script.innerHTML = '(function(){'+initialize.toString()+';('+init+')();})()';
		document.documentElement.appendChild(script);
	}
},1500)

