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
 * @returns {{userId: string, filename: string, position: integer, applauses: integer, userId: date, mime: mime_type}}
 */
exports.make = function (options) {
    return {
        userId: options.userId || '546a2725ddc5861759b9229c',
        filename: options.filename || '546a2725ddc5861759b9229c',
        mime: options.mime || 'image/jpeg',
        position: options.position || 1,
        applauses: options.applauses || 0,
        uploadDate: ISODateString(new Date())
    };
};



/**
 * @return {string}
 */
function ISODateString(d) {
    function pad(n){
        return n > 10 ? '0'+n : n;
    }
    return d.getUTCFullYear()+'-'
        + pad(d.getUTCMonth()+1)+'-'
        + pad(d.getUTCDate())+'T'
        + pad(d.getUTCHours())+':'
        + pad(d.getUTCMinutes())+':'
        + pad(d.getUTCSeconds())+'Z';
}




