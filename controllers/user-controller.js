const db = require('../models')
const { User } = db
const bcrypt = require('bcryptjs')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    // 當拋出一個Error時 js會自動跳出原本的function
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')

        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash =>
        // User.create 加上前後{} 就需加上return 需要取用他的值 如沒有用{} 也是有用return只是省略而已
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        }))
      .then(() => {
        req.flash('success_messages', '註冊成功!')
        res.redirect('/signin')
      })
      // 傳遞給Express內建的 Error Handler
      .catch(error => next(error))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '登入成功')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logout() // passport 提供的功能 => 刪除這個id對應的session清除掉 => 登出
    res.redirect('/signin')
  }
}

module.exports = userController
