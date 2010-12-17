const data = require("self").data;

var pageMod = require("page-mod");
pageMod.PageMod({
  include: "*",
  contentScriptWhen: 'ready',
  contentScript: 'document.body.innerHTML = ' +
                 ' "<h1>Page matches ruleset</h1>";'
});

