const fs = require('fs');

// file 是 multer 處理完的檔案
const localFileHandler = async (file) => {
  if (!file) return null;

  try {
    const filename = `upload/${file.originalname}`;

    const data = await fs.promises.readFile(file.path);
    await fs.promises.writeFile(filename, data);
    return `/${filename}`;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  localFileHandler,
};
