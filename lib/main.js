const data = require("self").data;
var pageWorkers = require("page-worker");
var pageMod = require("page-mod");
var XMLHttpRequest = require("xhr").XMLHttpRequest;
XMLHttpRequest.prototype.__defineSetter__('onload', function(cb){
  console.log('set onload');
  this.onreadystatechange = function(){
    if(this.readyState == 4){
      console.log('firing clalack');
      cb();
    }
  }
})

function btoa(input) {
	var output = "", i = 0, l = input.length,
	key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	while (i < l) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) enc3 = enc4 = 64;
		else if (isNaN(chr3)) enc4 = 64;
		output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
	}
	return output;
}

function atob(input){
  var output = "", i = 0, l = input.length,
	key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	while (i < l) {
		enc1 = key.indexOf(input.charAt(i++));
		enc2 = key.indexOf(input.charAt(i++));
		enc3 = key.indexOf(input.charAt(i++));
		enc4 = key.indexOf(input.charAt(i++));
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
		output = output + String.fromCharCode(chr1);
		if (enc3 != 64) output = output + String.fromCharCode(chr2);
		if (enc4 != 64) output = output + String.fromCharCode(chr3);
	}
	return output;
}


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
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}



;


/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
function hex_hmac_md5(k, d)
  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_md5(k, d)
  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_md5(k, d, e)
  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data)
{
  var bkey = rstr2binl(key);
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input)
{
  try { hexcase } catch(e) { hexcase=0; }
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var output = "";
  var x;
  for(var i = 0; i < input.length; i++)
  {
    x = input.charCodeAt(i);
    output += hex_tab.charAt((x >>> 4) & 0x0F)
           +  hex_tab.charAt( x        & 0x0F);
  }
  return output;
}

/*
 * Convert a raw string to a base-64 string
 */
function rstr2b64(input)
{
  try { b64pad } catch(e) { b64pad=''; }
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var output = "";
  var len = input.length;
  for(var i = 0; i < len; i += 3)
  {
    var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
    }
  }
  return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding)
{
  var divisor = encoding.length;
  var i, j, q, x, quotient;

  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  var dividend = Array(Math.ceil(input.length / 2));
  for(i = 0; i < dividend.length; i++)
  {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }

  /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. All remainders are stored for later
   * use.
   */
  var full_length = Math.ceil(input.length * 8 /
                                    (Math.log(encoding.length) / Math.log(2)));
  var remainders = Array(full_length);
  for(j = 0; j < full_length; j++)
  {
    quotient = Array();
    x = 0;
    for(i = 0; i < dividend.length; i++)
    {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if(quotient.length > 0 || q > 0)
        quotient[quotient.length] = q;
    }
    remainders[j] = x;
    dividend = quotient;
  }

  /* Convert the remainders to the output string */
  var output = "";
  for(i = remainders.length - 1; i >= 0; i--)
    output += encoding.charAt(remainders[i]);

  return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
  var output = "";
  var i = -1;
  var x, y;

  while(++i < input.length)
  {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }

    /* Encode output as utf-8 */
    if(x <= 0x7F)
      output += String.fromCharCode(x);
    else if(x <= 0x7FF)
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0xFFFF)
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0x1FFFFF)
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    0x80 | ((x >>> 12) & 0x3F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
  }
  return output;
}

/*
 * Encode a string as utf-16
 */
function str2rstr_utf16le(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  (input.charCodeAt(i) >>> 8) & 0xFF);
  return output;
}

function str2rstr_utf16be(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   input.charCodeAt(i)        & 0xFF);
  return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}



;


//stolen from mozilla http://demos.hacks.mozilla.org/openweb/imageUploader/js/extends/xhr.js
//http://code.google.com/p/chromium/issues/detail?id=35705#c6
//http://efreedom.com/Question/1-3743047/Uploading-Binary-String-WebKit-Chrome-Using-XHR-Equivalent-Firefoxs-SendAsBinary
XMLHttpRequest.prototype.sendMultipart = function(params) {
  var BOUNDARY = "---------------------------1966284435497298061834782736";
  var rn = "\r\n";
  console.log(params)
  
  var binxhr = !!this.sendAsBinary;
  if(binxhr){
    var req = '', append = function(data){req += data}
  }else{
    var req = new BlobBuilder(), append = function(data){req.append(data)}
  }
  
  append("--" + BOUNDARY);
  
  var file_param = -1;
  var xhr = this;
  
  for (var i in params) {
    if (typeof params[i] == "object") {
      file_param = i;
    } else {
      append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
      append(rn + rn + params[i] + rn + "--" + BOUNDARY);
    }
  }
  
  var i = file_param;
  
  append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
  
  getRaw(params[i], function(file){
    console.log('actual data entity', file);
    

    append("; filename=\""+file.name+"\"" + rn + "Content-type: "+file.type);

    append(rn + rn);

    if(binxhr){
      append(file.data);
    }else{
      var bin = file.data
      var arr = new Uint8Array(bin.length);
      for(var i = 0, l = bin.length; i < l; i++)
        arr[i] = bin.charCodeAt(i);
      
      append(arr.buffer)
    }
    append(rn + "--" + BOUNDARY);
  
    append("--");


    xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + BOUNDARY);
    
    if(binxhr){
      xhr.sendAsBinary(req);
    }else{
      superblob = req.getBlob();
      xhr.send(req.getBlob());
    }
  });
};



;


//based on ChromeMuse GPLv3


function shorten(svc, url, func){
  var shortSvc = shortSvcList[svc];
  var param = (typeof(shortSvc.param) == "string" ? shortSvc.param : shortSvc.param(url))+encodeURIComponent(url);

  // load credentials into param string
  if (shortSvc.cred) {
          for (var i in shortSvc.cred) {
                  var c = shortSvc.defcred[i];
                  param = param.replace("%"+shortSvc.cred[i]+"%", c);
          }
  }

  var xhr = new XMLHttpRequest();
  xhr.open(shortSvc.method, shortSvc.s_url, true);
  
  if(shortSvc.method.toLowerCase() == 'post'){
  	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  }

  xhr.onerror = function(){
   func({status: "error", error: "HTTP Status Code: "+xhr.status})
  }
  
  xhr.onload = function(){
      var r = xhr.responseText;
      if(shortSvc.dataType == 'json'){
        r = JSON.parse(r);
      }
     shortSvc.s_proc(r, func);
  }
  xhr.send(param);
  /*
  $.ajax({
          type: shortSvc.method,
          url: shortSvc.s_url,
          data: param,
          dataType: shortSvc.dataType,
          timeout: 10000,
          error: function(xhr, errmsg) {
                  switch (errmsg) {
                          case "timeout": func({status: "error", error: "Timeout connecting to "+svc}); break;
                          case "error": func({status: "error", error: "HTTP Status Code: "+xhr.status}); break;
                          default: func({status: "error", error: errmsg}); break;
                  }
          },
          success: function(r) {
                  shortSvc.s_proc(r, func);
          }
  });
  */
}


/// URL Shortening Services


