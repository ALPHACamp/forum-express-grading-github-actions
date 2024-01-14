const fs = require('fs') // 引入 fs 模組
const localFileHandler = file => {
  // file 是 multer 處理完的檔案，以下將temp資料透過fs方法，複製一份到upload資料夾
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    const fileName = `upload/${file.originalname}` // 圖片路徑
    return fs.promises
      .readFile(file.path)
      .then(data => fs.promises.writeFile(fileName, data))
      .then(() => resolve(`/${fileName}`))
      .catch(err => reject(err))
  })
}
module.exports = {
  localFileHandler
}
