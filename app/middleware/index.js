const Jimp = require('jimp');
const URL = require('url').URL;

const aphexer = require('../lib/afx/aphexFaceReplacer.js');

module.exports.parseUri = function(urlString) {
    try {
        return new URL(urlString).href;
    } catch(e) {
        console.log('Unable to parseUri');
    }
}

module.exports.aphexImage = function(req, res, imageLocation) {
    aphexer(imageLocation, function(err, response) {
        if (err && !err.nofaces) {
            console.error("Error aphexing.", err);
            return res.status(err.status || 500).send('Error!');
        }

        if (err && err.nofaces) {
            console.log("No faces found");
        } else {
            console.log("Success aphexing");
        }

        res.writeHead(200, {
            'Content-Type': req.mimeType,
            'Content-Length': response ? response.length : 0,
        });
        res.end(response, 'binary');
    });
};

module.exports.mimeType = function(fileName) {
    if (fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) {
        return Jimp.MIME_JPEG;
    } else if (fileName.endsWith('.png')) {
        return Jimp.MIME_PNG;
    }
};
