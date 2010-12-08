[INSTALL HERE](https://chrome.google.com/extensions/detail/bjgjolhpdlgebodaapdafhdnikagbfll) <== probably what you want to do

### drag2up v2

drag2up v2 is a major rewrite of the drag2up codebase. The content script has been rewritten with a new, more reliable, controlled, and logical design. It is now consistent across frames and editable frames. It's been changed to support the new instant architecture, a broad range of web apps, animations and more. 

The most radical changes are elsewhere, in the background page and the new options page. Instead of hard coded hosts for imgur and github, there is an intuitive drag-drop options page where hosts like Dropbox, CloudApp, Imageshack, Pastebin,  hotfile, Imgur and Github can be dragged into respective positions to configure.

Dropbox, CloudApp, hotfile and Imageshack rely on a xhr.sendMultipart function that allows sending of files via xhr. This function currently only works on Chrome 9.0+ which supports Array Buffers and typed arrays. A server side proxy might be constructed to proxy these requests.


#### simplified how stuff works (awesome site/book btw)

1. content script attaches to dragstart (or is it dragenter) event. test for if the event is a file drag based on properties of the types attribute on dataTransfer. when it's triggered, postMessage to window.top a message that says that dragging has begun.
2. on the window.top content script instance, once the drag begin message is recieved, begin a "trickle" message where you postMessage to all immediately accessible frames to recursively attempt to do the trickle. Each node that receives the message sets the isDragging variable to true and loops through all elements on the page detecting which ones are droppable. render the targets.
3. Rendered targets are divs with rounded corners and a translucent green background. On hover, it changes opacity. When it's dropped, the color becomes blue. A message is sent via postMessage to the page top first describing the file properties, name, size, type. Then the file is read and another message is sent including the base64-data url encoded file contents.
4. The page top uses chrome.extension.sendRequest to communicate with the background page
5. __(instant)__ The background page requests stuff with the drag2up.appspot.com api in order to create a new upload, stores the nuclear launch codes that are returned, and sends the callback.
__(slow)__ The background page waits for the file, picks the appropriate host based on localStorage data and filetype guessing using mimetypes and other magic. The file is then uploaded to the server, and the response link is sent to the callback.
6. the response is trickled down to all the frames where the appropriate listener is dispatched to add the url/link/image to an element. 

7. __(instant)__ The background page gets the second message with the file contents, picks a host based on the data, filetype, and settings, uploads to the host, and gets the url.
8. __(instant)__ The url from the file host is then sent through the drag2up.appspot.com api again to complete the upload where events on the channel api are dispatched to immediately notify listening downloaders that the file is available for download.


### old stuff


Okay, so now I'm going to write a semblance of a readme file. Hopefully, there's really not that much to read about, this project is the source code behind the infinitely awesome drag2up extension (for lack of a better name). It was at one point up2drag/updrag and now lift/airfoil sounds like a pretty decent although undescriptive name. Either way, blah blah blah, here's a readme.

### If you own a file host or know of one that will host small files (< 10MB) with an API and little user intrusion
please contact me at twitter.com/antimatter15 or antimatter15@gmail.com


## How it works:

1. Content script runs on every webpage

2. Attach a dragenter event listener to the document.documentElement

3. When it fires, loop all elements to find things that are input areas (eg. contentEditable, <input>, <textarea>)

4. Draw a shiny green bordered semitransparent box over it

5. Attach drop event handlers to that shiny box

6. Read file as base64, then use chrome's sendRequest to send to background page

7. Background page contacts upload server and uploads file, getting URL in the end

8. Send URL back to the content script and insert it onto the end of the element. Detect if [img][/img] is present anywhere on page and if so, assume it's bbcode-enabled and wrap url in [img] tags (if the filetype is also an image). Otherwise just insert link. If it's a contentEditable page, append a linkified <a> tag.


## Alternate:

1. Content script runs on every webpage

2. Periodically check for iframes of the same domain

3. Inject a script into the frame that attaches the event listener to the document element

4. Do the same as the primary stuff, except that the data gets first sent to the parent page with postMessage and back the same way.


## Ideas:

It could be possible to use this in conjunction with an image shortening service, so that the URL is added immediately while the upload happens in the background, however, this puts another potential space for error and requires me to implement some sort of upload progress, which many APIs simply don't have.

*Other file hosts*. Really. This is sort of obvious, but in my rather cursory searching, I haven't found anything suitable. I don't really like imgur either, ideally, i'd set up my own host, but then I would need to mess around with finding a source of revenue, it's easier to mooch off people who have big employers or something to back them up. I could go the direction that DropMocks took, with app engine, but then the free quota is only a gig, that's like a thousand one meg files, and with chrome saying there's like three thousand users, that's like half an image per user. Simply not practical.

Right now I gotta go sleep, but hopefully one day i'll put some more super insightful comments