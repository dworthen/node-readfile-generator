"use strict"

var fs = require('fs');
var co = require('co');

function onReadable(stream) {
  return new Promise(function(resolve, reject) {
    stream.on('readable', resolve);
  });
};

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
    , chunk
    , msg = '';
    
  stream.setEncoding('utf8');
  
  yield onReadable(stream);
  
  while ((chunk = stream.read()) != null) {
    let message = '';
    data += chunk;
    
    while((message = match())) {
      yield message;
    }
  }
  
  function match() {
    let ind = -1;
    let message = '';
    if (msg) {
      console.log(true);
      if ((ind = msg.search(endMarker)) > -1) {
        let length = msg.match(endMarker)[0].length;
        msg = msg.substring(0, ind + length);
        data = msg.substring(ind + length);
        message = msg;
        msg = '';
        return message;
      } else if ((ind = data.search(endMarker)) > -1) {
        let length = data.match(endMarker)[0].length;
        msg += data.substring(0, ind + length);
        data = data.substring(ind + length);
        message = msg;
        msg = '';
        return message;
      } else {
        msg += data;
        data = '';
        return undefined;
      }
    } else {
      if ((ind = data.search(startMarker)) == -1) return undefined;
      msg = data.substring(ind);
      data = '';
      if ((ind = msg.search(endMarker)) > -1) {
        let length = msg.match(endMarker)[0].length;
        data = msg.substring(ind + length);
        message = msg.substring(0, ind + length);
        msg = '';
        return message;
      }
      return undefined;
    }
  }
  
};

module.exports = readFile;