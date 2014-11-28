/**
 * Resource services connections
 *
 * User: joan
 * Date: 18/10/14
 * Time: 18:44
 */


// load ENV conf
var dotenv = require('dotenv');
dotenv.load();

var debug = require('debug')('services');

var fs = require('fs');
var mongodb = require('mongodb');
var amqp = require('amqplib');

var config = require('../config');

var mongodbConn;

exports.getMongoDbConnection = function(callback) {
    if (mongodbConn && mongodbConn.state == 'connected') {
        callback(null, mongodbConn);
    } else {
        mongodb.connect(process.env.MONGODB_URL, function(err, conn) {
            if (err) {
                console.log("Failed to connect to MongoDB: ", err);
                callback(err, null);

            } else {
                debug("Connection to MongoDB opened");
                mongodbConn = conn;

                mongodbConn.on("close", function(error){
                    mongodbConn = null;
                    debug("Connection to MongoDB was closed!");
                });
                callback(err, mongodbConn);
            }
        });
    }
}



exports.prepareFs = function() {

    // Set Input dir
    if(!fs.existsSync(config.in_path)) fs.mkdirSync(config.in_path, 0777);

    // Set Output dir
    if(!fs.existsSync(config.out_path))
        fs.mkdir(config.out_path, 0777);

    if(!fs.existsSync(config.out_path + config.img_list.dir))
        fs.mkdir(config.out_path + config.img_list.dir, 0777);

    if(!fs.existsSync(config.out_path + config.img_detail.dir))
        fs.mkdir(config.out_path + config.img_detail.dir, 0777);

}


/**
 * Publish a message to our exchange
 * @param routing_key
 * @param message string
 * @returns {*|Promise}
 */
exports.publish = function(msgConfig, message) {

    return amqp.connect(process.env.RABBITMQ_URL).then(function(conn) {

        return conn.createChannel().then(function(ch) {

            return ch.assertExchange(config.exchange.name, config.exchange.type, config.exchange.options).then(function() {
                ch.publish(config.exchange.name, msgConfig.routing_key, new Buffer(message), msgConfig.options);
                debug("Sent '%s' to exchange with rounting_key: '%s'", message, msgConfig.routing_key  );
                return ch.close();
            });


        }).then(function() { conn.close(); });

    })
}


/**
 * Starts a consumer worker for a given payload
 * @param payload
 * @returns {Promise}
 */
exports.consume = function(payload) {

    return amqp.connect(process.env.RABBITMQ_URL).then(function(conn) {

        process.once('SIGINT', function() { conn.close(); });

        return conn.createChannel().then(function(ch) {


            return ch.assertExchange(config.exchange.name, config.exchange.type, config.exchange.options).
                then(function() {
                    return ch.assertQueue(config.queue.name, config.queue.option);
                }).
                then(function() {
                    // wait for the ack until serving more
                    return ch.prefetch(1);
                }).
                then(function() {
                    return ch.bindQueue(config.queue.name, config.exchange.name, config.queue.routing_pattern);
                }).
                then(function() {
                    return ch.consume(config.queue.name, function(msg) {

                        debug("  [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

                        payload(msg, function() {
                            ch.ack(msg);
                            debug("  [·]");
                        });

                    }, {noAck: false});
                }).
                then(function() {
                    console.info('Waiting for work. To exit press CTRL+C');
                });


        });
    }).then(null, function(err) {
            console.warn(err);
            console.info('Please check RabbitMQ server is running');
        });
};

