const multer = require('multer');

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!imageTypes.has(file.mimetype)) {
      const error = new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.');
      error.statusCode = 400;
      callback(error);
      return;
    }
    callback(null, true);
  },
});

const singleImage = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 400;
      error.message = 'Ảnh không được vượt quá 5 MB.';
    }
    next(error);
  });
};

module.exports = { singleImage };
