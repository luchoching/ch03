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

const queue = async.queue((data, cb) => {
  spider(data.link, data.nesting - 1, cb);
}, 2);

function spiderLinks(url, body, nesting, callback) {
  if (nesting === 0) {
    return process.nextTick(callback);
  }
  let links = utilities.getPageLinks(url, body);
  if(links.length === 0) {
    return process.nextTick(callback);
  }

  let completed = 0, hasErrors = false;
  for (const link of links) {
    const data = { link, nesting };
    queue.push(data, (err) => {
      if (err) {
        hasErrors = true;
        return callback(err);
      }
      if (++completed === links.length && !hasErrors) {
        callback();
      }
    });
  }
}

const spidering = new Map();

function spider(url, nesting, callback) {
  if (spidering.has(url)) {
    return process.nextTick(callback);
  }
  spidering.set(url, true);

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
