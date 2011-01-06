const data = require("self").data;
var pageWorkers = require("page-worker");
var pageMod = require("page-mod");
var XMLHttpRequest = require("xhr").XMLHttpRequest;
var tabs = require('tabs');


var simpleStorage = require("simple-storage");
var localStorage = simpleStorage.storage;
var setTimeout = require('timer').setTimeout;

XMLHttpRequest.prototype.__defineSetter__('onload', function(cb){
  this.onreadystatechange = function(){
    if(this.readyState == 4) cb();
  }
})

pageMod.PageMod({
  include: data.url("options.html"),
  contentScriptWhen: 'ready',
  contentScript: "var el=document.createElement('input');el.type='hidden';el.id='drag2uplocalstorage';document.body.appendChild(el);var pm = postMessage;el.addEventListener('drag2upsave',function(e){console.log('got message',el.value);pm(el.value)},true);var evt=document.createEvent('Event');evt.initEvent('drag2upread',true,true);onMessage=function(data){el.value=data;el.dispatchEvent(evt);}",
  onAttach: function(worker){
    console.log('onAttach was triggered for options panel');
    worker.on('message', function(data) {
      console.log('recieved message from robot overloards');
      console.log(data)
      if(data == '__get'){
        console.log(JSON.stringify(localStorage));
        console.log('posting data');
        worker.postMessage(JSON.stringify(localStorage));
      }else{
        console.log('parsing data');
        var json = JSON.parse(data);
        for(var i in json){
          console.log('setting',i,'to',json[i]);
          localStorage[i] = json[i];
        }
      }
    });
  }
});


pageMod.PageMod({
  include: "*",
  contentScriptWhen: 'ready',
  contentScriptFile: data.url("drag2up.js"),
  onAttach: function(worker){
    console.log('onAttach was triggered');
    worker.on('message', function(data) {
      console.log('got message on the pagemod');
      console.log(data);
      
      handleRequest(JSON.parse(data), 42, function(r){
        console.log('super done processing stuffs');
        console.log(r)
        worker.postMessage(JSON.stringify(r));
      })
      
    });
  }
});
