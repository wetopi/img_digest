#!/usr/bin/env node

/**
 * img_diggest service
 *
 * this worker is in charge of diggesting user images from queue resizer
 * in order to productce the sizes and weights for the consumer
 *
 * User: joan
 * Date: 18/10/14
 * Time: 18:44
 */

var config = require('./config');
var message = require('./lib/message');
var resizer = require('./lib/resizer');


/**
 * consume 'resizer' on direct exchange
 */
message.consume(config.upload, function(msg, callback) {
    resizer.resizeImage(JSON.parse(msg.content.toString()), callback);
});
