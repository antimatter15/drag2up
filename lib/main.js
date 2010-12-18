const data = require("self").data;
var pageWorkers = require("page-worker");
var pageMod = require("page-mod");

pageMod.PageMod({
  include: "*",
  contentScriptWhen: 'ready',
  contentScriptFile: data.url("drag2up.js"),
  onAttach: function(worker){
    console.log('onAttach was triggered');
    worker.on('message', function(data) {
      console.log('got message on the pagemod');
      console.log(data);
    });
  }
});


var Request = require('request').Request;
Request({
  url: data.url('background.html'),
  onComplete: function (response) {
    var urls = response.text.split('\n').filter(function(tex){
      return /^<script/.test(tex)
    }).map(function(tex){
      return data.url(tex.match(/src=['"](.*)['"]/)[1]);
    });
    
    console.log(urls)
    
  }
}).get();


pageWorkers.Page({
  contentURL: 'about:blank',
  contentScript: 'var xhr = new XMLHttpRequest();xhr.open("GET", "http://antimatter15.com", false);xhr.send();postMessage(xhr.responseText)',
  onMessage: function(msg){
    console.log('magical poopy poop');
    console.log(msg);
  }
})

/*

pageWorkers.Page({
  contentURL: data.url("background.html"),
  onMessage: function(msg){
    
  }
})*/
