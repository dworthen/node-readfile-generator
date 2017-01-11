"use strict"

var fs = require('fs');
var co = require('co');

function onReadable(stream) {
  return new Promise(function(resolve, reject) {
    stream.on('readable', resolve);
  });
};

function* readFile(file, startMarker, endMarker) {
  // default settings for csv/tsv files.
  startMarker = startMarker || /./;
  endMarker = endMarker || /\r\n|\r|\n/;
  
  startMarker = typeof startMarker === "string"
    ? new RegExp(startMarker, 'i')
    : startMarker;
    
  endMarker = typeof endMarker === "string"
    ? new RegExp(endMarker, 'i')
    : endMarker; 

  if(!(startMarker instanceof RegExp)) throw new Error('startMarker needs to be a RegExp.');
  if(!(endMarker instanceof RegExp)) throw new Error('endMarker needs to be a RegExp.');
  
  let data = '' // Queue for whats been read from the file.
    , stream = fs.createReadStream(file)
    , chunk // current utf8 string read from the file
    , msg = ''
    , lineNumber = 1;
    
  stream.setEncoding('utf8');
  
  // Open the file for streaming.
  // Wait for API user to advance the stream.
  yield onReadable(stream);
  
  // begin streaming the file
  while ((chunk = stream.read(32)) != null) {
    let transaction = undefined;
    data += chunk;
    
    // search for messages in the file
    // transaction: { linNumber, message }
    // linNumber: the line number the transaction started on
    // message: startMarker + text + endMarker (inclusive)
    while((transaction = match())) {
      let newLines = transaction.message.match(/\r\n|\r|\n/ig);
      lineNumber += newLines ? newLines.length : 0; 
      yield transaction;
    }
  }

  /**
   * 1. Search for start marker off the data Queue
   * 2. Add data Queue to msg until msg contains end marker.
   * 3. set message = msg = startMarker + text + endMarker
   * 4. set data = content after endMarker
   * 5. return {lineNumber, message}  
   */
  function match() {
    let ind = -1;
    let message = '';

    // 1.
    if(msg == '' && (ind = data.search(startMarker)) != -1) {
      let newLines = data.substring(0, ind + 1).match(/\r\n|\r|\n/ig);
      lineNumber += newLines ? newLines.length : 0; 
      msg = data.substring(ind);
      data = '';
    }

    // 2.
    if(msg != '') {
      msg += data;
      data = '';
    }

    // 3, 4 & 5
    if((ind = msg.search(endMarker)) != -1) {
      let length = msg.match(endMarker)[0].length;
      data = msg.substring(ind + length);
      message = msg.substring(0, ind + length);
      msg = '';
      return {lineNumber: lineNumber, message: message};
    }

    // if complete message (startMarker + text + endMarker) has not been found
    // then return to the while loop streaming over the file to obtain more data from the file
    // and search again
    return undefined;
  }
  
};

module.exports = readFile;