var config = {};

config.domain_name = 'wetopi';
config.service_name = 'img_diggest';

config.exchange = {
    'name': 'wetopi.img_diggest',
    'type': 'direct',
    'options': {
        'durable': true
    }
};

config.queue = {
    'name': 'img_to_resize',
    'routing_pattern': 'resize-img',
    'oprions': {
        'exclusive': false,
        'durable': true
    }
};


config.publish_resize = {
    'routing_key': 'resize-img',
    'options': {
        'delivery_mode': 1 // non persistant
    }
};


config.in_path = '/tmp/img_diggest_in';
config.out_path = '/tmp/img_diggest_out';

config.img_list = {
    'dir': '/list',
    'format' : 'jpg',
    'width': 640,
    'height': 160,
    'shadow_file': 'img_resources/shadow_v3.png'
};
config.img_detail = {
    'dir': '/detail',
    'format' : 'jpg',
    'width': 640,
    'height': 854
};

module.exports = config;
