function bwt(s){
  s += "@";
  var t = s.split('');
  return t.map(function(e,i){
    return t.slice(i).concat(t.slice(0,i))
  }).sort().map(function(e){
    return e.slice(-1)[0]
  }).join('')
}

function rle(s){
  for(var o = '', b = '', c = 0, i = 0, l = s.length; i < l; i++){
    if(b == s.charAt(i)) c++; else {
      b = s.charAt(i);
      o += (c + s.charAt(i));
      c = 0;
    }
  }
  o+=c;
  return o;
}

function ibwt(r){
  var s = r.split(''), t = s.map(function(){return ''});
  s.forEach(function(e,i){
    t = t.map(function(x,z){
      return s[z]+x
    }).sort()
  })
  for(var l = t.length,k=l-1; l--;)
    if(t[l].charAt(k) == '@') return t[l].slice(0,-1);
}

var Keys = {
  flickr: {
    key: "19d4df95a040e50112bd8e49a6096b59",
    secret: 'edc13066151f70ed'
  },
  dropbox: {
    key: 'eicw1uywyigukn4',
    secret: 'xkapobwa2r0i8y1'
  },
  photobucket: {
    key: '149830906',
    secret: '60a58b565c00487ade4a44850db2e5b5'
  },
  imgur: 'bbb444d5415156c67a5908fb1ce68fd5',
  imageshack: "39ACEJNQa5b92fbce7fd90b1cb6f1104d728eccb"
}

