module.exports = (error, req, res, next) => {
  if (error instanceof Error) { req.flash('error_messages', `${error.name}: ${error.message}`) } else {
    req.flash('error_messages', `${error}`) // 如果error不是物件，可能傳一堆錯誤報告，直接印出
  }
  res.redirect('back')
  next(error) // 正規開發會再細分錯誤類型such as 資料庫出錯、伺服器錯、網路連線等，這邊先傳下去作為伺服器錯誤的log
}
