[INSTALL HERE](https://chrome.google.com/extensions/detail/bjgjolhpdlgebodaapdafhdnikagbfll) <== probably what you want to do


Okay, so now I'm going to write a semblance of a readme file. Hopefully, there's really not that much to read about, this project is the source code behind the infinitely awesome drag2up extension (for lack of a better name). It was at one point up2drag/updrag and now lift/airfoil sounds like a pretty decent although undescriptive name. Either way, blah blah blah, here's a readme.


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