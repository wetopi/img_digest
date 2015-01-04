/**
 * Resizer: resizes a given image to its detail and list sizes
 *
 * resizer gets files from our gridFS and stores results in AWS S3
 *
 * from 1 GridFS image we can obtain up to 3 results stored in different S3 bucket dirs:
 * s3_wetopi_bucket/list_home  -> only for main image (the first one)
 * s3_wetopi_bucket/list_store -> only for main image (the first one)
 * s3_wetopi_bucket/detail -> all images have a detail (the biggest img)
 *
 *
 * User: joan
 * Date: 18/10/14
 * Time: 18:44
 */

var debug = require('debug')('lib:resizer');
var VError = require('verror');

var config = require('../config');
var lwip = require('lwip');
var gridfs = require('./gridfs');

var AWS = require('aws-sdk');

/**
 * TODO: refactor error management
 * @param imgData
 * @param callback
 */
exports.createDetailAndListImages = function(imgData, callback) {

  // obtain an image object:
  gridfs.readFile(imgData.file_name, function(err, image) {

    if (err) {
      console.log(err);

    } else {

      var inW = image.width(),
          inH = image.height(),
          imgRatio = inH / inW,
          outW = config.img_detail.width,
          outH = Math.round(outW*imgRatio),
          imgNameOut = imgData.file_name + '.' + config.img_detail.format;


      image.batch()
          .resize(outW, outH)
          .writeFile(config.out_path + config.img_detail.dir + '/' + imgNameOut, config.img_detail.format, function(err){

            debug('· Image resize from:' + inW +'x' + inH + ' to: ' + image.width() + 'x' + image.height() );

            if (err) {
              console.log(err);

            } else {
              debug('· DONE and saved at:' + config.out_path + config.img_detail.dir + '/' + imgNameOut);


              //
              // now resize and crop for listings:
              outW = config.img_list.width;
              outH = Math.round(outW * imgRatio);
              imgNameOut = imgData.file_name + '.' + config.img_list.format;


              image.batch()
                  .resize(outW, outH)
                  .crop(outW, config.img_list.height)
                  .writeFile(config.out_path + config.img_list.dir + '/' + imgNameOut, config.img_list.format, function (err) {

                    debug('· Image cropp to:' + config.img_list.width + 'x' + config.img_list.height);

                    if (err) {
                      console.log(err);

                    } else {
                      debug('· DONE and saved at:' + config.out_path + config.img_list.dir + '/' + imgNameOut);
                      if (callback) callback();
                    }
                  });

            }
          });
    }
  });

};


/**
 * Given an image object (info pointing to a GridFs sored image)
 * read it from GridFS, create the resized images and delete it from database
 *
 * @param imgData object as defined in lib/img_data
 * @param callback a required callback function
 */
exports.createListImages = function(imgData, callback) {

  // obtain an image object:
  lwip.open(__dirname + '/../' + config.img_list.shadow_file, function(err, imageShadow) {

    if (err) throw new VError(err, 'Missing the mandatory shadow img: %s', config.img_list.shadow_file);

    debug('createListImages for ' + imgData.file_name);

    // obtain an image object:
    gridfs.readFile(imgData.file_name, function(err, gsData) {

      if (err) {
        err = new VError(err, 'Error obtaining imgData.file_name: %s', imgData.file_name);
        console.error(err.message);
        return callback(err);
      }

      lwip.open(gsData.binary, getLwipImgType(gsData.gsObject.contentType), function (err, image) {

        if (err) {
          err = new VError(err, 'Error when Lwip opens the buffer given by gsData of: %s', imgData.file_name);
          console.error(err.message);

        } else {
          var inW = image.width(),
              inH = image.height(),
              imgRatio = inH / inW,
              outW = config.img_list.width,
              outH = Math.round(outW * imgRatio),
              imgNameOut = imgData.file_name + '.' + config.img_list.format;


          gridfs.deleteFile(imgData.file_name, function() {

            image.resize(outW, outH, function (err, image) {

              debug('· Image resize from:' + inW + 'x' + inH + ' to: ' + image.width() + 'x' + image.height());

              image.crop(outW, config.img_list.height, function (err, image) {

                debug('· Image cropp to:' + config.img_list.width + 'x' + config.img_list.height);

                if (err) {
                  err = new VError(err, 'Error cropping imgData.file_name: %s', imgData.file_name);
                  console.error(err.message);
                  return callback(err);
                }


                // now paste shadow :
                debug('· Image shadow paste of:' + __dirname + '/img_resources/shadow_v2.png');

                image.paste(0, 0, imageShadow, function (err, image) {


                  image.toBuffer(config.img_list.format, function (err, buffer) {

                    if (err) {
                      err = new VError(err, 'Error on toBuffer for: %s', imgNameOut);
                      console.error(err.message);
                    } else {

                      var s3obj = new AWS.S3();

                      s3obj.putObject({
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: config.img_list.dir + '/' + imgNameOut,
                        Body: buffer
                      }, function (err) {
                        if (err)
                          console.error(err);
                        else {
                          debug('· DONE and saved at S3 as:' + process.env.AWS_S3_BUCKET + '/' + config.img_list.dir + '/' + imgNameOut);
                        }

                        return callback(err);

                      });

                    }

                  });
                });
              });
            });

          })


        }

      });
    });
  });
};


function getLwipImgType(contentType) {

  var imgType = contentType;

  switch(contentType) {
    case 'image/jpeg':
      imgType = 'jpeg';
      break;
    case 'image/png':
      imgType = 'png';
      break;
    case 'image/gif':
      imgType = 'gif';
      break;

    default:
      debug('Lwip does not support this contentType');
  }

  return imgType;

}