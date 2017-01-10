"use strict"

var readFile = require('../index');
var co = require('co');
var prompt = require('prompt-promise');

function log(val) {
  return new Promise(function(resolve, reject) {
    console.log(val.lineNumber);
    console.log(val.message);
    // setTimeout(resolve, 1000);
    return prompt('Press enter to continue.').then(() => { return resolve()});
  });
}

function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

co(function* () {
  // let csvIt = readFile(__dirname + '/csv-example.csv');

  // yield csvIt.next().value;

  // for(let val of csvIt) {
  //   yield log(val);
  // }
  
  let total = '';
  let count = 0;

  // let xmlIt = readFile(__dirname + '/xml-example.xml', /<\w*:?transactionRecord[^>]*>/, /<\/\w*:?transactionRecord[^>]*>/);
  let xmlIt = readFile('../../../../Documents/CSEC2017-01-10T08.29.29.000000Z.xml', /<\w*:?transactionRecord[^>]*>/, /<\/\w*:?transactionRecord[^>]*>/);

  yield xmlIt.next().value;

  for(let val of xmlIt) {
    // total += val.message;
    count++;
    // yield log(val);
    yield delay(0);
  }

  console.log(count);

  yield prompt('Press enter to continue.');

  return;
});

