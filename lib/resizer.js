/**
 * Resizer: resizes a given image to its detail and list sizes
 *
 *
 * We obtain images to process from db. Each image can have up to 3 different results stored in different S3 bucket dirs:
 * s3_wetopi_bucket/list_home  -> only main image (the first one)
 * s3_wetopi_bucket/list_store -> only main image (the first one)
 * s3_wetopi_bucket/detail# -> all images have a detail (the biggest img). We can have up to 4 detail images.
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
var db = require('./db');
var AWS = require('aws-sdk');


/**
 * resizer gets the image from our db and stores different results in AWS S3
 * depending on imgData position and applauses
 *
 * @param imgData object as defined in lib/img_data
 * @param callback a required Function(err)
 */



exports.resizeImage = function(imgData, callback) {
  obtainImageObject(imgData, function(err, image) {

    if (err) {
      callback(err);

    } else {

      resizeToDetail(image, config.img_detail, function(err, image) {
        saveToS3({image:image, imgConfig:config.img_detail, imgNameOut:imgData.id, dirSuffix:imgData.position}, function(err) {

          if (imgData.position == 1) {
            image.clone(function(err, imageListHome) {

              resizeToList(imageListHome, config.img_list_home, function(err, imageListHome) {
                saveToS3({image:imageListHome, imgConfig:config.img_list_home, imgNameOut:imgData.id}, function() {

                  resizeToList(image, config.img_list_store, function (err, image) {
                    saveToS3({image:image, imgConfig:config.img_list_store, imgNameOut:imgData.id}, callback);
                  });
                });
              });
            })

          } else {
            callback(err);
          }

        });
      });

      db.deleteFile(imgData.id, function() {
        debug('Deleted from db the image source' + imgData.id);
      });


    }

  });

};


/**
 * Get the image from our db and convert it to an image object ready to be
 * manipulated by our lwip lib
 * @param imgData object as defined in lib/img_data
 * @param callback required Function(err, image)
 */
function obtainImageObject(imgData, callback) {

  db.readFile(imgData.id, function(err, gsData) {

    if (err) {
      err = new VError(err, 'Error obtaining imgData.id: %s', imgData.id);
      console.error(err.message);
      return callback(err, null);
    }

    lwip.open(gsData.binary, getLwipImgType(gsData.gsObject.contentType), function (err, image) {

      if (err) {
        err = new VError(err, 'Error when Lwip opens the buffer given by gsData of: %s', imgData.id);
        console.error(err.message);
      }

      return callback(err, image);

    });
  });

}


/**
 * Resize image to list performs a resize, then a crop and at the end pastes a shadow.
 *
 * @param image Lwip image object
 * @param imgConfig object required with resize config params
 * @param callback required Function(err, image)
 */
function resizeToList(image, imgConfig, callback) {

  var inW = image.width(),
      inH = image.height(),
      imgRatio = inH / inW,
      outW = imgConfig.width,
      outH = Math.round(outW * imgRatio);

  debug('Resize image for: ' + imgConfig.dir);


  debug('· scale image from:' + inW + 'x' + inH + ' to: ' + image.width() + 'x' + image.height());
  image.resize(outW, outH, function (err, image) {


    debug('· crop to list height:' + imgConfig.height);
    image.crop(outW, imgConfig.height, function (err, image) {

      if (err) {
        err = new VError(err, 'Error cropping image');
        console.error(err.message);
        return callback(err, image);
      }


      debug('· paste the shadow:' + imgConfig.shadow_file);
      lwip.open(__dirname + '/../' + imgConfig.shadow_file, function(err, imageShadow) {

        if (err) throw new VError(err, 'Missing the mandatory shadow img: %s', imgConfig.shadow_file);

        image.paste(0, 0, imageShadow, function (err, image) {

          if (err) {
            err = new VError(err, 'Error pasting the shadow: %s', imgConfig.shadow_file);
            console.error(err.message);
          }

          return callback(err, image);

        });
      });

    });
  });

}



/**
 * Resize image to detail performs a resize preserving ratio.
 *
 * @param image Lwip image object
 * @param imgConfig object required with resize config params
 * @param callback required Function(err, image)
 */
function resizeToDetail(image, imgConfig, callback) {

  var inW = image.width(),
      inH = image.height(),
      imgRatio = inH / inW,
      outW = imgConfig.width,
      outH = Math.round(outW * imgRatio);

  debug('Resize image for: ' + imgConfig.dir);


  debug('· scale image from:' + inW + 'x' + inH + ' to: ' + image.width() + 'x' + image.height());
  image.resize(outW, outH, function (err, image) {

    if (err) {
      err = new VError(err, 'Error resizing the image for: %s', imgConfig.dir);
      console.error(err.message);
    }

    return callback(err, image);

  });

}


/**
 * Converts the image into a buffer and saves it to S3
 *
 * @param obj to store {image, imgConfig:{dir: string, format: string file extensions}, imgNameOut, dirSuffix}
 * @param callback required Function(err)
 */
function saveToS3(obj, callback) {

  obj.image.toBuffer(obj.imgConfig.format, {quality: obj.imgConfig.quality},  function (err, buffer) {

    var s3obj = new AWS.S3(),
        s3File= obj.imgConfig.dir + (obj.dirSuffix || '') + '/' + obj.imgNameOut + '.' + obj.imgConfig.format;

    if (err) {
      err = new VError(err, 'Error on toBuffer for: %s', obj.imgNameOut);
      console.error(err.message);
      return callback(err);
    }

    s3obj.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3File,
      Body: buffer
    }, function (err) {

      debug('· Saved to S3 as:' + process.env.AWS_S3_BUCKET + '/' + s3File);
      if (err) console.error(err);

      return callback(err);

    });

  });
}






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