var shortSvcList = {
        "goo.gl": {
                method: "POST",
                s_url: "http://goo.gl/api/url",
                param: function(b) {

                        // generate auth_token

                        function c() {
                                for (var l = 0, m = 0; m < arguments.length; m++)
                                        l = l + arguments[m] & 4294967295;
                                return l
                        }

                        function d(l) {
                                l = l = String(l > 0 ? l : l + 4294967296);
                                var m;
                                m = l;
                                for (var o = 0, n = false, p = m.length - 1; p >= 0; --p)       {
                                        var q = Number(m.charAt(p));
                                        if (n) {
                                                q *= 2;
                                                o += Math.floor(q / 10) + q % 10
                                        }
                                        else    {
                                                o += q;
                                        }
                                        n = !n
                                }
                                m = m = o % 10;
                                o = 0;
                                if (m != 0) {
                                        o = 10 - m;
                                        if (l.length % 2 == 1) {
                                                if (o % 2 == 1) o += 9;
                                                o /= 2
                                        }
                                }
                                m = String(o);
                                m += l;
                                return l = m
                        }

                        function e(l) {
                                for (var m = 5381, o = 0; o < l.length; o++)
                                        m = c(m << 5, m, l.charCodeAt(o));
                                return m
                        }

                        function f(l) {
                                for (var m = 0, o = 0; o < l.length; o++)
                                        m = c(l.charCodeAt(o), m << 6, m << 16, -m);
                                return m
                        }

                        var h = {
                                byteArray_: b,
                                charCodeAt: function (l) {
                                        return this.byteArray_[l]
                                }
                        };

                        h.length = h.byteArray_.length;
                        var i = e(h.byteArray_);
                        i = i >> 2 & 1073741823;
                        i = i >> 4 & 67108800 | i & 63;
                        i = i >> 4 & 4193280 | i & 1023;
                        i = i >> 4 & 245760 | i & 16383;
                        var j = "7";
                        h = f(h.byteArray_);
                        var k = (i >> 2 & 15) << 4 | h & 15;
                        k |= (i >> 6 & 15) << 12 | (h >> 8 & 15) << 8;
                        k |= (i >> 10 & 15) << 20 | (h >> 16 & 15) << 16;
                        k |= (i >> 14 & 15) << 28 | (h >> 24 & 15) << 24;
                        j += d(k);

                        return "user=toolbar@google.com&auth_token="+j+"&url="
                },
                dataType: "json",
                s_proc: function(r,f) {
                        f((r.short_url !== undefined) ? {status: "ok", url: r.short_url} : {status: "error", error: r.error_message});
        }},
        "bit.ly": {
                method: "GET",
                s_url: "http://api.bit.ly/shorten",
                param: "version=2.0.1&history=1&login=%API Login%&apiKey=%API Key%&longUrl=",
                cred: ["API Login", "API Key"],
                defcred: ["drag2up", "R_4eabbd16b41219259f86122d74d1c5e0"],
                reg_url: "http://bit.ly/account/register",
                dataType: "json",
                s_proc: function(r,f) {
                        for (var r1 in r.results) {
                                var r2 = r.results[r1];
                                break;
                        }
                        f(r2 ? {status: "ok", url: r2.shortUrl}: {status: "error", error: r.errorMessage});
        }},
"is.gd": {
                method: "GET",
                s_url: "http://is.gd/api.php",
                param: "longurl=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        "j.mp": {
                method: "GET",
                s_url: "http://api.j.mp/shorten",
                param: "version=2.0.1&history=1&login=%API Login%&apiKey=%API Key%&longUrl=",
                cred: ["API Login", "API Key"],
                defcred: ["drag2up", "R_4eabbd16b41219259f86122d74d1c5e0"],
                reg_url: "http://j.mp/account/register",
                dataType: "json",
                s_proc: function(r,f) {
                        for (var r1 in r.results) {
                                var r2 = r.results[r1];
                                break;
                        }
                        f(r2 ? {status: "ok", url: r2.shortUrl}: {status: "error", error: r.errorMessage});
        }},/*
        "ow.ly": {
                method: "GET",
                s_url: "http://slki.ru/api/add/",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},*/
        "tinyurl": {
                method: "GET",
                s_url: "http://tinyurl.com/api-create.php",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        "0rz.tw": {
                method: "GET",
                s_url: "http://0rz.tw/createget",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
		/*
        "3.ly": {
                method: "GET",
                s_url: "http://3.ly/",
                param: "api=em5893833&u=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        */
        "chilp.it": {
                method: "GET",
                s_url: "http://chilp.it/api.php",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        
        "iKr.me": {
                method: "GET",
                s_url: "http://ikr.me/api/",
                param: "url=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        
        "tllg.net": {
                method: "GET",
                s_url: "http://tllg.net/",
                param: "api=tllgapi&u=",
                dataType: "text",
                s_proc: function(r,f) {
                        // need to check for error code?
                        f({status: "ok", url: r});
        }},
        "ur1.ca": {
                method: "POST",
                s_url: "http://ur1.ca/",
                param: "longurl=",
                dataType: "html",
                s_proc: function(r,f) {
                        r1 = r.match(/Your ur1 is: <a href="(http:\/\/ur1\.ca\/.+)">/i);
                        f(r1 ? {status: "ok", url: r1[1]} : {status: "error", error: r.match(/<p .lass="error">([^<]+)<\/p>/i)});
        }},
        "Voizle": {
                method: "GET",
                s_url: "http://api.voizle.com",
                param: "format=json&crawl=no&type=short&u=",
                dataType: "json",
                s_proc: function(r,f) {
                        f((r.voizle !== undefined && r.voizle.success) ? {status: "ok", url: r.voizle.voizleurl} : {status: "error", error: "Error shortening URL."});
        }}
};



;


//uses multipart helper function.
//magic totally obfuscated key that you shall never see
//39ACEJNQa5b92fbce7fd90b1cb6f1104d728eccb
//does not support https


function uploadImageshack(file, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://www.imageshack.us/upload_api.php");  
  xhr.onload = function(){
    try{
      var link = xhr.responseXML.getElementsByTagName('image_link');
	    callback(link[0].childNodes[0].nodeValue);
	  }catch(err){
	    callback('error: imageshack uploading failed')
	  }
  }
  xhr.onerror = function(){
    callback('error: imageshack uploading failed')
  }
  xhr.sendMultipart({
    key: "39ACEJNQa5b92fbce7fd90b1cb6f1104d728eccb",
    fileupload: file
  })
}





;


//based on description from http://gist.github.com/4277
  
function uploadGist(req, callback){
  function postJSON(url, data, callback){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);  
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send(Object.keys(data).map(function(i){
      return i+'='+encodeURIComponent(data[i]);
    }).join('&'));
    xhr.onreadystatechange = function () {
      if(this.readyState == 4) {
        if(this.status == 200) {
          var stuff = JSON.parse(xhr.responseText);
          callback(stuff)
        } else {
          callback(null);
        }
      }
    };
  }

  getText(req, function(file){
    var data = {};
    data['files['+encodeURIComponent(file.name||'untitled')+']'] = file.data;
    postJSON(https()+"gist.github.com/api/v1/json/new", data, function(data){
      if(data){
        callback(https()+'gist.github.com/'+data.gists[0].repo)
      }else{
        callback('error: could not upload github gist');
      }
    })
  })

}



;


/*
 * uploadPastebin({data:btoa('hello world')},function(url){console.log(url)})
 * http://pastebin.com/x43mgnhf
 * */
 //no https
function uploadPastebin(req, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://pastebin.com/api_public.php");  
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	getText(req, function(file){
  	xhr.send("paste_code="+encodeURIComponent( file.data  ));
	})
	xhr.onload = function(){
		callback(xhr.responseText.replace(/^error:/ig,'error:'))
	}
	
}



;


//https://github.com/kinabalu/mysticpaste/blob/master/idea-plugin/src/com/mysticcoders/mysticpaste/plugin/PastebinAction.java
//no https
function uploadMysticpaste(req, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://www.mysticpaste.com/servlet/plugin");  
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.onload = function(){
	  callback("http://www.mysticpaste.com/view/"+xhr.responseText);
	}
	getText(req, function(file){
  	xhr.send("type="+file.type+"&content="+encodeURIComponent( file.data  ));
	})
}



;


function uploadImgur(req, callback){
	function postJSON(url, data, callback){
	  var xhr = new XMLHttpRequest();
	  xhr.open("POST", url);  
	  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	  xhr.send(Object.keys(data).map(function(i){
  		return i+'='+encodeURIComponent(data[i]);
	  }).join('&'));
	  xhr.onreadystatechange = function () {
		  if(this.readyState == 4) {
		    if(this.status == 200) {
			    var stuff = JSON.parse(xhr.responseText);
			    callback(stuff)
		    } else {
			    callback(null);
		    }
		  }
	  };
	}
	getBinary(req, function(file){
	  postJSON(https()+"api.imgur.com/2/upload.json", {
      key: '390230bc94c4cc1354bcdb2dae0b9afd', /*should i invent a meaningless means of obfuscating this? no.*/
      type: 'base64',
      name: file.name,
      image: btoa(file.data)
    }, function(data){
      if(data){
        callback(data.upload.links.original)
      }else{
        callback('error: could not upload to imgur')
      }
    })
  })
}



;


//uses multipart helper function.
function uploadHotfile(file, callback){
  //http://api.hotfile.com/?action=getuploadserver

	var xhr = new XMLHttpRequest();
	xhr.open("GET", https()+"api.hotfile.com/?action=getuploadserver");  
	xhr.send();
	xhr.onload = function(){
		var post_url = https()+xhr.responseText.trim()+'/upload.cgi?'+(+new Date);
		
	  var xhr2 = new XMLHttpRequest();
	  xhr2.open("POST", post_url);  

	  xhr2.onerror = function(){
	    callback('error: hotfile hosting error')
	  }
		xhr2.onload = function(){
		  var url = xhr2.responseText.match(/value="(http.*?)"/);
		  if(url) callback(url[1]);
		  console.log(xhr2, url)
	  }
		xhr2.sendMultipart({
		  iagree: 'on',
		  'uploads[]': file
		})
		
	}
	xhr.onerror = function(){
	  callback('error: hotfile could not get upload server');
	}
	
}



;


//uses multipart helper function.
//does not support https
function uploadCloudApp(file, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://my.cl.ly/items/new');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function(){
    if(xhr.status == 401){
      //i can haz login
      chrome.tabs.create({url: "http://my.cl.ly/login"}, function(tab){
        var poll = function(){
          chrome.tabs.get(tab.id, function(info){
            if(info.url == 'http://my.cl.ly/'){
              chrome.tabs.remove(tab.id);
              uploadCloudApp(file, callback);
            }else{
              setTimeout(poll, 300)
            }
          })
        };
        poll();
      })
    }else{
      var json = JSON.parse(xhr.responseText);
      var xhr2 = new XMLHttpRequest();
      xhr2.open('POST', json.url);
      json.params.key = json.params.key.replace('${filename}', file.name);
      json.params.file = file;
      xhr2.sendMultipart(json.params);
      xhr2.onload = function(){
        //since ajax cant add the Accept: header to the redirects, heres a hack
        var xhr3 = new XMLHttpRequest();
        xhr3.open('GET', 'http://my.cl.ly/items');
        xhr3.setRequestHeader('Accept', 'application/json');
        xhr3.onload = function(){
          callback(JSON.parse(xhr3.responseText)[0].content_url)
        }
        xhr3.send()
      }
    }
  }
  xhr.send()
}



;


//https://chrome.google.com/extensions/detail/mdddabjhelpilpnpgondfmehhcplpiin (A stretch, but it introduced me to the imm.io hosting service and I made my implementation by sniffing traffic data)


function uploadImmio(req, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://imm.io/?callback=true&name=drag2up');
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  getBinary(req, function(file){
    xhr.send('image='+encodeURIComponent('data:'+file.type+';base64,'+btoa(file.data)))
  });
  xhr.onload = function(){
    callback(xhr.responseText.replace(/^ERR:/,'error: '));
  }
}




;


//19d4df95a040e50112bd8e49a6096b59
//edc13066151f70ed (super secret secret)
//http://flickr.com/services/auth/?api_key=19d4df95a040e50112bd8e49a6096b59&perms=write&api_sig=[api_sig]
//https://secure.flickr.com/services
//http://api.flickr.com/services
function uploadFlickr(req, uploaded_fn){
  var base = "http://flickr.com/services" //https://secure.flickr.com/services
  //wooot security!
  if(https() == "https://"){
    base = "https://secure.flickr.com/services";
  }
  
  function auth(params){
    params.api_key = "19d4df95a040e50112bd8e49a6096b59";
    var secret = 'edc13066151f70ed';
    params.api_sig = hex_md5(secret+Object.keys(params).sort().map(function(x){return x+params[x]}).join(''))
    return params;
  }

  function params(obj){
    var str = [];
    for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
    return str.join('&');
  }
  function getAuthToken(callback){
    var authurl = base+"/auth/?"+params(auth({perms: "write"}));
    
    chrome.tabs.create({url: authurl}, function(tab){
      var poll = function(){
        chrome.tabs.get(tab.id, function(info){
          if(/frob=(.+)/.test(info.url)){
            var frob = info.url.match(/frob=(.+)/)[1]
            chrome.tabs.remove(tab.id);
            
            var xt = new XMLHttpRequest();
            xt.open("get", base+'/rest?'+params(auth({
              method: 'flickr.auth.getToken',
              frob: frob,
              nojsoncallback: 1,
              format: 'json'
            })))
            xt.onload = function(){
              var json = JSON.parse(xt.responseText);
              var token = json.auth.token._content;
              localStorage.flickr_token = token;
              console.log('magic token', token);
              callback();
            }
            xt.send()
            //localStorage.flickr_frob = frob;
            console.log('magic frob', frob);
          }else{
            setTimeout(poll, 300)
          }
        })
      };
      poll();
    })
  
  }

  
  function uploadPhoto(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST',base+"/upload/");
    var p = auth({
      auth_token: localStorage.flickr_token, 
      tags: "drag2up",
      is_public: 1
    });
    p.photo = req;
    xhr.onload = function(){
      console.log(xhr.responseXML)
      var resX = xhr.responseXML
      if(resX.firstChild.getAttribute('stat') == 'fail'){
        var err = resX.getElementsByTagName('err')[0];
        if(err.getAttribute('code') == 98){
          //invalid auth token: login now.
          getAuthToken(uploadPhoto)
        }else{  
          callback("error: could not upload to flickr in uploadPhoto "+err.getAttribute(msg))
        }
      }else{
        var photoid = resX.getElementsByTagName('photoid')[0];
        console.log(photoid)
        var pid = photoid.firstChild.nodeValue;
        //window.PID = photoid;
        console.log('flickr photo id', photoid);
        
        var xt = new XMLHttpRequest();
            xt.open("get", base+'/rest?'+params(auth({
              method: 'flickr.photos.getSizes',
              photo_id: pid,
              nojsoncallback: 1,
              format: 'json'
            })))
            xt.onload = function(){
              var json = JSON.parse(xt.responseText);
              var url = json.sizes.size.slice(-1)[0].source;
              console.log(json);
              uploaded_fn(url);
            }
            xt.send()
        
        
      }
    }
    xhr.sendMultipart(p)
  }
  
  uploadPhoto();
}



;


/*
  Thanks so much to the chemical servers hosting for this!
  Designed the API myself, wrote the hosting code too.
*/
//no https
function uploadChemical(req, callback){
  //http://files.chemicalservers.com/api.php
  var api_url = "http://files.chemicalservers.com/api.php";
  var download_url = "http://files.chemicalservers.com/download.php";
  
  function params(obj){
    var str = [];
    for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
    return str.join('&');
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', api_url);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  
  xhr.oneror = function(){
    callback('error: some error happened when uploading to chemical servers')
  }
  
  getBinary(req, function(file){
    if(file.size > 10 * 1000 * 1000){ //this is actually less than the limit of 15, but lets be nice to the server.
      return callback("error: file exceeds maximum size for host. Files must be less than 10MB.");
    }
  
    xhr.onload = function(){
      var code = xhr.responseText;
      if(/error:/.test(code)) return callback(code);
      callback(download_url + '?' + params({
        code: code,
        fn: file.name
      }))
    }
    
    
    xhr.send('file='+encodeURIComponent(btoa(file.data)))
  });
}



;


//no https
//it looks like a small host, but it's got a good ux

function uploadDAFK(file, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://up.dafk.net/up.php");  
  xhr.onload = function(){
    var json = JSON.parse(xhr.responseText);
    callback((json.error?'error:':'')+json.msg);
  }
  xhr.onerror = function(){
    callback('error: dafk uploading failed')
  }
  xhr.sendMultipart({
    "uploaded-file": file
  })
}





;


/* OAuthSimple
  * A simpler version of OAuth
  *
  * author:     jr conlin
  * mail:       src@anticipatr.com
  * copyright:  unitedHeroes.net
  * version:    1.0
  * url:        http://unitedHeroes.net/OAuthSimple
  *
  * Copyright (c) 2009, unitedHeroes.net
  * All rights reserved.
  *
  * Redistribution and use in source and binary forms, with or without
  * modification, are permitted provided that the following conditions are met:
  *     * Redistributions of source code must retain the above copyright
  *       notice, this list of conditions and the following disclaimer.
  *     * Redistributions in binary form must reproduce the above copyright
  *       notice, this list of conditions and the following disclaimer in the
  *       documentation and/or other materials provided with the distribution.
  *     * Neither the name of the unitedHeroes.net nor the
  *       names of its contributors may be used to endorse or promote products
  *       derived from this software without specific prior written permission.
  *
  * THIS SOFTWARE IS PROVIDED BY UNITEDHEROES.NET ''AS IS'' AND ANY
  * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  * DISCLAIMED. IN NO EVENT SHALL UNITEDHEROES.NET BE LIABLE FOR ANY
  * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var OAuthSimple;

if (OAuthSimple === undefined)
{
    /* Simple OAuth
     *
     * This class only builds the OAuth elements, it does not do the actual
     * transmission or reception of the tokens. It does not validate elements
     * of the token. It is for client use only.
     *
     * api_key is the API key, also known as the OAuth consumer key
     * shared_secret is the shared secret (duh).
     *
     * Both the api_key and shared_secret are generally provided by the site
     * offering OAuth services. You need to specify them at object creation
     * because nobody <explative>ing uses OAuth without that minimal set of
     * signatures.
     *
     * If you want to use the higher order security that comes from the
     * OAuth token (sorry, I don't provide the functions to fetch that because
     * sites aren't horribly consistent about how they offer that), you need to
     * pass those in either with .setTokensAndSecrets() or as an argument to the
     * .sign() or .getHeaderString() functions.
     *
     * Example:
       <code>
        var oauthObject = OAuthSimple().sign({path:'http://example.com/rest/',
                                              parameters: 'foo=bar&gorp=banana',
                                              signatures:{
                                                api_key:'12345abcd',
                                                shared_secret:'xyz-5309'
                                             }});
        document.getElementById('someLink').href=oauthObject.signed_url;
       </code>
     *
     * that will sign as a "GET" using "SHA1-MAC" the url. If you need more than
     * that, read on, McDuff.
     */

    /** OAuthSimple creator
     *
     * Create an instance of OAuthSimple
     *
     * @param api_key {string}       The API Key (sometimes referred to as the consumer key) This value is usually supplied by the site you wish to use.
     * @param shared_secret (string) The shared secret. This value is also usually provided by the site you wish to use.
     */
    OAuthSimple = function (consumer_key,shared_secret)
    {
/*        if (api_key == undefined)
            throw("Missing argument: api_key (oauth_consumer_key) for OAuthSimple. This is usually provided by the hosting site.");
        if (shared_secret == undefined)
            throw("Missing argument: shared_secret (shared secret) for OAuthSimple. This is usually provided by the hosting site.");
*/      this._secrets={};
        this._parameters={};

        // General configuration options.
        if (consumer_key !== undefined) {
            this._secrets['consumer_key'] = consumer_key;
            }
        if (shared_secret !== undefined) {
            this._secrets['shared_secret'] = shared_secret;
            }
        this._default_signature_method= "HMAC-SHA1";
        this._action = "GET";
        this._nonce_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";


        this.reset = function() {
            this._parameters={};
            this._path=undefined;
            return this;
        };

        /** set the parameters either from a hash or a string
         *
         * @param {string,object} List of parameters for the call, this can either be a URI string (e.g. "foo=bar&gorp=banana" or an object/hash)
         */
        this.setParameters = function (parameters) {
            if (parameters === undefined) {
                parameters = {};
                }
            if (typeof(parameters) == 'string') {
                parameters=this._parseParameterString(parameters);
                }
            this._parameters = parameters;
            if (this._parameters['oauth_nonce'] === undefined) {
                this._getNonce();
                }
            if (this._parameters['oauth_timestamp'] === undefined) {
                this._getTimestamp();
                }
            if (this._parameters['oauth_method'] === undefined) {
                this.setSignatureMethod();
                }
            if (this._parameters['oauth_consumer_key'] === undefined) {
                this._getApiKey();
                }
            if(this._parameters['oauth_token'] === undefined) {
                this._getAccessToken();
                }

            return this;
        };

        /** convienence method for setParameters
         *
         * @param parameters {string,object} See .setParameters
         */
        this.setQueryString = function (parameters) {
            return this.setParameters(parameters);
        };

        /** Set the target URL (does not include the parameters)
         *
         * @param path {string} the fully qualified URI (excluding query arguments) (e.g "http://example.org/foo")
         */
        this.setURL = function (path) {
            if (path == '') {
                throw ('No path specified for OAuthSimple.setURL');
                }
            this._path = path;
            return this;
        };

        /** convienence method for setURL
         *
         * @param path {string} see .setURL
         */
        this.setPath = function(path){
            return this.setURL(path);
        };

        /** set the "action" for the url, (e.g. GET,POST, DELETE, etc.)
         *
         * @param action {string} HTTP Action word.
         */
        this.setAction = function(action) {
            if (action === undefined) {
                action="GET";
                }
            action = action.toUpperCase();
            if (action.match('[^A-Z]')) {
                throw ('Invalid action specified for OAuthSimple.setAction');
                }
            this._action = action;
            return this;
        };

        /** set the signatures (as well as validate the ones you have)
         *
         * @param signatures {object} object/hash of the token/signature pairs {api_key:, shared_secret:, oauth_token: oauth_secret:}
         */
        this.setTokensAndSecrets = function(signatures) {
            if (signatures)
            {
                for (var i in signatures) {
                    this._secrets[i] = signatures[i];
                    }
            }
            // Aliases
            if (this._secrets['api_key']) {
                this._secrets.consumer_key = this._secrets.api_key;
                }
            if (this._secrets['access_token']) {
                this._secrets.oauth_token = this._secrets.access_token;
                }
            if (this._secrets['access_secret']) {
                this._secrets.oauth_secret = this._secrets.access_secret;
                }
            // Gauntlet
            if (this._secrets.consumer_key === undefined) {
                throw('Missing required consumer_key in OAuthSimple.setTokensAndSecrets');
                }
            if (this._secrets.shared_secret === undefined) {
                throw('Missing required shared_secret in OAuthSimple.setTokensAndSecrets');
                }
            if ((this._secrets.oauth_token !== undefined) && (this._secrets.oauth_secret === undefined)) {
                throw('Missing oauth_secret for supplied oauth_token in OAuthSimple.setTokensAndSecrets');
                }
            return this;
        };

        /** set the signature method (currently only Plaintext or SHA-MAC1)
         *
         * @param method {string} Method of signing the transaction (only PLAINTEXT and SHA-MAC1 allowed for now)
         */
        this.setSignatureMethod = function(method) {
            if (method === undefined) {
                method = this._default_signature_method;
                }
            //TODO: accept things other than PlainText or SHA-MAC1
            if (method.toUpperCase().match(/(PLAINTEXT|HMAC-SHA1)/) === undefined) {
                throw ('Unknown signing method specified for OAuthSimple.setSignatureMethod');
                }
            this._parameters['oauth_signature_method']= method.toUpperCase();
            return this;
        };

        /** sign the request
         *
         * note: all arguments are optional, provided you've set them using the
         * other helper functions.
         *
         * @param args {object} hash of arguments for the call
         *                   {action:, path:, parameters:, method:, signatures:}
         *                   all arguments are optional.
         */
        this.sign = function (args) {
            if (args === undefined) {
                args = {};
                }
            // Set any given parameters
            if(args['action'] !== undefined) {
                this.setAction(args['action']);
                }
            if (args['path'] !== undefined) {
                this.setPath(args['path']);
                }
            if (args['method'] !== undefined) {
                this.setSignatureMethod(args['method']);
                }
            this.setTokensAndSecrets(args['signatures']);
            if (args['parameters'] !== undefined){
            this.setParameters(args['parameters']);
            }
            // check the parameters
            var normParams = this._normalizedParameters();
            this._parameters['oauth_signature']=this._generateSignature(normParams);
            return {
                parameters: this._parameters,
                signature: this._oauthEscape(this._parameters['oauth_signature']),
                signed_url: this._path + '?' + this._normalizedParameters(),
                header: this.getHeaderString()
            };
        };

        /** Return a formatted "header" string
         *
         * NOTE: This doesn't set the "Authorization: " prefix, which is required.
         * I don't set it because various set header functions prefer different
         * ways to do that.
         *
         * @param args {object} see .sign
         */
        this.getHeaderString = function(args) {
            if (this._parameters['oauth_signature'] === undefined) {
                this.sign(args);
                }

            var result = 'OAuth ';
            for (var pName in this._parameters)
            {
                if (!pName.match(/^oauth/)) {
                    continue;
                    }
                if ((this._parameters[pName]) instanceof Array)
                {
                    var pLength = this._parameters[pName].length;
                    for (var j=0;j<pLength;j++)
                    {
                        result += pName +'="'+this._oauthEscape(this._parameters[pName][j])+'" ';
                    }
                }
                else
                {
                    result += pName + '="'+this._oauthEscape(this._parameters[pName])+'" ';
                }
            }
            return result;
        };

        // Start Private Methods.

        /** convert the parameter string into a hash of objects.
         *
         */
        this._parseParameterString = function(paramString){
            var elements = paramString.split('&');
            var result={};
            for(var element=elements.shift();element;element=elements.shift())
            {
                var keyToken=element.split('=');
                var value='';
                if (keyToken[1]) {
                    value=decodeURIComponent(keyToken[1]);
                    }
                if(result[keyToken[0]]){
                    if (!(result[keyToken[0]] instanceof Array))
                    {
                        result[keyToken[0]] = Array(result[keyToken[0]],value);
                    }
                    else
                    {
                        result[keyToken[0]].push(value);
                    }
                }
                else
                {
                    result[keyToken[0]]=value;
                }
            }
            return result;
        };

        this._oauthEscape = function(string) {
            if (string === undefined) {
                return "";
                }
            if (string instanceof Array)
            {
                throw('Array passed to _oauthEscape');
            }
            return encodeURIComponent(string).replace(/\!/g, "%21").
            replace(/\*/g, "%2A").
            replace(/'/g, "%27").
            replace(/\(/g, "%28").
            replace(/\)/g, "%29");
        };

        this._getNonce = function (length) {
            if (length === undefined) {
                length=5;
                }
            var result = "";
            var cLength = this._nonce_chars.length;
            for (var i = 0; i < length;i++) {
                var rnum = Math.floor(Math.random() *cLength);
                result += this._nonce_chars.substring(rnum,rnum+1);
            }
            this._parameters['oauth_nonce']=result;
            return result;
        };

        this._getApiKey = function() {
            if (this._secrets.consumer_key === undefined) {
                throw('No consumer_key set for OAuthSimple.');
                }
            this._parameters['oauth_consumer_key']=this._secrets.consumer_key;
            return this._parameters.oauth_consumer_key;
        };

        this._getAccessToken = function() {
            if (this._secrets['oauth_secret'] === undefined) {
                return '';
                }
            if (this._secrets['oauth_token'] === undefined) {
                throw('No oauth_token (access_token) set for OAuthSimple.');
                }
            this._parameters['oauth_token'] = this._secrets.oauth_token;
            return this._parameters.oauth_token;
        };

        this._getTimestamp = function() {
            var d = new Date();
            var ts = Math.floor(d.getTime()/1000);
            this._parameters['oauth_timestamp'] = ts;
            return ts;
        };

        this.b64_hmac_sha1 = function(k,d,_p,_z){
        // heavily optimized and compressed version of http://pajhome.org.uk/crypt/md5/sha1.js
        // _p = b64pad, _z = character size; not used here but I left them available just in case
        if(!_p){_p='=';}if(!_z){_z=8;}function _f(t,b,c,d){if(t<20){return(b&c)|((~b)&d);}if(t<40){return b^c^d;}if(t<60){return(b&c)|(b&d)|(c&d);}return b^c^d;}function _k(t){return(t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514;}function _s(x,y){var l=(x&0xFFFF)+(y&0xFFFF),m=(x>>16)+(y>>16)+(l>>16);return(m<<16)|(l&0xFFFF);}function _r(n,c){return(n<<c)|(n>>>(32-c));}function _c(x,l){x[l>>5]|=0x80<<(24-l%32);x[((l+64>>9)<<4)+15]=l;var w=[80],a=1732584193,b=-271733879,c=-1732584194,d=271733878,e=-1009589776;for(var i=0;i<x.length;i+=16){var o=a,p=b,q=c,r=d,s=e;for(var j=0;j<80;j++){if(j<16){w[j]=x[i+j];}else{w[j]=_r(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);}var t=_s(_s(_r(a,5),_f(j,b,c,d)),_s(_s(e,w[j]),_k(j)));e=d;d=c;c=_r(b,30);b=a;a=t;}a=_s(a,o);b=_s(b,p);c=_s(c,q);d=_s(d,r);e=_s(e,s);}return[a,b,c,d,e];}function _b(s){var b=[],m=(1<<_z)-1;for(var i=0;i<s.length*_z;i+=_z){b[i>>5]|=(s.charCodeAt(i/8)&m)<<(32-_z-i%32);}return b;}function _h(k,d){var b=_b(k);if(b.length>16){b=_c(b,k.length*_z);}var p=[16],o=[16];for(var i=0;i<16;i++){p[i]=b[i]^0x36363636;o[i]=b[i]^0x5C5C5C5C;}var h=_c(p.concat(_b(d)),512+d.length*_z);return _c(o.concat(h),512+160);}function _n(b){var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",s='';for(var i=0;i<b.length*4;i+=3){var r=(((b[i>>2]>>8*(3-i%4))&0xFF)<<16)|(((b[i+1>>2]>>8*(3-(i+1)%4))&0xFF)<<8)|((b[i+2>>2]>>8*(3-(i+2)%4))&0xFF);for(var j=0;j<4;j++){if(i*8+j*6>b.length*32){s+=_p;}else{s+=t.charAt((r>>6*(3-j))&0x3F);}}}return s;}function _x(k,d){return _n(_h(k,d));}return _x(k,d);
        }


        this._normalizedParameters = function() {
            var elements = new Array();
            var paramNames = [];
            var ra =0;
            for (var paramName in this._parameters)
            {
                if (ra++ > 1000) {
                    throw('runaway 1');
                    }
                paramNames.unshift(paramName);
            }
            paramNames = paramNames.sort();
            pLen = paramNames.length;
            for (var i=0;i<pLen; i++)
            {
                paramName=paramNames[i];
                //skip secrets.
                if (paramName.match(/\w+_secret/)) {
                    continue;
                    }
                if (this._parameters[paramName] instanceof Array)
                {
                    var sorted = this._parameters[paramName].sort();
                    var spLen = sorted.length;
                    for (var j = 0;j<spLen;j++){
                        if (ra++ > 1000) {
                            throw('runaway 1');
                            }
                        elements.push(this._oauthEscape(paramName) + '=' +
                                  this._oauthEscape(sorted[j]));
                    }
                    continue;
                }
                elements.push(this._oauthEscape(paramName) + '=' +
                              this._oauthEscape(this._parameters[paramName]));
            }
            return elements.join('&');
        };

        this._generateSignature = function() {

            var secretKey = this._oauthEscape(this._secrets.shared_secret)+'&'+
                this._oauthEscape(this._secrets.oauth_secret);
            if (this._parameters['oauth_signature_method'] == 'PLAINTEXT')
            {
                return secretKey;
            }
            if (this._parameters['oauth_signature_method'] == 'HMAC-SHA1')
            {
                var sigString = this._oauthEscape(this._action)+'&'+this._oauthEscape(this._path)+'&'+this._oauthEscape(this._normalizedParameters());
                return this.b64_hmac_sha1(secretKey,sigString);
            }
            return null;
        };

    return this;
    };
}



;


/**
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

/**
 * Constructor - no need to invoke directly, call initBackgroundPage instead.
 * @constructor
 * @param {String} url_request_token The OAuth request token URL.
 * @param {String} url_auth_token The OAuth authorize token URL.
 * @param {String} url_access_token The OAuth access token URL.
 * @param {String} consumer_key The OAuth consumer key.
 * @param {String} consumer_secret The OAuth consumer secret.
 * @param {String} oauth_scope The OAuth scope parameter.
 * @param {Object} opt_args Optional arguments.  Recognized parameters:
 *     "app_name" {String} Name of the current application
 *     "callback_page" {String} If you renamed chrome_ex_oauth.html, the name
 *          this file was renamed to.
 */
function ChromeExOAuth(url_request_token, url_auth_token, url_access_token,
                       consumer_key, consumer_secret, oauth_scope, opt_args) {
  this.url_request_token = url_request_token;
  this.url_auth_token = url_auth_token;
  this.url_access_token = url_access_token;
  this.consumer_key = consumer_key;
  this.consumer_secret = consumer_secret;
  this.oauth_scope = oauth_scope;
  this.app_name = opt_args && opt_args['app_name'] ||
      "ChromeExOAuth Library";
  this.key_token = "oauth_token";
  this.key_token_secret = "oauth_token_secret";
  this.callback_page = "http://example.com/";
  this.auth_params = {};
  if (opt_args && opt_args['auth_params']) {
    for (key in opt_args['auth_params']) {
      if (opt_args['auth_params'].hasOwnProperty(key)) {
        this.auth_params[key] = opt_args['auth_params'][key];
      }
    }
  }
};

/*******************************************************************************
 * PUBLIC API METHODS
 * Call these from your background page.
 ******************************************************************************/

/**
 * Initializes the OAuth helper from the background page.  You must call this
 * before attempting to make any OAuth calls.
 * @param {Object} oauth_config Configuration parameters in a JavaScript object.
 *     The following parameters are recognized:
 *         "request_url" {String} OAuth request token URL.
 *         "authorize_url" {String} OAuth authorize token URL.
 *         "access_url" {String} OAuth access token URL.
 *         "consumer_key" {String} OAuth consumer key.
 *         "consumer_secret" {String} OAuth consumer secret.
 *         "scope" {String} OAuth access scope.
 *         "app_name" {String} Application name.
 *         "auth_params" {Object} Additional parameters to pass to the
 *             Authorization token URL.  For an example, 'hd', 'hl', 'btmpl':
 *             http://code.google.com/apis/accounts/docs/OAuth_ref.html#GetAuth
 * @return {ChromeExOAuth} An initialized ChromeExOAuth object.
 */
ChromeExOAuth.initBackgroundPage = function(oauth_config) {
  chromeExOAuthConfig = oauth_config;
  chromeExOAuth = ChromeExOAuth.fromConfig(oauth_config);
  chromeExOAuthRedirectStarted = false;
  chromeExOAuthRequestingAccess = false;


  return chromeExOAuth;
};

/**
 * Authorizes the current user with the configued API.  You must call this
 * before calling sendSignedRequest.
 * @param {Function} callback A function to call once an access token has
 *     been obtained.  This callback will be passed the following arguments:
 *         token {String} The OAuth access token.
 *         secret {String} The OAuth access token secret.
 */
ChromeExOAuth.prototype.authorize = function(callback) {
  if (this.hasToken()) {
    callback(this.getToken(), this.getTokenSecret());
  } else {
    chromeExOAuthOnAuthorize = function(token, secret) {
      callback(token, secret);
    };
    
    var request_params = {
        'url_callback_param' : 'chromeexoauthcallback'
      }
      
      
      
    this.getRequestToken(function(url) {


  function list(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url.indexOf('chromeexoauthcallback') != -1) {
        chrome.tabs.remove(tabId);



      var urlparts = changeInfo.url.split("?");

    var querystring = urlparts.slice(1).join("?");
    var params = ChromeExOAuth.formDecode(querystring);

      
      var oauth_token = params['oauth_token'];
      var oauth_verifier = params['oauth_verifier']
      console.log(params);
      chromeExOAuth.getAccessToken(oauth_token, oauth_verifier, function (token, secret) {
        chromeExOAuthOnAuthorize(token, secret);
        chromeExOAuthRedirectStarted = false;
      })
      chrome.tabs.onUpdated.removeListener(list);
    }
  }
  chrome.tabs.onUpdated.addListener(list);

        chrome.tabs.create({ 'url' : url });
      
      
      }, request_params);
    

  }
};

/**
 * Clears any OAuth tokens stored for this configuration.  Effectively a
 * "logout" of the configured OAuth API.
 */
ChromeExOAuth.prototype.clearTokens = function() {
  delete localStorage[this.key_token + encodeURI(this.oauth_scope)];
  delete localStorage[this.key_token_secret + encodeURI(this.oauth_scope)];
};

/**
 * Returns whether a token is currently stored for this configuration.
 * Effectively a check to see whether the current user is "logged in" to
 * the configured OAuth API.
 * @return {Boolean} True if an access token exists.
 */
ChromeExOAuth.prototype.hasToken = function() {
  return !!this.getToken();
};

/**
 * Makes an OAuth-signed HTTP request with the currently authorized tokens.
 * @param {String} url The URL to send the request to.  Querystring parameters
 *     should be omitted.
 * @param {Function} callback A function to be called once the request is
 *     completed.  This callback will be passed the following arguments:
 *         responseText {String} The text response.
 *         xhr {XMLHttpRequest} The XMLHttpRequest object which was used to
 *             send the request.  Useful if you need to check response status
 *             code, etc.
 * @param {Object} opt_params Additional parameters to configure the request.
 *     The following parameters are accepted:
 *         "method" {String} The HTTP method to use.  Defaults to "GET".
 *         "body" {String} A request body to send.  Defaults to null.
 *         "parameters" {Object} Query parameters to include in the request.
 *         "headers" {Object} Additional headers to include in the request.
 */
ChromeExOAuth.prototype.sendSignedRequest = function(url, callback,
                                                     opt_params) {
  var method = opt_params && opt_params['method'] || 'GET';
  var body = opt_params && opt_params['body'] || null;
  var params = opt_params && opt_params['parameters'] || {};
  var headers = opt_params && opt_params['headers'] || {};

  var signedUrl = this.signURL(url, method, params);

  ChromeExOAuth.sendRequest(method, signedUrl, headers, body, function (xhr) {
    if (xhr.readyState == 4) {
      callback(xhr.responseText, xhr);
    }
  });
};

/**
 * Adds the required OAuth parameters to the given url and returns the
 * result.  Useful if you need a signed url but don't want to make an XHR
 * request.
 * @param {String} method The http method to use.
 * @param {String} url The base url of the resource you are querying.
 * @param {Object} opt_params Query parameters to include in the request.
 * @return {String} The base url plus any query params plus any OAuth params.
 */
ChromeExOAuth.prototype.signURL = function(url, method, opt_params) {
  var token = this.getToken();
  var secret = this.getTokenSecret();
  if (!token || !secret) {
    throw new Error("No oauth token or token secret");
  }

  var params = opt_params || {};

  var result = OAuthSimple().sign({
    action : method,
    path : url,
    parameters : params,
    signatures: {
      consumer_key : this.consumer_key,
      shared_secret : this.consumer_secret,
      oauth_secret : secret,
      oauth_token: token
    }
  });

  return result.signed_url;
};

/**
 * Generates the Authorization header based on the oauth parameters.
 * @param {String} url The base url of the resource you are querying.
 * @param {Object} opt_params Query parameters to include in the request.
 * @return {String} An Authorization header containing the oauth_* params.
 */
ChromeExOAuth.prototype.getAuthorizationHeader = function(url, method,
                                                          opt_params) {
  var token = this.getToken();
  var secret = this.getTokenSecret();
  if (!token || !secret) {
    throw new Error("No oauth token or token secret");
  }

  var params = opt_params || {};

  return OAuthSimple().getHeaderString({
    action: method,
    path : url,
    parameters : params,
    signatures: {
      consumer_key : this.consumer_key,
      shared_secret : this.consumer_secret,
      oauth_secret : secret,
      oauth_token: token
    }
  });
};

/*******************************************************************************
 * PRIVATE API METHODS
 * Used by the library.  There should be no need to call these methods directly.
 ******************************************************************************/

/**
 * Creates a new ChromeExOAuth object from the supplied configuration object.
 * @param {Object} oauth_config Configuration parameters in a JavaScript object.
 *     The following parameters are recognized:
 *         "request_url" {String} OAuth request token URL.
 *         "authorize_url" {String} OAuth authorize token URL.
 *         "access_url" {String} OAuth access token URL.
 *         "consumer_key" {String} OAuth consumer key.
 *         "consumer_secret" {String} OAuth consumer secret.
 *         "scope" {String} OAuth access scope.
 *         "app_name" {String} Application name.
 *         "auth_params" {Object} Additional parameters to pass to the
 *             Authorization token URL.  For an example, 'hd', 'hl', 'btmpl':
 *             http://code.google.com/apis/accounts/docs/OAuth_ref.html#GetAuth
 * @return {ChromeExOAuth} An initialized ChromeExOAuth object.
 */
ChromeExOAuth.fromConfig = function(oauth_config) {
  return new ChromeExOAuth(
    oauth_config['request_url'],
    oauth_config['authorize_url'],
    oauth_config['access_url'],
    oauth_config['consumer_key'],
    oauth_config['consumer_secret'],
    oauth_config['scope'],
    {
      'app_name' : oauth_config['app_name'],
      'auth_params' : oauth_config['auth_params']
    }
  );
};

/**
 * Initializes chrome_ex_oauth.html and redirects the page if needed to start
 * the OAuth flow.  Once an access token is obtained, this function closes
 * chrome_ex_oauth.html.
 */
ChromeExOAuth.initCallbackPage = function() {
  var background_page = chrome.extension.getBackgroundPage();
  var oauth_config = background_page.chromeExOAuthConfig;
  var oauth = ChromeExOAuth.fromConfig(oauth_config);
  background_page.chromeExOAuthRedirectStarted = true;
  oauth.initOAuthFlow(function (token, secret) {
    background_page.chromeExOAuthOnAuthorize(token, secret);
    background_page.chromeExOAuthRedirectStarted = false;
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.remove(tab.id);
    });
  });
};

/**
 * Sends an HTTP request.  Convenience wrapper for XMLHttpRequest calls.
 * @param {String} method The HTTP method to use.
 * @param {String} url The URL to send the request to.
 * @param {Object} headers Optional request headers in key/value format.
 * @param {String} body Optional body content.
 * @param {Function} callback Function to call when the XMLHttpRequest's
 *     ready state changes.  See documentation for XMLHttpRequest's
 *     onreadystatechange handler for more information.
 */
ChromeExOAuth.sendRequest = function(method, url, headers, body, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(data) {
    callback(xhr, data);
  }
  xhr.open(method, url, true);
  if (headers) {
    for (var header in headers) {
      if (headers.hasOwnProperty(header)) {
        xhr.setRequestHeader(header, headers[header]);
      }
    }
  }
  xhr.send(body);
};

/**
 * Decodes a URL-encoded string into key/value pairs.
 * @param {String} encoded An URL-encoded string.
 * @return {Object} An object representing the decoded key/value pairs found
 *     in the encoded string.
 */
ChromeExOAuth.formDecode = function(encoded) {
  var params = encoded.split("&");
  var decoded = {};
  for (var i = 0, param; param = params[i]; i++) {
    var keyval = param.split("=");
    if (keyval.length == 2) {
      var key = ChromeExOAuth.fromRfc3986(keyval[0]);
      var val = ChromeExOAuth.fromRfc3986(keyval[1]);
      decoded[key] = val;
    }
  }
  return decoded;
};

/**
 * Returns the current window's querystring decoded into key/value pairs.
 * @return {Object} A object representing any key/value pairs found in the
 *     current window's querystring.
 */
ChromeExOAuth.getQueryStringParams = function() {
  var urlparts = location.href.split("?");
  if (urlparts.length >= 2) {
    var querystring = urlparts.slice(1).join("?");
    return ChromeExOAuth.formDecode(querystring);
  }
  return {};
};

/**
 * Binds a function call to a specific object.  This function will also take
 * a variable number of additional arguments which will be prepended to the
 * arguments passed to the bound function when it is called.
 * @param {Function} func The function to bind.
 * @param {Object} obj The object to bind to the function's "this".
 * @return {Function} A closure that will call the bound function.
 */
ChromeExOAuth.bind = function(func, obj) {
  var newargs = Array.prototype.slice.call(arguments).slice(2);
  return function() {
    var combinedargs = newargs.concat(Array.prototype.slice.call(arguments));
    func.apply(obj, combinedargs);
  };
};

/**
 * Encodes a value according to the RFC3986 specification.
 * @param {String} val The string to encode.
 */
ChromeExOAuth.toRfc3986 = function(val){
   return encodeURIComponent(val)
       .replace(/\!/g, "%21")
       .replace(/\*/g, "%2A")
       .replace(/'/g, "%27")
       .replace(/\(/g, "%28")
       .replace(/\)/g, "%29");
};

/**
 * Decodes a string that has been encoded according to RFC3986.
 * @param {String} val The string to decode.
 */
ChromeExOAuth.fromRfc3986 = function(val){
  var tmp = val
      .replace(/%21/g, "!")
      .replace(/%2A/g, "*")
      .replace(/%27/g, "'")
      .replace(/%28/g, "(")
      .replace(/%29/g, ")");
   return decodeURIComponent(tmp);
};

/**
 * Adds a key/value parameter to the supplied URL.
 * @param {String} url An URL which may or may not contain querystring values.
 * @param {String} key A key
 * @param {String} value A value
 * @return {String} The URL with URL-encoded versions of the key and value
 *     appended, prefixing them with "&" or "?" as needed.
 */
ChromeExOAuth.addURLParam = function(url, key, value) {
  var sep = (url.indexOf('?') >= 0) ? "&" : "?";
  return url + sep +
         ChromeExOAuth.toRfc3986(key) + "=" + ChromeExOAuth.toRfc3986(value);
};

/**
 * Stores an OAuth token for the configured scope.
 * @param {String} token The token to store.
 */
ChromeExOAuth.prototype.setToken = function(token) {
  localStorage[this.key_token + encodeURI(this.oauth_scope)] = token;
};

/**
 * Retrieves any stored token for the configured scope.
 * @return {String} The stored token.
 */
ChromeExOAuth.prototype.getToken = function() {
  return localStorage[this.key_token + encodeURI(this.oauth_scope)];
};

/**
 * Stores an OAuth token secret for the configured scope.
 * @param {String} secret The secret to store.
 */
ChromeExOAuth.prototype.setTokenSecret = function(secret) {
  localStorage[this.key_token_secret + encodeURI(this.oauth_scope)] = secret;
};

/**
 * Retrieves any stored secret for the configured scope.
 * @return {String} The stored secret.
 */
ChromeExOAuth.prototype.getTokenSecret = function() {
  return localStorage[this.key_token_secret + encodeURI(this.oauth_scope)];
};

/**
 * Starts an OAuth authorization flow for the current page.  If a token exists,
 * no redirect is needed and the supplied callback is called immediately.
 * If this method detects that a redirect has finished, it grabs the
 * appropriate OAuth parameters from the URL and attempts to retrieve an
 * access token.  If no token exists and no redirect has happened, then
 * an access token is requested and the page is ultimately redirected.
 * @param {Function} callback The function to call once the flow has finished.
 *     This callback will be passed the following arguments:
 *         token {String} The OAuth access token.
 *         secret {String} The OAuth access token secret.
 */
ChromeExOAuth.prototype.initOAuthFlow = function(callback) {
  if (!this.hasToken()) {
    var params = ChromeExOAuth.getQueryStringParams();
    if (params['chromeexoauthcallback'] == 'true') {
      var oauth_token = params['oauth_token'];
      var oauth_verifier = params['oauth_verifier']
      this.getAccessToken(oauth_token, oauth_verifier, callback);
    } else {
      var request_params = {
        'url_callback_param' : 'chromeexoauthcallback'
      }
      this.getRequestToken(function(url) {
        location.href = url;
      }, request_params);
    }
  } else {
    callback(this.getToken(), this.getTokenSecret());
  }
};

/**
 * Requests an OAuth request token.
 * @param {Function} callback Function to call once the authorize URL is
 *     calculated.  This callback will be passed the following arguments:
 *         url {String} The URL the user must be redirected to in order to
 *             approve the token.
 * @param {Object} opt_args Optional arguments.  The following parameters
 *     are accepted:
 *         "url_callback" {String} The URL the OAuth provider will redirect to.
 *         "url_callback_param" {String} A parameter to include in the callback
 *             URL in order to indicate to this library that a redirect has
 *             taken place.
 */
ChromeExOAuth.prototype.getRequestToken = function(callback, opt_args) {
  if (typeof callback !== "function") {
    throw new Error("Specified callback must be a function.");
  }
  var url = "http://example.com/";

  var url_param = opt_args && opt_args['url_callback_param'] ||
                  "chromeexoauthcallback";
  var url_callback = ChromeExOAuth.addURLParam(url, url_param, "true");

  var result = OAuthSimple().sign({
    path : this.url_request_token,
    parameters: {
      "xoauth_displayname" : this.app_name,
      "scope" : this.oauth_scope,
      "oauth_callback" : url_callback
    },
    signatures: {
      consumer_key : this.consumer_key,
      shared_secret : this.consumer_secret
    }
  });
  var onToken = ChromeExOAuth.bind(this.onRequestToken, this, callback);
  ChromeExOAuth.sendRequest("GET", result.signed_url, null, null, onToken);
};

/**
 * Called when a request token has been returned.  Stores the request token
 * secret for later use and sends the authorization url to the supplied
 * callback (for redirecting the user).
 * @param {Function} callback Function to call once the authorize URL is
 *     calculated.  This callback will be passed the following arguments:
 *         url {String} The URL the user must be redirected to in order to
 *             approve the token.
 * @param {XMLHttpRequest} xhr The XMLHttpRequest object used to fetch the
 *     request token.
 */
ChromeExOAuth.prototype.onRequestToken = function(callback, xhr) {
  if (xhr.readyState == 4) {
    if (xhr.status == 200) {
      var params = ChromeExOAuth.formDecode(xhr.responseText);
      var token = params['oauth_token'];
      this.setTokenSecret(params['oauth_token_secret']);
      var url = ChromeExOAuth.addURLParam(this.url_auth_token,
                                          "oauth_token", token);
      for (var key in this.auth_params) {
        if (this.auth_params.hasOwnProperty(key)) {
          url = ChromeExOAuth.addURLParam(url, key, this.auth_params[key]);
        }
      }
      callback(url);
    } else {
      throw new Error("Fetching request token failed. Status " + xhr.status);
    }
  }
};

/**
 * Requests an OAuth access token.
 * @param {String} oauth_token The OAuth request token.
 * @param {String} oauth_verifier The OAuth token verifier.
 * @param {Function} callback The function to call once the token is obtained.
 *     This callback will be passed the following arguments:
 *         token {String} The OAuth access token.
 *         secret {String} The OAuth access token secret.
 */
ChromeExOAuth.prototype.getAccessToken = function(oauth_token, oauth_verifier,
                                                  callback) {
  if (typeof callback !== "function") {
    throw new Error("Specified callback must be a function.");
  }
  var bg = chrome.extension.getBackgroundPage();
  if (bg.chromeExOAuthRequestingAccess == false) {
    bg.chromeExOAuthRequestingAccess = true;

    var result = OAuthSimple().sign({
      path : this.url_access_token,
      parameters: {
        "oauth_token" : oauth_token,
        "oauth_verifier" : oauth_verifier
      },
      signatures: {
        consumer_key : this.consumer_key,
        shared_secret : this.consumer_secret,
        oauth_secret : this.getTokenSecret(this.oauth_scope)
      }
    });

    var onToken = ChromeExOAuth.bind(this.onAccessToken, this, callback);
    ChromeExOAuth.sendRequest("GET", result.signed_url, null, null, onToken);
  }
};

/**
 * Called when an access token has been returned.  Stores the access token and
 * access token secret for later use and sends them to the supplied callback.
 * @param {Function} callback The function to call once the token is obtained.
 *     This callback will be passed the following arguments:
 *         token {String} The OAuth access token.
 *         secret {String} The OAuth access token secret.
 * @param {XMLHttpRequest} xhr The XMLHttpRequest object used to fetch the
 *     access token.
 */
ChromeExOAuth.prototype.onAccessToken = function(callback, xhr) {
  if (xhr.readyState == 4) {
    var bg = chrome.extension.getBackgroundPage();
    if (xhr.status == 200) {
      var params = ChromeExOAuth.formDecode(xhr.responseText);
      var token = params["oauth_token"];
      var secret = params["oauth_token_secret"];
      this.setToken(token);
      this.setTokenSecret(secret);
      bg.chromeExOAuthRequestingAccess = false;
      callback(token, secret);
    } else {
      bg.chromeExOAuthRequestingAccess = false;
      throw new Error("Fetching access token failed with status " + xhr.status);
    }
  }
};



;


/*
  do not venture below, i hate this.
  wont bother seeing if https works
*/
var PicasaOAUTH = ChromeExOAuth.initBackgroundPage({
  'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
  'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
  'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
  'consumer_key' : 'anonymous',
  'consumer_secret' : 'anonymous',
  'scope' : 'http://picasaweb.google.com/data/',
  'app_name' : 'drag2up'
});


function uploadPicasa(req, callback){
  // Constants for various album types.
  var PICASA = 'picasa';
  var ALBUM_TYPE_STRING = {
    'picasa': 'Picasa Web Albums'
  };
  
  
  function complete(resp, xhr){
    var prs = JSON.parse(resp);
    console.log(resp, xhr);
    var href = prs.entry.link.filter(function(e){return e.type.indexOf('image/') == 0})[0].href
    callback(href);
    
  }
  
  getRaw(req, function(file){
    var builder = new BlobBuilder();
    var bin = file.data;
    var arr = new Uint8Array(bin.length);
    for(var i = 0, l = bin.length; i < l; i++){
      arr[i] = bin.charCodeAt(i)
    }
    builder.append(arr.buffer);
    
    PicasaOAUTH.authorize(function() {
      console.log("yay authorized");
      
      
      
       PicasaOAUTH.sendSignedRequest(
        'http://picasaweb.google.com/data/feed/api/user/default',
        function(resp, xhr) {
          if (!(xhr.status >= 200 && xhr.status <= 299)) {
            alert('Error: Response status = ' + xhr.status +
                  ', response body = "' + xhr.responseText + '"');
            return;
          }
          var jsonData = $.parseJSON(resp);
          var albums = []
          var msg = "Please select an album to upload to (enter the number): \n"
          $.each(jsonData.feed.entry, function(index, entryData) {
            albums[1+index] = {id: entryData['gphoto$id']['$t'], title: entryData.title['$t']};
            msg += (1+index) + ' - ' + entryData.title['$t'] + '\n';
          });
          var num = parseInt(prompt(msg));
          if(albums[num] && num){
            var albumId = albums[num].id;
            
            
      PicasaOAUTH.sendSignedRequest(
        'http://picasaweb.google.com/data/feed/api/' +
        'user/default/albumid/'+albumId,
        complete,
        {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
            'Slug': file.name
          },
          parameters: {
            alt: 'json'
          },
          body: builder.getBlob(file.type)
        });
        
        
        
          }else if(num){
            alert('invalid album selection');
          }
          
        },
        {method: 'GET', parameters: {'alt': 'json'}})
    
    
    
      /*

        */
    });
  });
}



;


/*
 * Copyright 2008 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Here's some JavaScript software for implementing OAuth.

   This isn't as useful as you might hope.  OAuth is based around
   allowing tools and websites to talk to each other.  However,
   JavaScript running in web browsers is hampered by security
   restrictions that prevent code running on one website from
   accessing data stored or served on another.

   Before you start hacking, make sure you understand the limitations
   posed by cross-domain XMLHttpRequest.

   On the bright side, some platforms use JavaScript as their
   language, but enable the programmer to access other web sites.
   Examples include Google Gadgets, and Microsoft Vista Sidebar.
   For those platforms, this library should come in handy.
*/

// The HMAC-SHA1 signature method calls b64_hmac_sha1, defined by
// http://pajhome.org.uk/crypt/md5/sha1.js

/* An OAuth message is represented as an object like this:
   {method: "GET", action: "http://server.com/path", parameters: ...}

   The parameters may be either a map {name: value, name2: value2}
   or an Array of name-value pairs [[name, value], [name2, value2]].
   The latter representation is more powerful: it supports parameters
   in a specific sequence, or several parameters with the same name;
   for example [["a", 1], ["b", 2], ["a", 3]].

   Parameter names and values are NOT percent-encoded in an object.
   They must be encoded before transmission and decoded after reception.
   For example, this message object:
   {method: "GET", action: "http://server/path", parameters: {p: "x y"}}
   ... can be transmitted as an HTTP request that begins:
   GET /path?p=x%20y HTTP/1.0
   (This isn't a valid OAuth request, since it lacks a signature etc.)
   Note that the object "x y" is transmitted as x%20y.  To encode
   parameters, you can call OAuth.addToURL, OAuth.formEncode or
   OAuth.getAuthorization.

   This message object model harmonizes with the browser object model for
   input elements of an form, whose value property isn't percent encoded.
   The browser encodes each value before transmitting it. For example,
   see consumer.setInputs in example/consumer.js.
 */

/* This script needs to know what time it is. By default, it uses the local
   clock (new Date), which is apt to be inaccurate in browsers. To do
   better, you can load this script from a URL whose query string contains
   an oauth_timestamp parameter, whose value is a current Unix timestamp.
   For example, when generating the enclosing document using PHP:

   <script src="oauth.js?oauth_timestamp=<?=time()?>" ...

   Another option is to call OAuth.correctTimestamp with a Unix timestamp.
 */

var OAuth; if (OAuth == null) OAuth = {};

OAuth.setProperties = function setProperties(into, from) {
    if (into != null && from != null) {
        for (var key in from) {
            into[key] = from[key];
        }
    }
    return into;
}

OAuth.setProperties(OAuth, // utility functions
{
    percentEncode: function percentEncode(s) {
        if (s == null) {
            return "";
        }
        if (s instanceof Array) {
            var e = "";
            for (var i = 0; i < s.length; ++s) {
                if (e != "") e += '&';
                e += OAuth.percentEncode(s[i]);
            }
            return e;
        }
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
    }
,
    decodePercent: function decodePercent(s) {
        if (s != null) {
            // Handle application/x-www-form-urlencoded, which is defined by
            // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
            s = s.replace(/\+/g, " ");
        }
        return decodeURIComponent(s);
    }
,
    /** Convert the given parameters to an Array of name-value pairs. */
    getParameterList: function getParameterList(parameters) {
        if (parameters == null) {
            return [];
        }
        if (typeof parameters != "object") {
            return OAuth.decodeForm(parameters + "");
        }
        if (parameters instanceof Array) {
            return parameters;
        }
        var list = [];
        for (var p in parameters) {
            list.push([p, parameters[p]]);
        }
        return list;
    }
,
    /** Convert the given parameters to a map from name to value. */
    getParameterMap: function getParameterMap(parameters) {
        if (parameters == null) {
            return {};
        }
        if (typeof parameters != "object") {
            return OAuth.getParameterMap(OAuth.decodeForm(parameters + ""));
        }
        if (parameters instanceof Array) {
            var map = {};
            for (var p = 0; p < parameters.length; ++p) {
                var key = parameters[p][0];
                if (map[key] === undefined) { // first value wins
                    map[key] = parameters[p][1];
                }
            }
            return map;
        }
        return parameters;
    }
,
    getParameter: function getParameter(parameters, name) {
        if (parameters instanceof Array) {
            for (var p = 0; p < parameters.length; ++p) {
                if (parameters[p][0] == name) {
                    return parameters[p][1]; // first value wins
                }
            }
        } else {
            return OAuth.getParameterMap(parameters)[name];
        }
        return null;
    }
,
    formEncode: function formEncode(parameters) {
        var form = "";
        var list = OAuth.getParameterList(parameters);
        for (var p = 0; p < list.length; ++p) {
            var value = list[p][1];
            if (value == null) value = "";
            if (form != "") form += '&';
            form += OAuth.percentEncode(list[p][0])
              +'='+ OAuth.percentEncode(value);
        }
        return form;
    }
,
    decodeForm: function decodeForm(form) {
        var list = [];
        var nvps = form.split('&');
        for (var n = 0; n < nvps.length; ++n) {
            var nvp = nvps[n];
            if (nvp == "") {
                continue;
            }
            var equals = nvp.indexOf('=');
            var name;
            var value;
            if (equals < 0) {
                name = OAuth.decodePercent(nvp);
                value = null;
            } else {
                name = OAuth.decodePercent(nvp.substring(0, equals));
                value = OAuth.decodePercent(nvp.substring(equals + 1));
            }
            list.push([name, value]);
        }
        return list;
    }
,
    setParameter: function setParameter(message, name, value) {
        var parameters = message.parameters;
        if (parameters instanceof Array) {
            for (var p = 0; p < parameters.length; ++p) {
                if (parameters[p][0] == name) {
                    if (value === undefined) {
                        parameters.splice(p, 1);
                    } else {
                        parameters[p][1] = value;
                        value = undefined;
                    }
                }
            }
            if (value !== undefined) {
                parameters.push([name, value]);
            }
        } else {
            parameters = OAuth.getParameterMap(parameters);
            parameters[name] = value;
            message.parameters = parameters;
        }
    }
,
    setParameters: function setParameters(message, parameters) {
        var list = OAuth.getParameterList(parameters);
        for (var i = 0; i < list.length; ++i) {
            OAuth.setParameter(message, list[i][0], list[i][1]);
        }
    }
,
    /** Fill in parameters to help construct a request message.
        This function doesn't fill in every parameter.
        The accessor object should be like:
        {consumerKey:'foo', consumerSecret:'bar', accessorSecret:'nurn', token:'krelm', tokenSecret:'blah'}
        The accessorSecret property is optional.
     */
    completeRequest: function completeRequest(message, accessor) {
        if (message.method == null) {
            message.method = "GET";
        }
        var map = OAuth.getParameterMap(message.parameters);
        if (map.oauth_consumer_key == null) {
            OAuth.setParameter(message, "oauth_consumer_key", accessor.consumerKey || "");
        }
        if (map.oauth_token == null && accessor.token != null) {
            OAuth.setParameter(message, "oauth_token", accessor.token);
        }
        if (map.oauth_version == null) {
            OAuth.setParameter(message, "oauth_version", "1.0");
        }
        if (map.oauth_timestamp == null) {
            OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
        }
        if (map.oauth_nonce == null) {
            OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
        }
        OAuth.SignatureMethod.sign(message, accessor);
    }
,
    setTimestampAndNonce: function setTimestampAndNonce(message) {
        OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
        OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
    }
,
    addToURL: function addToURL(url, parameters) {
        newURL = url;
        if (parameters != null) {
            var toAdd = OAuth.formEncode(parameters);
            if (toAdd.length > 0) {
                var q = url.indexOf('?');
                if (q < 0) newURL += '?';
                else       newURL += '&';
                newURL += toAdd;
            }
        }
        return newURL;
    }
,
    /** Construct the value of the Authorization header for an HTTP request. */
    getAuthorizationHeader: function getAuthorizationHeader(realm, parameters) {
        var header = 'OAuth realm="' + OAuth.percentEncode(realm) + '"';
        var list = OAuth.getParameterList(parameters);
        for (var p = 0; p < list.length; ++p) {
            var parameter = list[p];
            var name = parameter[0];
            if (name.indexOf("oauth_") == 0) {
                header += ',' + OAuth.percentEncode(name) + '="' + OAuth.percentEncode(parameter[1]) + '"';
            }
        }
        return header;
    }
,
    /** Correct the time using a parameter from the URL from which the last script was loaded. */
    correctTimestampFromSrc: function correctTimestampFromSrc(parameterName) {
        parameterName = parameterName || "oauth_timestamp";
        var scripts = document.getElementsByTagName('script');
        if (scripts == null || !scripts.length) return;
        var src = scripts[scripts.length-1].src;
        if (!src) return;
        var q = src.indexOf("?");
        if (q < 0) return;
        parameters = OAuth.getParameterMap(OAuth.decodeForm(src.substring(q+1)));
        var t = parameters[parameterName];
        if (t == null) return;
        OAuth.correctTimestamp(t);
    }
,
    /** Generate timestamps starting with the given value. */
    correctTimestamp: function correctTimestamp(timestamp) {
        OAuth.timeCorrectionMsec = (timestamp * 1000) - (new Date()).getTime();
    }
,
    /** The difference between the correct time and my clock. */
    timeCorrectionMsec: 0
,
    timestamp: function timestamp() {
        var t = (new Date()).getTime() + OAuth.timeCorrectionMsec;
        return Math.floor(t / 1000);
    }
,
    nonce: function nonce(length) {
        var chars = OAuth.nonce.CHARS;
        var result = "";
        for (var i = 0; i < length; ++i) {
            var rnum = Math.floor(Math.random() * chars.length);
            result += chars.substring(rnum, rnum+1);
        }
        return result;
    }
});

OAuth.nonce.CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

/** Define a constructor function,
    without causing trouble to anyone who was using it as a namespace.
    That is, if parent[name] already existed and had properties,
    copy those properties into the new constructor.
 */
OAuth.declareClass = function declareClass(parent, name, newConstructor) {
    var previous = parent[name];
    parent[name] = newConstructor;
    if (newConstructor != null && previous != null) {
        for (var key in previous) {
            if (key != "prototype") {
                newConstructor[key] = previous[key];
            }
        }
    }
    return newConstructor;
}

/** An abstract algorithm for signing messages. */
OAuth.declareClass(OAuth, "SignatureMethod", function OAuthSignatureMethod(){});

OAuth.setProperties(OAuth.SignatureMethod.prototype, // instance members
{
    /** Add a signature to the message. */
    sign: function sign(message) {
        var baseString = OAuth.SignatureMethod.getBaseString(message);
        var signature = this.getSignature(baseString);
        OAuth.setParameter(message, "oauth_signature", signature);
        return signature; // just in case someone's interested
    }
,
    /** Set the key string for signing. */
    initialize: function initialize(name, accessor) {
        var consumerSecret;
        if (accessor.accessorSecret != null
            && name.length > 9
            && name.substring(name.length-9) == "-Accessor")
        {
            consumerSecret = accessor.accessorSecret;
        } else {
            consumerSecret = accessor.consumerSecret;
        }
        this.key = OAuth.percentEncode(consumerSecret)
             +"&"+ OAuth.percentEncode(accessor.tokenSecret);
    }
});

/* SignatureMethod expects an accessor object to be like this:
   {tokenSecret: "lakjsdflkj...", consumerSecret: "QOUEWRI..", accessorSecret: "xcmvzc..."}
   The accessorSecret property is optional.
 */
// Class members:
OAuth.setProperties(OAuth.SignatureMethod, // class members
{
    sign: function sign(message, accessor) {
        var name = OAuth.getParameterMap(message.parameters).oauth_signature_method;
        if (name == null || name == "") {
            name = "HMAC-SHA1";
            OAuth.setParameter(message, "oauth_signature_method", name);
        }
        OAuth.SignatureMethod.newMethod(name, accessor).sign(message);
    }
,
    /** Instantiate a SignatureMethod for the given method name. */
    newMethod: function newMethod(name, accessor) {
        var impl = OAuth.SignatureMethod.REGISTERED[name];
        if (impl != null) {
            var method = new impl();
            method.initialize(name, accessor);
            return method;
        }
        var err = new Error("signature_method_rejected");
        var acceptable = "";
        for (var r in OAuth.SignatureMethod.REGISTERED) {
            if (acceptable != "") acceptable += '&';
            acceptable += OAuth.percentEncode(r);
        }
        err.oauth_acceptable_signature_methods = acceptable;
        throw err;
    }
,
    /** A map from signature method name to constructor. */
    REGISTERED : {}
,
    /** Subsequently, the given constructor will be used for the named methods.
        The constructor will be called with no parameters.
        The resulting object should usually implement getSignature(baseString).
        You can easily define such a constructor by calling makeSubclass, below.
     */
    registerMethodClass: function registerMethodClass(names, classConstructor) {
        for (var n = 0; n < names.length; ++n) {
            OAuth.SignatureMethod.REGISTERED[names[n]] = classConstructor;
        }
    }
,
    /** Create a subclass of OAuth.SignatureMethod, with the given getSignature function. */
    makeSubclass: function makeSubclass(getSignatureFunction) {
        var superClass = OAuth.SignatureMethod;
        var subClass = function() {
            superClass.call(this);
        };
        subClass.prototype = new superClass();
        // Delete instance variables from prototype:
        // delete subclass.prototype... There aren't any.
        subClass.prototype.getSignature = getSignatureFunction;
        subClass.prototype.constructor = subClass;
        return subClass;
    }
,
    getBaseString: function getBaseString(message) {
        var URL = message.action;
        var q = URL.indexOf('?');
        var parameters;
        if (q < 0) {
            parameters = message.parameters;
        } else {
            // Combine the URL query string with the other parameters:
            parameters = OAuth.decodeForm(URL.substring(q + 1));
            var toAdd = OAuth.getParameterList(message.parameters);
            for (var a = 0; a < toAdd.length; ++a) {
                parameters.push(toAdd[a]);
            }
        }
        return OAuth.percentEncode(message.method.toUpperCase())
         +'&'+ OAuth.percentEncode(OAuth.SignatureMethod.normalizeUrl(URL))
         +'&'+ OAuth.percentEncode(OAuth.SignatureMethod.normalizeParameters(parameters));
    }
,
    normalizeUrl: function normalizeUrl(url) {
        var uri = OAuth.SignatureMethod.parseUri(url);
        var scheme = uri.protocol.toLowerCase();
        var authority = uri.authority.toLowerCase();
        var dropPort = (scheme == "http" && uri.port == 80)
                    || (scheme == "https" && uri.port == 443);
        if (dropPort) {
            // find the last : in the authority
            var index = authority.lastIndexOf(":");
            if (index >= 0) {
                authority = authority.substring(0, index);
            }
        }
        var path = uri.path;
        if (!path) {
            path = "/"; // conforms to RFC 2616 section 3.2.2
        }
        // we know that there is no query and no fragment here.
        return scheme + "://" + authority + path;
    }
,
    parseUri: function parseUri (str) {
        /* This function was adapted from parseUri 1.2.1
           http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
         */
        var o = {key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
                 parser: {strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/ }};
        var m = o.parser.strict.exec(str);
        var uri = {};
        var i = 14;
        while (i--) uri[o.key[i]] = m[i] || "";
        return uri;
    }
,
    normalizeParameters: function normalizeParameters(parameters) {
        if (parameters == null) {
            return "";
        }
        var list = OAuth.getParameterList(parameters);
        var sortable = [];
        for (var p = 0; p < list.length; ++p) {
            var nvp = list[p];
            if (nvp[0] != "oauth_signature") {
                sortable.push([ OAuth.percentEncode(nvp[0])
                              + " " // because it comes before any character that can appear in a percentEncoded string.
                              + OAuth.percentEncode(nvp[1])
                              , nvp]);
            }
        }
        sortable.sort(function(a,b) {
                          if (a[0] < b[0]) return  -1;
                          if (a[0] > b[0]) return 1;
                          return 0;
                      });
        var sorted = [];
        for (var s = 0; s < sortable.length; ++s) {
            sorted.push(sortable[s][1]);
        }
        return OAuth.formEncode(sorted);
    }
});

OAuth.SignatureMethod.registerMethodClass(["PLAINTEXT", "PLAINTEXT-Accessor"],
    OAuth.SignatureMethod.makeSubclass(
        function getSignature(baseString) {
            return this.key;
        }
    ));

OAuth.SignatureMethod.registerMethodClass(["HMAC-SHA1", "HMAC-SHA1-Accessor"],
    OAuth.SignatureMethod.makeSubclass(
        function getSignature(baseString) {
            b64pad = '=';
            var signature = b64_hmac_sha1(this.key, baseString);
            return signature;
        }
    ));

try {
    OAuth.correctTimestampFromSrc();
} catch(e) {
}



;


var ModernDropbox = function(consumerKey, consumerSecret) {
	// Constructor / Private
	var _consumerKey = consumerKey;
	var _consumerSecret = consumerSecret;
	
	var _tokens = {};
	var _storagePrefix = "moderndropbox_";
	var _isSandbox = false;
	var _cache = true;
	var _authCallback = "http://example.com/";
	var _fileListLimit = 10000;
	var _cookieTimeOut = 3650;
	var _dropboxApiVersion = 0;
	var _xhr = new XMLHttpRequest();
	
	var _ajaxSendFileContents = function(message, filename, content, callback) {
		_xhr.open("POST", message.action, true);
		
		var params = {};

		for (i in message.parameters) {
			params[message.parameters[i][0]] = message.parameters[i][1];
		}

    content.name = filename;
    params.file = content;

		_xhr.onreadystatechange = function() {
			//console.log(this);
			if(_xhr.status == 200 && _xhr.readyState == 4){
			  callback(_xhr);
			}
		}
		console.log(params);
		_xhr.sendMultipart(params);
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
			
			if (valueMap[key] !== undefined) {
			
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
				options.filename,
				options.content,
				options.success
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
	
	// Public
	return ({
		initialize: function() {
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
							var init = this.initialize;
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
						}).bind(this),
						error: (function(data){
						  _storeAuth({
						    requestToken: '',
						    requestTokenSecret: ''
						  })
						  this.initialize();
						}).bind(this)
					});
				}
			}
			
			return this;
		},
		isAccessGranted: function(){
		  return _isAccessGranted()
		},
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
		
		putFileContents: function(path, file, callback) {
			var filename = path.match(/([^\\\/]+)$/)[1];
			var file_path = path.match(/^(.*?)[^\\\/]+$/)[1];
			var url = "https://api-content.dropbox.com/" + _dropboxApiVersion + "/files/dropbox/" + file_path + "?file=" + filename;
			var message = _createOauthRequest(url, { method: "POST" });
			
			_sendOauthRequest(message, {
				multipart: true,
				content: file,
				filename: filename,
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		logOutDropbox: function() {
			_clearAuthStorage();
		}
	}).initialize();
};



;


//uses multipart helper function.


function uploadDropbox(req, callback){
  //hey! this is a file that has a oauth secret! close your eyes!
  //it probably does not compromise the security for other people to know it
  //but using oauth secrets inside a client app is just wrong. it's sort
  //of an abuse of oauth anyway.
  //<spoiler alert>
  var dropbox = new ModernDropbox("eicw1uywyigukn4", "xkapobwa2r0i8y1");
  //</spoiler alert>
  
  var poll = function(){
    if(dropbox.isAccessGranted()){
      getRaw(req, function(file){
        var fname = Math.random().toString(36).substr(2,4) + '/' + file.name;
        var folder = 'drag2up/'
        dropbox.putFileContents('Public/'+folder + fname, file,
          function(){
            console.log('done uploading');
            //yay done. hopefully
            dropbox.getAccountInfo(function(user){
              console.log('got stuffs now');
              //http://dl.dropbox.com/u/1024307/drag2up/testing.txt
              //console.log(arguments)
              var url = https()+"dl.dropbox.com/u/"+user.uid+"/"+folder+fname;
              callback(url)
            })
          });
      })
    }else{
      setTimeout(poll, 300);
    }
  };
  poll();
  
  
}



;



if(localStorage.currentVersion == '1.0.3'){
  if(typeof chrome != 'undefined'){
    chrome.tabs.create({url: "options.html", selected: true});
  }
}

localStorage.currentVersion = '2.0';

var instant_host = 'drag2up.appspot.com/'//'localhost:8080/'

function uploadData(file, callback){
  console.log('uploading data');
  var hostfn = {
    hotfile: uploadHotfile,
    gist: uploadGist,
    imgur: uploadImgur,
    imageshack: uploadImageshack,
    dropbox: uploadDropbox,
    pastebin: uploadPastebin,
    cloudapp: uploadCloudApp,
    flickr: uploadFlickr,
    immio: uploadImmio,
    picasa: uploadPicasa,
    chemical: uploadChemical,
    mysticpaste: uploadMysticpaste,
    dafk: uploadDAFK
  };
  var hostname = hostName(file);
  console.log('selecte dhostname',hostname);
  var fn = hostfn[hostname];
  if(fn){
    fn(file, callback);
  }else{
    callback('error: no host function for type '+hostName(file)+' for file type '+fileType(file));
  }
  
  //uploadDataURL(file, callback);
}



var filetable = {};

function params(obj){
  var str = [];
  for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
  return str.join('&');
}


var tabqueue = {};

function https(){
  if(localStorage.no_https == 'on'){
    return 'http://'; //idk why someone would want this
  }
  return 'https://';
}

function handleRequest(request, tab, sendResponse){
  console.log(request)
  console.log('handle request', +new Date, request.id);
  
  function returned_link(obj){
    //here you apply the shorten methods before sending response
    var shortener = localStorage.url_shortener;
    if(shortSvcList[shortener]){ //if there's a url shortener selected
      var orig = obj.url;
      shorten(shortener, orig, function(res){
        if(res.status == 'ok'){
          obj.url = res.url;
        }else{
          obj.url = 'error: the url shortener '+shortener+' is broken. The original URL was '+orig;
        }
        sendResponse(obj); //yay returned call! albeit slightly delayed
      })
    }else{
      sendResponse(obj); //yay returned call!
    }
  }
  
  var instant = (localStorage.instant || 'on') == 'on'; //woot. its called instant because google made google instant.

  if(instant){
    var car = new racer(2, function(data){
      linkData(request.id, data.url);
    });
  }
  
  console.log('progress of instant',instant);
  
  if(instant){
    console.log('initializing instnat');
    instantInit({
        id: request.id,
        name:request.name || 'unknown.filetype', 
        type: request.type || 'application/octet-stream', 
        size: request.size || -1, 
        data: '\xff'
      }, function(parts){
      car.done();
      console.log('finished initializing instant', +new Date);
      returned_link({
        callback: request.id,
        url: https()+instant_host+''+parts[0]
      })
    })
  }
  console.log('read file', +new Date);

  console.log('set queue');
  if(typeof chrome != 'undefined'){
    tabqueue[tab] = (tabqueue[tab] || 0) + 1;
    chrome.pageAction.show(tab);  
    chrome.pageAction.setTitle({tabId: tab, title: 'Uploading '+tabqueue[tab]+' files...'});
  }
  console.log('going to upload');
  uploadData(request, function(url){
    if(instant){
      car.done({url: url});
    }else if(filetable[request.id]){ //non-instant
      returned_link({callback: request.id, url: url})
    }
    if(typeof chrome != 'undefined'){
      tabqueue[tab]--;
      chrome.pageAction.setTitle({tabId: tab, title: 'Uploading '+tabqueue[tab]+' files...'});
      if(tabqueue[tab] == 0) chrome.pageAction.hide(tab);
    }
  });
  
}

//solve race conditions
function racer(num, callback){
  this.num = num;
  this._done = 0;
  this.data = {};
  this.id = callback;
}
racer.prototype.done = function(data){
  if(data) for(var i in data) this.data[i] = data[i];
  if(++this._done >= this.num) this.id(this.data);
}


function instantInit(file, callback){
  var xhr = new XMLHttpRequest();
  console.log('created xhr')
  xhr.open('GET', https()+instant_host+'new?'+params({
    host: hostName(file),
    size: file.size,
    name: file.name
  }), true);
  console.log('getted things');
  xhr.onload = function(){
    console.log('done initializing instnat', xhr.responseText)
    callback(filetable[file.id] = xhr.responseText.split(','));
  }

  xhr.send();
    console.log('sent');
}


function getURL(type, request, callback){
  if(request.data) return callback(request); //no need reconverting!
  if(/^data:/.test(request.url)){
    console.log('opened via data url');
    var parts = request.url.match(/^data:(.+),/)[1].split(';');
    var mime = parts[0], b64 = parts.indexOf('base64') != -1;
    var enc = request.url.substr(request.url.indexOf(',')+1);
    var data = b64 ? atob(enc) : unescape(enc);
    //data urls dont have any weird encoding issue as far as i can tell
    callback({
      data: data,
      type: mime,
      id: request.id,
      size: data.length,
      name: enc.substr(enc.length/2 - 6, 6) + '_' + mime.replace('/','.')
    });
    
    //callback(new dFile(data, name, mime, id, size)
  }else{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', request.url, true);
    if(type == 'binary' || type == 'raw'){
      xhr.overrideMimeType('text/plain; charset=x-user-defined'); //should i loop through and do that & 0xff?
    }
    xhr.onload = function(){
      console.log('opened via xhr ', request.url);
      var raw = xhr.responseText, data = '';
      //for(var l = raw.length, i=0; i<l;i++){ data += String.fromCharCode(raw.charCodeAt(i) & 0xff); if(!(i%(1024 * 1024))) console.log('1mb') };
      //var data = postMessage(raw.split('').map(function(a){return String.fromCharCode(a.charCodeAt(0) & 0xff)}).join(''));
      //window.fd = data;
      
      //var obj = {id: request.id, bin: function(){return raw}, b64: function(){return btoa(data)},type: request.type, size: data.length, name: request.name}
      //callback(obj);
      //because running it here since js is single threaded causes the asynchrouously running instantInit request to be delayed, slowing it down substantially.
      //using a web worker: probably overkill.

      if(type == 'binary'){
        //*
        if(typeof BlobBuilder == 'undefined'){
        
          for(var raw = xhr.responseText, l = raw.length, i = 0, data = ''; i < l; i++) data += String.fromCharCode(raw.charCodeAt(i) & 0xff);
          
          callback({id: request.id, data: data, type: request.type, size: data.length, name: request.name});
        }else{
        
        var bb = new BlobBuilder();//this webworker is totally overkill
        bb.append("onmessage = function(e) { for(var raw = e.data, l = raw.length, i = 0, data = ''; i < l; i++) data += String.fromCharCode(raw.charCodeAt(i) & 0xff); postMessage(data) }");
        var worker = new Worker(createObjectURL(bb.getBlob()));
        worker.onmessage = function(e) {
          var data = e.data;
          callback({id: request.id, data: data, type: request.type, size: data.length, name: request.name});
        };
        
        worker.postMessage(xhr.responseText);
        }
        
        //*/
      }else if(type == 'raw'){
        var data = xhr.responseText;
        callback({id: request.id, data: data, type: request.type, size: data.length, name: request.name});
      }else{
        callback({id: request.id, data: raw, type: request.type, size: data.length, name: request.name});
      }
    }
    xhr.send();
  }
}


function getText(request, callback){
  getURL('text', request, callback);
}

function getRaw(request, callback){
  getURL('raw', request, callback);
}

function getBinary(request, callback){
  getURL('binary', request, callback);
}

if(typeof chrome != 'undefined'){
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    setTimeout(function(){
      handleRequest(request, sender.tab.id, sendResponse)
    }, 0); //chrome has weird event handling things that make debugging stuff harder
  });
  
  chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url: "options.html", selected: true});
  });
}



