/**
 * Resource messaging services
 *
 * User: joan
 * Date: 18/10/14
 * Time: 18:44
 */

var debug = require('debug')('lib:message');
var amqp = require('amqplib');




var virtualhost = process.env.RABBITMQ_VIRTUALHOST || "",
    amqpUrl = 'amqp://' +
    process.env.RABBITMQ_USER + ':' +
    process.env.RABBITMQ_PASS + '@' +
    process.env.RABBITMQ_ENV_RABBITMQ_NODENAME+':' +
    process.env.RABBITMQ_PORT_5672_TCP_PORT +
    virtualhost.replace('/','/%2F');

/**
 * Publish a message to our exchange
 * @param msgConfig object: {exchange, queue, message}
 * @param messageObject Object
 * @returns {*}
 */
exports.publish = function(msgConfig, messageObject) {

    debug('publish to %s',amqpUrl);

    return amqp.connect(amqpUrl).then(function(conn) {

        return conn.createChannel().then(function(ch) {

            return ch.assertExchange(msgConfig.exchange.name, msgConfig.exchange.type, msgConfig.exchange.options).then(function() {
                var message = JSON.stringify(messageObject);

                ch.publish(msgConfig.exchange.name, msgConfig.message.routing_key, new Buffer(message), msgConfig.message.options);
                debug("published to exchange '%s' with rounting_key: '%s'", msgConfig.exchange.name, msgConfig.message.routing_key);
                return ch.close();
            });


        }).then(function() { conn.close(); });

    });
};



/**
 * Starts a consumer worker for a given payload
 * @param payload is a function(msg, callback) all params required
 * @returns {*}
 */
/**
 * Starts a consumer worker for a given payload
 * This consumer now only works with direct exchages.
 *
 * @param msgConfig object: {exchange, queue, message} with config for this consumer
 * @param payload function (msg, callback) all params required
 * @returns {Promise}
 */
exports.consume = function(msgConfig, payload) {

    debug('consume from %s',amqpUrl);

    return amqp.connect(amqpUrl).then(function(conn) {

        process.once('SIGINT', function() { conn.close(); });

        return conn.createChannel().then(function(ch) {

            return ch.assertExchange(msgConfig.exchange.name, msgConfig.exchange.type, msgConfig.exchange.options).
                then(function() {
                    return ch.assertQueue(msgConfig.queue.name, msgConfig.queue.option);
                }).
                then(function() {
                    // wait for the ack until serving more.
                    return ch.prefetch(1);
                }).
                then(function() {
                    return ch.bindQueue(msgConfig.queue.name, msgConfig.exchange.name, msgConfig.queue.routing_pattern);
                }).
                then(function() {
                    return ch.consume(msgConfig.queue.name, function(msg) {

                        debug("  [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

                        payload(msg, function() {
                            ch.ack(msg);
                            debug("  [·]");
                        });

                    }, {noAck: false});
                }).
                then(function() {
                    console.info('Waiting for messages. To exit press CTRL+C');
                });


        });
    }).then(null, function(err) {
            console.warn(err);
            console.info('Please check RabbitMQ server is running');
        });
};

