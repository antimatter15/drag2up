var ModernDropbox = function(consumerKey, consumerSecret) {
	// Constructor / Private
	var _consumerKey = consumerKey;
	var _consumerSecret = consumerSecret;
	
	var _tokens = {};
	var _storagePrefix = "moderndropbox_";
	var _isSandbox = false;
	var _cache = true;
	var _authCallback = "data:text/html,done";
	var _fileListLimit = 10000;
	var _cookieTimeOut = 3650;
	var _dropboxApiVersion = 0;
	var _xhr = new XMLHttpRequest();
	
	var _ajaxSendFileContents = function(message, content) {
		_xhr.open("POST", message.action, true);
		
		var boundary = '---------------------------';
		boundary += Math.floor(Math.random() * 32768);
		boundary += Math.floor(Math.random() * 32768);
		boundary += Math.floor(Math.random() * 32768);
		_xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
	
		var body = '';

		for (i in message.parameters) {
		  if(message.parameters[i][0] == 'file') continue;
			body += '--' + boundary + '\r\n' + 'Content-Disposition: form-data; name="';
			body += message.parameters[i][0];
			body += '"\r\n\r\n';
			body += message.parameters[i][1];
			body += '\r\n';
		}

		body += '--' + boundary + "\r\n";
		body += "Content-Disposition: form-data; name=file; filename=" + message.filename + "\r\n";
		body += "Content-type: application/octet-stream\r\n\r\n";
		body += content;
		body += "\r\n";
		body += '--' + boundary + '--';
		
		_xhr.onreadystatechange = function() {
			console.log(this);
		}
		
		_xhr.send(body);
	};
	
	var _setAuthCallback = function(callback) {
		_authCallback = callback;
	};
	
	var _setupAuthStorage = function() {
		keys = ["requestToken", "requestTokenSecret", "accessToken", "accessTokenSecret"];
		
		for (i in keys) {
			var key = keys[i];
			value = localStorage.getItem(_storagePrefix + key);
			if (value) {
				_tokens[key] = value;
			}
		}
	};
	
	var _clearAuthStorage = function() {
		keys = ["requestToken", "requestTokenSecret", "accessToken", "accessTokenSecret"];
		
		for (i in keys) {
			var key = keys[i];
			localStorage.removeItem(_storagePrefix + key);
		}
	};
	
	var _storeAuth = function(valueMap) {
		keys = ["requestToken", "requestTokenSecret", "accessToken", "accessTokenSecret"];
		
		for (i in keys) {
			var key = keys[i];
			
			if (valueMap[key]) {
				localStorage.setItem(_storagePrefix + key, valueMap[key]);
				_tokens[key] = valueMap[key];
			}
		}	
	};
	
	var _isAccessGranted = function() {
		return (_tokens["accessToken"] != null) && (_tokens["accessTokenSecret"] != null);
	};
	
	var _isAuthorized = function() {
		return (_tokens["requestToken"] != null) && (_tokens["requestTokenSecret"] != null);
	};
	
	var _createOauthRequest = function(url, options) {
		if (!options) {
			options = [];
		}
		
		// Outline the message
		var message = {
			action: url,
			method: "GET",
		    parameters: [
		      	["oauth_consumer_key", _consumerKey],
		      	["oauth_signature_method", "HMAC-SHA1"]
		  	]
		};
		
		// Define the accessor
		var accessor = {
			consumerSecret: _consumerSecret,
		};
		console.log(options.token, _tokens.accessToken);
		if (!options.token) {
			message.parameters.push(["oauth_token", _tokens["accessToken"]]);
		} else {
			message.parameters.push(["oauth_token", options.token]);
			delete options.token;
		}
		
		
		
		if (!options.tokenSecret) {
			accessor.tokenSecret = _tokens["accessTokenSecret"];
		} else {
			accessor.tokenSecret = options.tokenSecret;
			delete options.tokenSecret;
		}
		
		if (options.method) {
			message.method = options.method;
			delete options.method;
		}
	
		for (key in options) {
			message.parameters.push([key, options[key]]);
		}

		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);

		return message;
	};
	
	var _sendOauthRequest = function(message, options) {
		if (!options) {
			options = [];
		}
		
		if (!options.success) {
			options.success = function() {};
		}

		if (!options.error) {
			options.error = function() {};
		}
		
		if (!options.type) {
			options.type = "json";
		}
		
		if (options.multipart) {
			_ajaxSendFileContents(
				message,
				options.content
			);
		} else {
			$.ajax({
				url: message.action,
				type: message.method,
				data: OAuth.getParameterMap(message.parameters),
				dataType: options.type,
				success: options.success,
				error: options.error
			});
		}
	};
	
	var init = function() {
			_setupAuthStorage();

			if (!_isAccessGranted()) {
				if (!_isAuthorized()) {
					var message = _createOauthRequest("http://api.getdropbox.com/" + _dropboxApiVersion + "/oauth/request_token");
					
					_sendOauthRequest(message, {
						type: "text",
						success: (function(data) {
							if (!data) {
								data = "";
							}
						
							var tokenPairStrings = data.split("&");
							var parsedTokenPairs = [];
					
							for (i in tokenPairStrings) {
								var tokenPairs = tokenPairStrings[i].split("=");
								parsedTokenPairs[tokenPairs[0]] = tokenPairs[1];
							}
					
							var authTokens = {};
							authTokens["requestToken"] = parsedTokenPairs["oauth_token"];
							authTokens["requestTokenSecret"] = parsedTokenPairs["oauth_token_secret"];
					
							_storeAuth(authTokens);
		
							chrome.tabs.create({
				        url: "http://api.getdropbox.com/" + _dropboxApiVersion + "/oauth/authorize?oauth_token=" 
								+ authTokens["requestToken"] 
								+ "&oauth_callback=" 
								+ _authCallback
				      }, function(tab){
				        var poll = function(){
			            chrome.tabs.get(tab.id, function(info){
				            if(info.url.indexOf('uid=') != -1){
					            chrome.tabs.remove(tab.id);
					            //dropbox.setup();
					            init();
					            
				            }else{
					            setTimeout(poll, 100)
				            }
			            })
		            };
		            poll();
				      })	
								
						}).bind(this)
					});
				} else {
					var message = _createOauthRequest("https://api.getdropbox.com/" + _dropboxApiVersion + "/oauth/access_token", {
						token: _tokens["requestToken"],
						tokenSecret: _tokens["requestTokenSecret"]
					});
					
					_sendOauthRequest(message, {
						type: "text",
						success: (function(data) {
							if (!data) {
								data = "";
							}
						
							var tokenPairStrings = data.split("&");
							var parsedTokenPairs = [];
					
							for (i in tokenPairStrings) {
								var tokenPairs = tokenPairStrings[i].split("=");
								parsedTokenPairs[tokenPairs[0]] = tokenPairs[1];
							}
					
							var authTokens = {};
							authTokens["accessToken"] = parsedTokenPairs["oauth_token"];
							authTokens["accessTokenSecret"] = parsedTokenPairs["oauth_token_secret"];
							
							_storeAuth(authTokens);
						}).bind(this)
					});
				}
			}
			
			return this;
		}
	// Public
	return ({
		initialize: init,
		
		getAccountInfo: function(callback) {
			var url = "https://api.dropbox.com/" + _dropboxApiVersion + "/account/info";
			var message = _createOauthRequest(url);
			_sendOauthRequest(message, {
				type: "json",
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		getDirectoryContents: function(path, callback) {
			var url = "https://api.dropbox.com/" + _dropboxApiVersion + "/metadata/dropbox/" + path;
			var message = _createOauthRequest(url, {
				file_limit: _fileListLimit,
				list: "true"
			});
			
			_sendOauthRequest(message, {
				type: "json",
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		getDirectoryMetadata: function(path, callback) {
			var url = "https://api.dropbox.com/" + _dropboxApiVersion + "/metadata/dropbox/" + path;
			var message = _createOauthRequest(url, {
				list: "false"
			});
			
			_sendOauthRequest(message, {
				type: "json",
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		getFileContents: function(path, callback) {
			var url = "https://api-content.dropbox.com/" + _dropboxApiVersion + "/files/dropbox/" + path;
			var message = _createOauthRequest(url);
			
			_sendOauthRequest(message, {
				type: "text",
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		putFileContents: function(path, filename, content, callback) {
			var url = "https://api-content.dropbox.com/" + _dropboxApiVersion + "/files/dropbox/" + path;
			var message = _createOauthRequest(url, {
			  method: 'POST',
			  file: filename
			});
			message.filename = filename;
			
			_sendOauthRequest(message, {
				multipart: true,
				content: content,
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		logOutDropbox: function() {
			_clearAuthStorage();
		}
	}).initialize();
};
