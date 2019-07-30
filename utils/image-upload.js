const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary');
const intoStream = require('into-stream');
const { isVolatile } = require('../utils/volatile');

const cloudinaryFolder = process.env.CLOUDINARY_FOLDER;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const options = {
      folder: cloudinaryFolder,
      tags: isVolatile() ? ['volatile'] : [],
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    };
    const stream = cloudinary.v2.uploader.upload_stream(
      options,
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      },
    );
    intoStream(buffer).pipe(stream);
  });
}

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check the extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check the mime type
  const mimetype = filetypes.test(file.mimetype);

  if (!mimetype || !extname) {
    const err = new Error('Only images are allowed (JPG, PNG, and GIF)');
    err.name = 'NOTIMAGE';
    return cb(err);
  }

  return cb(null, true);
}

// Init upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1 }, // 1Mb limit
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

async function minifyImage(buffer) {
  return sharp(buffer)
    .resize(300, 300)
    .jpeg({
      quality: 75,
      progressive: true,
    })
    .toBuffer();
}

function startUpload(req) {
  return async () => {
    if (!req.file) return null;
    const { buffer } = req.file;
    const minified = await minifyImage(buffer);
    const result = await uploadToCloudinary(minified);
    return result;
  };
}

function uploadSingle(fieldname) {
  return [
    upload.single(fieldname),
    (req, res, next) => {
      req.startUpload = startUpload(req);
      next();
    },
  ];
}

module.exports = {
  single: uploadSingle,
};
