var fs = require('fs');
var data = fs.readFileSync('background.html', 'utf-8');
var sum = data.split('\n').filter(function(tex){
  return /^<script/.test(tex)
}).map(function(tex){
  return fs.readFileSync(tex.match(/src=['"](.*)['"]/)[1], 'utf-8');
}).join('\n\n\n;\n\n\n');
console.log(sum);
