Object.extend = function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }
  
var PBOAuth = function(){};
PBOauth.prototype = ({

 /*Copyright (c)  2010, Jonathan Foley & Electron Apps jonefoley@gmail.com
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the Electron Apps nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Jonathan Foley OR Electron Apps BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
 //initalized with service=ServiceName
 // oauth={secret: "OAuth Secret", key:"OAuth Key", callback: "callbackURL" }
 //args={} additional vendor specific request args
 //sceneController reference
 //callback method of calling scene
 
initialize: function(service,oauth,args,sceneAssistant,callback) {
    this.google={reqToken:'https://www.google.com/accounts/OAuthGetRequestToken',authToken: 'https://www.google.com/accounts/OAuthAuthorizeToken', accToken:'https://www.google.com/accounts/OAuthGetAccessToken' }
    this.photoBucket={reqToken:'http://api.photobucket.com/login/request',authToken:'http://photobucket.com/apilogin/login', accToken:'http://api.photobucket.com/login/access' };
    switch(service) {
        case 'google':
            this.urls=this.google;
            this.method='get'
            break;
        case 'photobucket':
            this.urls=this.photoBucket;
             this.method='post'
            break
    }
    this.service=service;
    this.tokenSecret="";
    this.callbackURL=oauth.callback;
    this.callback=callback||function(){};
    that=sceneAssistant;
    this.consumerSecret=oauth.secret||'anonymous';
    this.args=Object.extend({
        oauth_callback: oauth.callback||'oob',
        oauth_consumer_key:oauth.key||'anonymous',
        oauth_signature_method:"HMAC-SHA1",
        oauth_version:'1.0'
    },args||{})
    if (service=="photobucket") delete this.args.oauth_callback;
    this.getRequestToken()
    this._handleRedirect=this.handleRedirect.bindAsEventListener(this);

},



getRequestToken: function() {
    if (this.service=="photobucket")  this.key=this.consumerSecret+"&"+this.tokenSecret;
    else this.key=encodeURIComponent(this.consumerSecret)+"&"+encodeURIComponent(this.tokenSecret);
    this.args=Object.extend({oauth_nonce:MD5((new Date()).getTime().toString()+Math.random().toString()+"ABC1235bca5678"),oauth_timestamp:Math.floor((new Date()).getTime()/1000)},this.args)
    this.makeStrings(this.method.toUpperCase(),this.urls.reqToken);
    this.makeSignature();

    this.doRequest('reqToken',this.handleReqToken.bind(this,'request'),this.reqTokenFailure.bind(this,'request'));

    
},

handleReqToken: function(type,response) {
    if (response.status==200) {
    switch(type) {
        
        case 'request':
            
            var reqToken=response.responseText.match(/(oauth_token=)([^&]*)/)[0]
            this.tokenSecret=response.responseText.match(/(oauth_token_secret=)([^&]*)/)[2]
            console.info('Got request token!')
            that.authSpinner.mojo.stop();
            that.controller.get("AuthStatus").innerHTML=$L("Please Complete Authentication");
        switch (this.service) {
            case 'google':
                var login_url=this.urls['authToken']+'?'+reqToken+'&hd=default&btmpl=mobile';
                break
            case 'photobucket':
                var login_url=this.urls['authToken']+'?'+reqToken;
                break
        }
    
       that.controller.setupWidget("auth",
        this.attributes = {
            url:    login_url,
            minFontSize: 24,
            virtualPageWidth: 320,
        },
        this.model = {
        }
        
    );
        that.controller.get('authview').addClassName('flickrAuth');
        that.controller.update(that.controller.get("authview"),"<div x-mojo-element=\"WebView\" id=\"auth\"> </div>");
        that.controller.listen("auth",Mojo.Event.webViewTitleUrlChanged,this._handleRedirect)
        console.info('Webview created')
   /* that.controller.serviceRequest(
                        "palm://com.palm.applicationManager", 
                        {
                            method: "open",
                            parameters:  {
                                id: 'com.palm.app.browser',
                                params: { target: login_url }
                            }
                        }
                    );*/
   break
        case 'access':
            this.accessToken=response.responseText.match(/(oauth_token=)([^&]*)/)[2];
            this.tokenSecret=response.responseText.match(/(oauth_token_secret=)([^&]*)/)[2];
            this.callback({success: true,service: this.service,token:this.accessToken,secret:this.tokenSecret})
            break
    }
    }
    else this.reqTokenFailure(type,response);
},

reqTokenFailure: function(type,response) {
      console.error('Req Token Failure :(')
      this.callback({success: false, type:response: response})
},

