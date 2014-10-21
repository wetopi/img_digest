/**
 * Resizer: resizes a given image to its detail and list sizes
 *
 * User: joan
 * Date: 18/10/14
 * Time: 18:44
 */

var config = require('../config');
var lwip = require('lwip');


exports.createDetailAndListImages = function(imgName, callback) {

    // obtain an image object:
    lwip.open(config.in_path + '/' + imgName, function(err, image){

        if (err) {
            console.log(err);

        } else {

            var inW = image.width(),
                inH = image.height(),
                imgRatio = inH / inW,
                outW = config.img_detail.width,
                outH = Math.round(outW*imgRatio);

            image.batch()
                .resize(outW, outH)
                .writeFile(config.out_path + config.img_detail.dir + '/' + imgName, function(err){

                    console.log('  ·  Image resize from:' + inW +'x' + inH + ' to: ' + image.width() + 'x' + image.height() );

                    if (err) {
                        console.log(err);

                    } else {
                        console.log('  ·  DONE and saved at:' + config.out_path + config.img_detail.dir + '/' + imgName);

                        // now resize and crop for listings:
                        var outW = config.img_list.width,
                            outH = Math.round(outW*imgRatio);

                        image.batch()
                            .resize(outW, outH)
                            .crop(outW, config.img_list.height)
                            .writeFile(config.out_path + config.img_list.dir + '/' + imgName, function(err) {

                                console.log('  ·  Image cropp to:' + config.img_list.width +'x' + config.img_list.height);

                                if (err) {
                                    console.log(err);

                                } else {
                                    console.log('  ·  DONE and saved at:' + config.out_path + config.img_list.dir + '/' + imgName);
                                    if (callback) callback();
                                }
                            });
                    }
                });
        }
    });

};
