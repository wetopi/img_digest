/**
 * img_data is our message model used for images
 *
 * User: joan
 * Date: 01/01/15
 * Time: 18:44
 */

/**
 * img_data object creator
 * @param options object
 * @returns {{id: string, mime: string, position: integer, applauses: integer}}
 */
exports.make = function (options) {
    return {
        id: options.id || '546a2725ddc5861759b9229c',
        mime: options.mime || 'image/jpeg',
        position: options.position || 1,
        applauses: options.applauses || 0
    };
};

