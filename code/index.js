'use strict';

const request = require('request');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const utilities = require('./utilities');

function saveFile(filename, body, callback) {
  mkdirp(path.dirname(filename), (err) => {
    if (err) return callback(err);
    fs.writeFile(filename, body, callback);
  });
}

function spider(url, callback) {
  const filename = utilities.urlToFilename(url);
  fs.exists(filename, exists => { //[1]
    if (exists) return callback(null, filename, false);
    console.log(`Downloading ${url}`);
    request(url, (err, response, body) => { //[2]
      if (err) return callback(err);
      saveFile(filename, body, (err) => {
        if (err) return callback(err);
        callback(null, filename, true);
      });
    });
  });
}

spider(process.argv[2], (err, filename, downloaded) => {
  if (err) {
    console.log(err);
  } else if (downloaded) {
    console.log(`Completed the download of "${filename}"`);
  } else {
    console.log(`"${filename}" was already downloaded`);
  }
});
