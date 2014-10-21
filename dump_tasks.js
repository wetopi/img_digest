#!/usr/bin/env node

// load ENV conf
var dotenv = require('dotenv');
dotenv.load();

var fs = require('fs');
var config = require('./config');
var services = require('./lib/services');

/*
 var args = process.argv.slice(2);
 var message = (args.length > 0) ? args[0] : 'id-1.jpg';
 services.publish(config.publish.routing_key, message);
 */


var dir = config.in_path;
var files = fs.readdirSync(dir);

files.forEach(function(file) {

    if (fs.statSync(dir + '/' + file).isFile()) {
        services.publish(config.publish_resize, file);
    }

});
