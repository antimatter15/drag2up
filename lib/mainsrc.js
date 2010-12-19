const data = require("self").data;
var pageWorkers = require("page-worker");
var pageMod = require("page-mod");
var XMLHttpRequest = require("xhr").XMLHttpRequest;
var tabs = require('tabs');


var simpleStorage = require("simple-storage");
var localStorage = simpleStorage.storage;


XMLHttpRequest.prototype.__defineSetter__('onload', function(cb){
  this.onreadystatechange = function(){
    if(this.readyState == 4) cb();
  }
})

var customEvent = document.createEvent('Event');
customEvent.initEvent('drag2uplocalstorage', true, true);
document.dispatchEvent(customEvent);

pageMod.PageMod({
  include: data.url("options.html"),
  contentScriptWhen: 'ready',
  contentScript: "var pm = postMessage;document.addEventListener('drag2uplocalstorage',function(e){console.log('got message');pm(e.data)},true)",
  onAttach: function(worker){
    console.log('onAttach was triggered for options panel');
    worker.on('message', function(data) {
      console.log('recieved message from robot overloards');
      console.log(data)
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
