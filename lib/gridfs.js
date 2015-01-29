/**
 * GridFS: this lets abstract the mongodb crud oprations
 *
 * User: joan
 * Date: 31/12/14
 * Time: 17:44
 */

var debug = require('debug')('lib:gridfs');
var mongodb = require('mongodb');
var services = require('./services.js');


exports.storeFile = function(tmpFile, filename, mimeType, callback) {
    debug("storeFile: " + tmpFile + " as " + filename);
    services.getMongoDbConnection(function(err, db) {
        var gridStore = new mongodb.GridStore(db, filename, "w", {
            "content_type": mimeType
        });

        gridStore.open(function(err, gridStore) {
            gridStore.writeFile(tmpFile, function(err) {
                gridStore.close(callback);
            });
        });
    });
};

exports.readFile = function(filename, callback) {
    debug("readFile: " + filename);
    services.getMongoDbConnection(function(err, db) {
        var gridStore = new mongodb.GridStore(db, filename, "r");
        gridStore.open(function(err, gsObject) {
            if (err) {
                callback(err);
            } else {
                gsObject.read(gsObject.length, function(err, data) {
                    gsObject.close(function() {
                        callback(err, {"binary": data, "gsObject": gsObject});
                    });
                });
            }
        });
    });
};

exports.deleteFile = function(filename, callback) {
    debug("deleteFile: " + filename);
    services.getMongoDbConnection(function(err, db) {
        var gridStore = new mongodb.GridStore(db, filename, "r");
        gridStore.open(function(err, gsObject) {
            gsObject.unlink(callback);
        });
    });
};

