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
        msg = msg.substring(0, ind + 1);
        data = msg.substring(ind + 1);
        message = msg;
        msg = '';
        return message;
      } else if ((ind = data.search(endMarker)) > -1) {
        msg += data.substring(0, ind + 1);
        data = data.substring(ind + 1);
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
        data = msg.substring(ind + 1);
        message = msg.substring(0, ind + 1);
        msg = '';
        return message;
      }
      // console.log(msg);
      return undefined;
    }
  }
  
};

function log(val) {
  return new Promise(function(resolve, reject) {
    console.log(val);
    setTimeout(resolve, 1000);
  });
}


// co(function* () {
//   let it = readFile(__dirname + '/package.json');

//   let p = yield it.next().value;

//   // p.then(() => {
//     for(let val of it) {
//       // console.log(val);
//       yield log(val);
//     }
//   // });
  
  
// }).then(function(c) {
//   console.log('finished ' + c);
// }, function() {
//   console.log('failed');
// });


module.exports = readFile;