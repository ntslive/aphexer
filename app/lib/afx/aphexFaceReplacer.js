const _ = require('underscore');
const Faced = require('faced');
const Jimp = require('jimp');
const path = require('path');

const faced = new Faced();

function AphexFace(src, sizeScale, yScale) {
    let that = this;
    let absoluteSrc = path.join(__dirname, src);

    Jimp.read(absoluteSrc, function(err, aphexFaceImage) {
        if (err) {
            throw err;
        }
        that.image = aphexFaceImage;
    });

    this.src = absoluteSrc;
    this.scaling = {
        sizeMultiplier: sizeScale,
        yMultiplier: yScale,
    };
}

const aphexFaceSrcs = [
    new AphexFace("./faces/face.png", 2, 0.05),
];

function generateRandomSkew() {
    let maxSkew = 10;
    let minSkew = 0;

    let skew = (Math.random() * (maxSkew - minSkew + 1)) - (maxSkew / 2);

    if (skew < 0) {
        skew = skew + 360;
    }

    return skew;
}

function drawAphexFace(faceLocation, aphexFace, sourceImage) {
    let aphexFaceImage = aphexFace.image.clone();

    // center point of detected face
    let centerPoint = [
        faceLocation.x + (faceLocation.width / 2),
        faceLocation.y + (faceLocation.height / 2),
    ];

    let aphexScaled = aphexFaceImage.scaleToFit(
        faceLocation.width * aphexFace.scaling.sizeMultiplier,
        faceLocation.height * aphexFace.scaling.sizeMultiplier
    );

    let aphexHeight = aphexScaled.bitmap.height;
    let aphexWidth = aphexScaled.bitmap.width;
    let aphexY = centerPoint[1] - (aphexHeight * aphexFace.scaling.yMultiplier);

    // x and y coordinates of where to write the aphex twin face
    let aphexCoords = [
        centerPoint[0] - (aphexWidth / 2),
        aphexY - (aphexHeight / 2),
    ];

    let aphexSkewed = aphexScaled.rotate(generateRandomSkew()); // slightly rotates each face so that they're slightly different

    return sourceImage.composite(
        aphexSkewed,
        aphexCoords[0],
        aphexCoords[1]
    );
}

module.exports = function(url, cb) {
    Jimp.read(url, function(err, sourceImage) {
        if (!sourceImage) {
            return cb({status:404, message: "404 Source Image not found" });
        }

        sourceImage.getBuffer(Jimp.AUTO, function(err, sourceImageBuffer) {
            // Converts source image into readable buffer.

            faced.detect(sourceImageBuffer, function(faces, matrix, file) {
                let detectionError = null;

                if (!faces || !faces.length) {
                    detectionError = { nofaces: true };
                } else {
                    console.log(`Found ${faces.length} ${faces.length > 1 ? 'faces.' : 'face.'} `);

                    _.each(faces, function(face) {
                        let randomIndex = Math.floor(Math.random() * aphexFaceSrcs.length);
                        sourceImage = drawAphexFace(face, aphexFaceSrcs[randomIndex], sourceImage);
                    });
                }

                sourceImage.getBuffer(Jimp.AUTO, function(err, aphexedImageBuffer) {
                    if (err) {
                        return cb(err);
                    }
                    cb(detectionError, aphexedImageBuffer);
                });
            });
        });
    });
};
