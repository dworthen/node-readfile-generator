"use strict"

var fs = require('fs');
var co = require('co');

function onReadable(stream) {
  return new Promise(function(resolve, reject) {
    stream.on('readable', resolve);
  });
}

function *readFile(file, startMarker, endMarker) {
  startMarker = startMarker || /./;
  endMarker = endMarker || /\r|\n/;
  
  startMarker = typeof startMarker === "string"
    ? new RegExp(startMarker, 'i')
    : startMarker;
    
  endMarker = typeof endMarker === "string"
    ? new RegExp(endMarker, 'i')
    : endMarker; 
  
  let data = ''
    , stream = fs.createReadStream(file)
    , chunk;
    
  stream.setEncoding('utf8');
  
  let response = yield onReadable(stream);
  
  while ((chunk = stream.read()) != null) {
    data += chunk;
    yield chunk;
  }
  
}

co(function* () {
  let it = readFile(__dirname + '/package.json');

  let p = yield it.next().value;

  // p.then(() => {
    for(let val of it) {
      console.log(val);
    }
  // });
  
});

