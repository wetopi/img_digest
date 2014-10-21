#!/usr/bin/env node

/**
 * img_diggest service
 *
 * this service is in charge of diggesting user images
 * in order to prepare its sizes and weights for the api consume
 *
 * User: joan
 * Date: 18/10/14
 * Time: 18:44
 */

// load ENV conf
var dotenv = require('dotenv');
dotenv.load();

var config = require('./config');
var services = require('./lib/services');
var resizer = require('./lib/resizer');


services.prepareFs();

services.consume(function(msg, callback) {
    resizer.createDetailAndListImages(msg.content.toString(), callback);
});
