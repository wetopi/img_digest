var config = {};

config.domain_name = 'wetopi';
config.service_name = 'img_diggest';

config.upload = {
    'exchange': {
        'name': 'img_diggest.prod.e.direct.upload', // Image diggest env Production Exchange type Direct for uploads
        'type': 'direct',
        'options': {
            'durable': true
        }
    },
    'queue': {
        'name': 'img_diggest.prod.q.resizer', // Image diggest env Production Queue for Resizer
        'routing_pattern': 'resizer',
        'options': {
            'exclusive': false,
            'durable': true
        }
    },
    'message': {
        'routing_key': 'resizer',
        'options': {
            'delivery_mode': 1 // non persistant
        }
    }

};


// test images:
config.in_path = '/tmp/img_diggest_in';


config.img_list = {
    'dir': 'list', // without leading slashes
    'format' : 'jpg',
    'width': 640,
    'height': 160,
    'shadow_file': 'img_resources/shadow_v3.png'
};
config.img_detail = {
    'dir': 'detail', // without leading slashes
    'format' : 'jpg',
    'width': 640,
    'height': 854
};

module.exports = config;
