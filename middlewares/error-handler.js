const errHandler = {
  generalError: (err, req, res, next) => {
    console.log('進入錯誤 middleware!!')
    if (err instanceof Error) {
      req.flash('error_messages', `${err.name}: ${err.message}`)
    } else {
      req.flash('error_messages', `${err}`)
    }

    if (err.message === 'Restaurant not found') {
      res.redirect('/restaurants')
    } else if (err.message === '資料庫查找錯誤!!') {
      res.redirect('/admin/restaurants')
    } else if (err.message === '無法修改他人帳號!') {
      res.redirect(`/users/${req.user.id}`)
    } else {
      res.redirect('back')
    }

    next(err)
  }
}

module.exports = errHandler
