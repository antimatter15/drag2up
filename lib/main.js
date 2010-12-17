const data = require("self").data;
var pageWorkers = require("page-worker");
var pageMod = require("page-mod");

pageMod.PageMod({
  include: "*",
  contentScriptWhen: 'ready',
  contentScriptFile: data.url("drag2up.js"),
  onAttach: function(worker){
  }
});


pageWorkers.Page({
  contentURL: data.url("background.html"),
  onMessage: function(msg){
    
  }
})
