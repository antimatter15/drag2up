const data = require("self").data;
var pageWorkers = require("page-worker");
var pageMod = require("page-mod");
var XMLHttpRequest = require("xhr").XMLHttpRequest;
var tabs = require('tabs');
XMLHttpRequest.prototype.__defineSetter__('onload', function(cb){
  console.log('set onload');
  this.onreadystatechange = function(){
    if(this.readyState == 4){
      console.log('firing clalack');
      cb();
    }
  }
})


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

var simpleStorage = require("simple-storage");
var localStorage = simpleStorage.storage;
