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
      console.log(`Downloading ${url}`);
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

function spiderLinks(url, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback);
  }
  let links = utilities.getPageLinks(url, body);

  function iterate(index) {
    if (index === links.length) return callback();
    spider(links[index], nesting - 1, (err) => {
      if (err) return callback(err);
      iterate(index + 1);
    });
  }

  iterate(0);
}

function spider(url, nesting, callback) {
  const filename = utilities.urlToFilename(url);
  fs.readFile(filename, 'utf-8', (err, data) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return callback(err);
      }
      return download(url, filename, (err, body) => {
        if (err) return callback(err);
        spiderLinks(url, body, nesting, callback);
      });
    }
    spiderLinks(url, data, nesting, callback);
  });
}

spider(process.argv[2], 1, (err, filename, downloaded) => {
  if (err) {
    console.log(err);
  } else if (downloaded) {
    console.log(`Completed the download of "${filename}"`);
  } else {
    console.log(`"${filename}" was already downloaded`);
  }
});
