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
var fs = require('fs');


// Set Input dir
if(!fs.existsSync(config.in_path)) fs.mkdirSync(config.in_path, 0777);

// Set Output dir
if(!fs.existsSync(config.out_path))
    fs.mkdir(config.out_path, 0777);

if(!fs.existsSync(config.out_path + config.img_list.dir))
    fs.mkdir(config.out_path + config.img_list.dir, 0777);

if(!fs.existsSync(config.out_path + config.img_detail.dir))
    fs.mkdir(config.out_path + config.img_detail.dir, 0777);





services.getMongoDbConnection(function(err, db) {

    if (!err) {
        services.getRabbitMqConnection(function(err, conn) {

            if (err) {
                console.log("Failed to connect to rabbitmq");

            } else {

                resizer.startConsumers();
                console.log("consumers readdy");

            }
        });
    }
});

