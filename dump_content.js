#!/usr/bin/env node

/**
 * run this node script in order to add images to our mongodb
 * this simulates what wetopi api does when user posts an image.
 */

// load ENV conf
var dotenv = require('dotenv');
dotenv.load();
var config = require('./config');

var fs = require('fs');
var mime = require('mime');
var crypto = require('crypto');
var uuid = require('node-uuid');
var services = require('./lib/services');
var gridfs = require('./lib/gridfs');
var imgData = require('./lib/img_data');

var debug = require('debug')('dump_content');
var VError = require('verror');


debug('start');
// do not start until we have a connection to share on every file management
services.getMongoDbConnection(function() {

  // Fs input dir where test images come from
  if(!fs.existsSync(config.in_path)) fs.mkdirSync(config.in_path, 0777);

  addAllFilesFromFs();
  debug('done');
});


/**
 * Read files from fs, saves them on gridfs and emmits a message for each one when done.
 */
function addAllFilesFromFs() {

  var dir = config.in_path;
  var files = fs.readdirSync(dir);

  files.forEach(function(fileName) {
    var theFile =  dir + '/' + fileName;

    if (fs.statSync(theFile).isFile()) {

      addThisFile(theFile, function(err, data) {
        if (err) {
          console.error(err.message);
        } else {
          services.publish(config.upload, data);
        }
      });
    }

  });
}


/**
 * Given a local fs stored image file, store it to GridFS
 * @param theFile the filename with its path
 * @param callback a required function
 *
 * the data passed to callback is an image object as def in img_data
 */
function addThisFile(theFile, callback) {

  var mimeType = mime.lookup(theFile);
  var fileName = generateNewFileName();
  var err = false;

  if (!validImageType(mimeType)) {
    // fs.unlink(theFile);
    err = new VError('Image type for %s not supported. Try uploading JPG or PNG images.', theFile);
    console.error(err.message);
    return callback(err);
  }


  gridfs.storeFile(theFile, fileName, mimeType, function (err) {

    var data = imgData.make({
      filename: fileName,
      mime: mimeType
    });

    if (err) {
      err = new VError(err, 'Error trying to store %s with id %s', theFile, fileName);
      console.error(err.message);
      return callback(err);
    }

    // fs.unlink(theFile);
    callback(err, data);

  });
}



function generateNewFileName() {
  return crypto.createHash('md5').update(uuid.v4()).digest("hex");
}

function validImageType(mimeType) {
  return ["image/gif", "image/jpeg", "image/png"].indexOf(mimeType) !== -1;
}