handleRedirect: function(event) {
    
    if (event.url.match(this.callbackURL)) {
        //that.controller.document.getElementsByTagName('object')[0].addClassName('hiddenObject')
        that.controller.get("authview").removeClassName('flickrAuth');
         that.authSpinner.mojo.start();
            that.controller.get("AuthStatus").innerHTML=$L("Fetching Access Token...");
    
    
        if (event.url.match('oauth_token')) {
            var authToken=event.url.match(/(oauth_token=)([^&]*)/)[2]
            if (this.service=="google") {
                var verifier=event.url.match(/(oauth_verifier=)([^&]*)/)[2]
            }
            this.getAccessToken(authToken,verifier)
        }
    
        console.info("CALLBACK URL: "+event.url)
    }
    
},

getAccessToken: function(token,verifier) {
    this.key=this.percentEncode(this.consumerSecret)+"&"+this.tokenSecret;
    this.args.oauth_nonce=MD5((new Date()).getTime().toString()+Math.random().toString()+"ABC1235bca5678"),
    this.args.oauth_timestamp=Math.floor((new Date()).getTime()/1000);
    this.args.oauth_token=token;
    this.args.oauth_verifier=verifier;
    delete this.args.oauth_callback;
    delete this.args.xoauth_displayname;
    delete this.args.oauth_signature;
    delete this.args.scope;
    this.makeStrings(this.method.toUpperCase(),this.urls.accToken);
    this.makeSignature();

    this.doRequest('accToken',this.handleReqToken.bind(this,'access'),this.reqTokenFailure.bind(this,'access'));

    

},


doRequest: function(type,sCB,fCB) {
    var options={};
    options.method=this.method;
    if (this.service!="photobucket") options.requestHeaders={Authorization: this.headerstring};
    if (this.args.scope) options.parameters={scope: this.args.scope};
     if (this.service=="photobucket") options.postBody=this.paramstring;
    options.onSuccess=sCB;
    options.onFailure=fCB;
    var url=this.urls[type];
    //var url="http://www.electronapps.com/ljpro/oauth/test"
    console.info('<<<<<BaseString: '+this.baseString)
   // if (this.service=="photobucket") url=url+'?format=json'
    var req = new Ajax.Request(url,options);
     

    
},

makeStrings: function(method,baseuri) {
    var params=$H(this.args);
          var alphakeys=params.keys().sort();
          this.paramstring="";
          this.headerstring="OAuth ";
          for (var i=0;i<alphakeys.length;i++) {
            if (this.paramstring!="") {
                if (alphakeys[i]=='oauth_token'||alphakeys[i]=="oauth_verifier") {
                    this.paramstring+='&'+alphakeys[i]+"="+params.get(alphakeys[i]);
                }
                else {
                    this.paramstring+='&'+this.percentEncode(alphakeys[i])+"="+this.percentEncode(params.get(alphakeys[i]));
                }
                
                if (alphakeys[i]!='scope') this.headerstring+=', '+alphakeys[i]+"=\""+params.get(alphakeys[i])+"\"";
            }
            else {
                this.paramstring=this.percentEncode(alphakeys[i])+"="+this.percentEncode(params.get(alphakeys[i]));
                 if (alphakeys[i]!='scope') this.headerstring=this.headerstring+alphakeys[i]+"=\""+params.get(alphakeys[i])+"\"";
            
            }
          }
          var baseuri=method+"&"+encodeURIComponent(baseuri);
          this.baseString=baseuri+'&'+this.percentEncode(this.paramstring);
},

makeSignature: function() {
    b64pad = '=';
    if (this.method=="post") this.args=Object.extend({oauth_signature: b64_hmac_sha1(this.key, this.baseString)},this.args);
    this.args=Object.extend({oauth_signature: this.percentEncode(b64_hmac_sha1(this.key, this.baseString))},this.args);
    this.headerstring+=', '+'oauth_signature=\"'+this.args.oauth_signature+"\"";
    this.paramstring=this.paramstring+'&oauth_signature='+this.percentEncode(this.args.oauth_signature);
},

getAuthorization: function(args,sCB,fCB) {
    
},


percentEncode: function(s) {
     s = encodeURIComponent(s);
        // Now replace the values which encodeURIComponent doesn't do
        // encodeURIComponent ignores: - _ . ! ~ * ' ( )
        // OAuth dictates the only ones you can ignore are: - _ . ~
        // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
        s = s.replace(/\!/g, "%21");
        s = s.replace(/\*/g, "%2A");
        s = s.replace(/\'/g, "%27");
        s = s.replace(/\(/g, "%28");
        s = s.replace(/\)/g, "%29");
        return s;
},

})
