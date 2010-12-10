[INSTALL HERE](https://chrome.google.com/webstore/detail/bjgjolhpdlgebodaapdafhdnikagbfll) ← probably what you want to do 

[FOLLOW ME ON TWITTER](http://twitter.com/antimatter15) (probably not as important, but a more significant motivation for improving this)


Okay, so now I'm going to write a semblance of a readme file. Hopefully, there's really not that much to read about, this project is the source code behind the infinitely awesome drag2up extension (for lack of a better name). It was at one point up2drag/updrag and now lift/airfoil sounds like a pretty decent although undescriptive name. Either way, blah blah blah, here's a readme.

### drag2up v2

drag2up v2 is a major rewrite of the drag2up codebase. The content script has been rewritten with a new, more reliable, controlled, and logical design. It is now consistent across frames and editable frames. It's been changed to support the new instant architecture, a broad range of web apps, animations and more. 

The most radical changes are elsewhere, in the background page and the new options page. Instead of hard coded hosts for imgur and github, there is an intuitive drag-drop options page where hosts like Dropbox, CloudApp, Imageshack, Pastebin,  hotfile, Imgur and Github can be dragged into respective positions to configure.

Dropbox, CloudApp, hotfile and Imageshack rely on a xhr.sendMultipart function that allows sending of files via xhr. This function currently only works on Chrome 9.0+ which supports Array Buffers and typed arrays. A server side proxy might be constructed to proxy these requests.


#### simplified how stuff works (awesome site/book btw)

1. content script attaches to dragstart (or is it dragenter) event. test for if the event is a file drag based on properties of the types attribute on dataTransfer. when it's triggered, postMessage to window.top a message that says that dragging has begun.
2. on the window.top content script instance, once the drag begin message is recieved, begin a "trickle" message where you postMessage to all immediately accessible frames to recursively attempt to do the trickle. Each node that receives the message sets the isDragging variable to true and loops through all elements on the page detecting which ones are droppable. render the targets.
3. Rendered targets are divs with rounded corners and a translucent green background. On hover, it changes opacity. When it's dropped, the color becomes blue. A message is sent via postMessage to the page top first describing the file properties, name, size, type. window.createObjectURL is run to create a blob uri and the blob uri is sent to the top window using postMessage.
4. The page top uses chrome.extension.sendRequest to communicate with the background page
5. decode/download the URL into a binary string with either a dataurl decoding scheme or a cross origin enabled privledged XHR.
6. __(instant)__ The background page requests stuff with the drag2up.appspot.com api in order to create a new upload, stores the nuclear launch codes that are returned, and sends the callback.
__(slow)__ The background page waits for the file, picks the appropriate host based on localStorage data and filetype guessing using mimetypes and other magic. The file is then uploaded to the server, and the response link is sent to the callback.
7. the response is trickled down to all the frames where the appropriate listener is dispatched to add the url/link/image to an element. 
8. __(instant)__ The background page gets the second message with the file contents, picks a host based on the data, filetype, and settings, uploads to the host, and gets the url.
9. __(instant)__ The url from the file host is then sent through the drag2up.appspot.com api again to complete the upload where events on the channel api are dispatched to immediately notify listening downloaders that the file is available for download.

### Credits
It was developed by [@antimatter15](http://twitter.com/antimatter15) (P.S. You should totally follow him on twitter). Wow it feels awkward writing in third person like that. So yes, *I* wrote it. And I'm going to mention that at time of writing I'm 15 because that tends to make people think I'm smarter than I actually am.

But of course this application builds on some awesome work by other people. Mostly documentation, but a little bit of code too. I have no idea what this is licensed, but I'll just say that it's whatever license doesn't conflict with the code that I've included here, so probably GPL.

Here's some projects that have been incorperated into this:

* https://github.com/bslatkin/clip-it-good (Picasa)
* https://github.com/kenotron/chromepad (Dropbox)
* http://jqueryui.com/ (Because [I was sick of using the html5 drag drop api](http://www.quirksmode.org/blog/archives/2009/09/the_html5_drag.html) and jquery ui had nice docs)
* http://demos.hacks.mozilla.org/openweb/imageUploader/js/extends/xhr.js

These sites had the documentation that I used to develop stuff.

* https://chrome.google.com/extensions/detail/mdddabjhelpilpnpgondfmehhcplpiin (A stretch, but it introduced me to the imm.io hosting service and I made my implementation by sniffing traffic data)
* http://code.google.com/p/chromium/issues/detail?id=35705#c6
* http://efreedom.com/Question/1-3743047/Uploading-Binary-String-WebKit-Chrome-Using-XHR-Equivalent-Firefoxs-SendAsBinary
* http://pastebin.com/api.php
* https://www.dropbox.com/developers
* https://github.com/evnm/dropbox-node
* https://github.com/cramforce/streamie (yeah, you might wonder why a twitter client's here. simply, I based the imgur hosting script off of the one in streamie, that I found while developing my fork. Great app anyway.)
* http://gist.github.com/4277 (Gist API)
* http://imageshack.us/content.php?page=developer
* http://api.hotfile.com/?c=getuploadserver
* http://support.getcloudapp.com/faqs/developers/api
