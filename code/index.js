'use strict';

const request = require('request');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const utilities = require('./utilities');
const async = require('async');

function download(url, filename, callback) {
  async.waterfall([
    (cb) => {
      request(url, (err, response, body) => {
        if (err) return cb(err);
        cb(null, body);
      });
    },
    (body, cb) => {
      mkdirp(path.dirname(filename), (err) => {
        if (err) return cb(err);
        cb(null, body);
      });
    },
    (body, cb) => {
      fs.writeFile(filename, body, (err) => {
        if(err) return cb(err);
        cb(null, body);
      });
    }
  ], (err, body) => {
    if(err) return callback(err);
    callback(null, body);
  });
}

function spider(url, callback) {
  const filename = utilities.urlToFilename(url);
  fs.exists(filename, exists => { //[1]
    if (exists) return callback(null, filename, false);
    console.log(`Downloading ${url}`);
    download(url, filename, (err, body) => {
      if (err) return callback(err);
      console.log(body);
      callback(null, filename, true);
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

