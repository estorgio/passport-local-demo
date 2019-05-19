const util = require('util');
const fs = require('fs');

const unlink = util.promisify(fs.unlink);

async function deleteFile(imageFile) {
  if (imageFile && fs.existsSync(imageFile)) {
    await unlink(imageFile);
  }
}

function cleanupFiles(filePathExtractor) {
  const cleanup = async (req, res) => {
    const filePaths = filePathExtractor(req, res);

    const fileDeletionPromiseArr = filePaths.map(filePath => deleteFile(filePath));
    await Promise.all(fileDeletionPromiseArr);
  };
  return [
    async (req, res, next) => {
      await cleanup(req, res);
      next();
    },
    async (err, req, res, next) => {
      await cleanup(req, res);
      next(err);
    },
  ];
}

module.exports = cleanupFiles;
