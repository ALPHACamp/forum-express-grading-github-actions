const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')

const imgurClientId = '205d9ccedcd3c18' // 從 Imgur API 獲取的 Client ID

const imgurFileHandler = file => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)

    const form = new FormData()
    form.append('image', fs.createReadStream(file.path)) // 讀取上傳的圖片檔案

    axios.post('https://api.imgur.com/3/image', form, {
      headers: {
        Authorization: `Client-ID ${imgurClientId}`,
        ...form.getHeaders() // 確保請求標頭包含表單數據
      }
    })
      .then(response => {
        const { link } = response.data.data // 從 Imgur API 回傳的結果中取得圖片 URL
        resolve(link) // 返回圖片的 URL
      })
      .catch(err => {
        reject(err) // 處理上傳過程中的錯誤
      })
  })
}

module.exports = {
  imgurFileHandler
}