function fileType(file){
  var text_ext = 'log,less,sass,coffee,yaml,json,md,css,cfm,yaws,html,htm,xhtml,js,pl,php,php4,php3,phtml,py,rb,rhtml,xml,rss,svg,cgi'.split(',');
  var ext = file.name.toLowerCase().replace(/^.*\.(\w+?)(\#|\?)?.*$/,'$1');
  var image_ext = 'jpg,jpeg,tiff,raw,png,gif,bmp,ppm,pgm,pbm,pnm,webp'.split(','); //woot webp
  if(image_ext.indexOf(ext) != -1) file.type = 'image/'+ (ext == 'jpg'?'jpeg':ext);
  if(file.type){
    if(file.type.indexOf('image/') == 0){
	    //image type
	    return 'image'
	  }else if(file.type.indexOf('text/') == 0){
	    return 'text'
	  }else if(text_ext.indexOf(ext) != -1){
	    return 'text'
	  }else if(file.type.indexOf('script') != -1 || file.type.indexOf('xml') != -1){
	    return 'text'; //scripts or xml usually means code which usually means text
	  }else if(file.size < 1024 * 1024) { //its rare for text files to be so huge
	    /*
	    var src = file.data;//atob(file.data.replace(/^data.+base64,/i,''));
	    var txt = src.substr(0,512) + src.slice(-512);
	    for(var i = 0, isAscii = true; i < 128; i++){
	      if((txt.charCodeAt(i) & 0xff) > 128){
	       isAscii = false;
	       continue
        }
      }
      if(isAscii && file.size < 1024 * 300) return 'text';
      */
	  }
	}
	return 'binary'
}

function hostName(file){
  var typehost = {
    binary: localStorage.binhost || 'hotfile',
	  text: localStorage.texhost || 'gist',
	  image: localStorage.imghost || 'imgur'
	}
	
	var type = fileType(file);
	
	return typehost[type]
}




function uploadDataURL(file, callback){
  //here's the lazy data url encoding system :P
  setTimeout(function(){
    callback(file.data.replace('data:base64','data:text/plain;base64'));
  },1337);
}




function linkData(id, url){
  var xhr = new XMLHttpRequest();
  xhr.open('GET',https()+instant_host+'update/'+filetable[id][0]+'/'+filetable[id][1]+'?'+params({
    url: url
  }), true);
  xhr.onload = function(e){
    if(xhr.status != 200){
      //doomsday scenario: error leads to error leading to error leading to effective DoS
      linkData(id, 'error: could not link to upload url because of '+xhr.status+' '+xhr.statusText)
    }
  }
  xhr.onerror = function(e){
    console.log(e)
    linkData(id, 'error: could not link.')
  }
  xhr.send();
}





