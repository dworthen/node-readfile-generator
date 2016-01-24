"use strict"

var readFile = require('../index');
var co = require('co');

function log(val) {
  return new Promise(function(resolve, reject) {
    console.log(val);
    setTimeout(resolve, 1000);
  });
}

co(function* () {
  let csvIt = readFile(__dirname + '/csv-example.csv');

  yield csvIt.next().value;

  for(let val of csvIt) {
    yield log(val);
  }
  
  let xmlIt = readFile(__dirname + '/xml-example.xml', /<\w*:?transactionRecord[^>]*>/, /<\/\w*:?transactionRecord[^>]*>/);

  yield xmlIt.next().value;

  for(let val of xmlIt) {
    yield log(val);
  }
});

