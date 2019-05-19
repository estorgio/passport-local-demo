const multer = require('multer');
const path = require('path');

const uploadDirectory = path.join(__dirname, '..', 'uploads');

function randomString(length) {
  return Array(length)
    .fill('')
    .map(() => String.fromCharCode(
      (Math.floor(Math.random() * 2) === 0
        ? 65
        : 97)
      + (Math.floor(Math.random() * 26)),
    ))
    .join('');
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

// Set storage engine
const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename(req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}_${randomString(32)}${path.extname(file.originalname)}`);
  },
});

// Init upload
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1 }, // 1Mb limit
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
