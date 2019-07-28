const cloudinary = require('cloudinary');
const sharp = require('sharp');
const path = require('path');
const { isVolatile } = require('./volatile');

const cloudinaryFolder = process.env.CLOUDINARY_FOLDER;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(imageFile) {
  return new Promise((resolve, reject) => {
    const options = {
      folder: cloudinaryFolder,
      tags: isVolatile() ? ['volatile'] : [],
    };
    cloudinary.v2.uploader.upload(imageFile, options, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

async function minifyImage(inputImage, outputImage) {
  return sharp(inputImage)
    .resize(300, 300)
    .jpeg({
      quality: 75,
      progressive: true,
    })
    .toFile(outputImage);
}

async function uploadMiddleware(req, res, next) {
  let originalImage;
  let minifiedImage;

  try {
    if (!req.file) {
      next();
      return;
    }

    originalImage = req.file.path;
    minifiedImage = path.join(
      req.file.destination,
      `${path.parse(req.file.path).name}_converted.jpg`,
    );

    await minifyImage(originalImage, minifiedImage);
    req.file.minified = minifiedImage;

    const result = await uploadToCloudinary(minifiedImage);
    req.cloudinary = result;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = uploadMiddleware;
