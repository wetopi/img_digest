var config = {};

config.domain_name = 'wetopi';
config.service_name = 'img_digest';

config.upload = {
    'exchange': {
        'name': 'img_digest.prod.e.direct.upload', // Image digest env Production Exchange type Direct for uploads
        'type': 'direct',
        'options': {
            'durable': true
        }
    },
    'queue': {
        'name': 'img_digest.prod.q.resizer', // Image digest env Production Queue for Resizer
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
config.in_path = '../api/fixtures/images';


config.img_list_home = {
    'dir': 'list_home', // without leading slashes
    'format' : 'jpg',
    'width': 640,
    'height': 160,
    'quality': 80,
    'shadow_file': 'img_resources/shadow_v3.png'
};

config.img_list_store = {
    'dir': 'list_store', // without leading slashes
    'format' : 'jpg',
    'width': 320,
    'height': 320,
    'quality': 70,
    'shadow_file': 'img_resources/shadow_store_v1.png'
};

config.img_detail = {
    'dir': 'detail', // without leading slashes
    'format' : 'jpg',
    'width': 640,
    'height': 854,
    'quality': 70
};

module.exports = config;
