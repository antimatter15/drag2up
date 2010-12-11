//19d4df95a040e50112bd8e49a6096b59
//edc13066151f70ed (super secret secret)
//http://flickr.com/services/auth/?api_key=19d4df95a040e50112bd8e49a6096b59&perms=write&api_sig=[api_sig]

function uploadFlickr(req, callback){
  function auth(params){
    params.api_key = "19d4df95a040e50112bd8e49a6096b59";
    var secret = 'edc13066151f70ed';
    params.api_sig = hex_md5(secret+Object.keys(params).sort().map(function(x){return x+params[x]})).join(''))
    return params;
  }
  
}
