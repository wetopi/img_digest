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
    debug("storeFile: ", mimeType);
    services.getMongoDbConnection(function(err, db) {
        var gs = new mongodb.GridStore(db, filename, "w", {
            "content_type": mimeType
        });

        gs.open(function(err, gs) {
            gs.writeFile(tmpFile, function(err) {
                gs.close(callback);
            });
        });
    });
};

exports.readFile = function(filename, callback) {
    services.getMongoDbConnection(function(err, db) {
        var gs = new mongodb.GridStore(db, filename, "r");
        gs.open(function(err, gsObject) {
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
    services.getMongoDbConnection(function(err, db) {
        var gs = new mongodb.GridStore(db, filename, "r");
        gs.open(function(err, gsObject) {
            gsObject.unlink(callback);
        });
    });
};

