/**
 * img_data is our message model used for images
 *
 * User: joan
 * Date: 01/01/15
 * Time: 18:44
 */


exports.make = function (username, fileName, applauses, mimeType) {
    return {
        userid: username,
        file_name: fileName,
        applauses: applauses,
        uploaded: ISODateString(new Date()),
        mime: mimeType
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




