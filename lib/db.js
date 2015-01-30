/**
 * GridFS: this lets abstract the mongodb crud oprations
 *
 * User: joan
 * Date: 31/12/14
 * Time: 17:44
 */

var debug = require('debug')('lib:db');
var mongodb = require('mongodb');
var VError = require('verror');


var mongodbConn;

exports.getMongoDbConnection = function(callback) {

    if (mongodbConn && mongodbConn.state == 'connected') {
        callback(null, mongodbConn);

    } else {
        mongodb.connect(process.env.MONGODB_PORT, function(err, conn) {
            if (err) {
                err = new VError(err, "Failed to connect to MongoDB");
                console.error(err.message);
                callback(err, null);

            } else {
                debug("Connection to MongoDB opened");
                mongodbConn = conn;

                mongodbConn.on("close", function(err){
                    console.error(err.message);
                    mongodbConn = null;
                    debug("Connection to MongoDB was closed!");
                });
                callback(err, mongodbConn);
            }
        });
    }
};




exports.storeFile = function(tmpFile, filename, mimeType, callback) {
    debug("storeFile: " + tmpFile + " as " + filename);
    exports.getMongoDbConnection(function(err, db) {
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

/**
 *
 * @param id string
 * @param callback
 */
exports.readFile = function(id, callback) {
    debug("readFile: " + id);
    exports.getMongoDbConnection(function(err, db) {
        var objectId = new mongodb.ObjectID(id),
            gridStore = new mongodb.GridStore(db, objectId, "r");

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

/**
 *
 * @param id string
 * @param callback
 */
exports.deleteFile = function(id, callback) {
    debug("deleteFile: " + id);
    exports.getMongoDbConnection(function(err, db) {
        var objectId = new mongodb.ObjectID(id),
            gridStore = new mongodb.GridStore(db, objectId, "r");

        gridStore.open(function(err, gsObject) {
            gsObject.unlink(callback);
        });
    });
};

