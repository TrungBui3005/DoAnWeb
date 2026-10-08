const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const imageExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const uploadDirectories = {
  food: 'food-images',
  profile: 'profile-images',
};
const uploadRoot = path.join(__dirname, '../../uploads');

const saveImage = async (file, category) => {
  if (!file) return null;
  const directoryName = uploadDirectories[category];
  const extension = imageExtensions[file.mimetype];
  if (!directoryName || !extension) {
    const error = new Error('Định dạng ảnh không được hỗ trợ.');
    error.statusCode = 400;
    throw error;
  }

  const directory = path.join(uploadRoot, directoryName);
  const filename = `${crypto.randomUUID()}${extension}`;
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), file.buffer, { flag: 'wx' });
  return `/uploads/${directoryName}/${filename}`;
};

module.exports = { saveImage };
