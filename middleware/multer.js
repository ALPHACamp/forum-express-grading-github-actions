const multer = require('multer')
const fs = require('fs')
const path = require('path')

// 確認 temp 資料夾存在
const tempDir = path.join(__dirname, '..', 'temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir)
}

const upload = multer({ dest: tempDir })
module.exports = upload
