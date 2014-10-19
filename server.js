// load ENV conf
var dotenv = require('dotenv');
dotenv.load();

// load PROCESS conf
var config = require('./config');

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

// process images:
resizer.createDetailAndListImages('id-1.jpg', function() {

    console.log('DONE server process');

});
