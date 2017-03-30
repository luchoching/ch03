'use strict';

const request = require('request');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const utilities = require('./utilities');
const async = require('async');

function saveFile(filename, body, callback) {
  mkdirp(path.dirname(filename), (err) => {
    if (err) return callback(err);
    fs.writeFile(filename, body, callback);
  });
}

function download(url, filename, callback) {
  console.log(`Downloading ${url}`);
  request(url, (err, response, body) => {
    if (err) return callback(err);
    saveFile(filename, body, (err) => {
      if (err) return callback(err);
      callback(null, body);
      // callback(null);
    });
  });
}

function spiderLinks(url, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback);
  }
  let links = utilities.getPageLinks(url, body);
  if(links.length === 0) {
    return process.nextTick(callback);
  }

  async.each(links, (link, cb) => {
    spider(link, nesting -1, cb);
  }, (err) => {
    if(err) return callback(err);
    callback();
  });
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
        // console.log(body);
        // callback(null, filename, true);
        spiderLinks(url, body, nesting, callback);
      });
    }
    // callback(null, filename, false);
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
