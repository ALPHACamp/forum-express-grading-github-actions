// 管理上傳及將上傳東西暫存到temp

const multer = require('multer')
const upload = multer({ dest: 'temp/' }) // dest: 'temp/' 暫時存到temp file裡面

module.exports = upload
