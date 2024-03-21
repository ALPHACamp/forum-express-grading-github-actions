const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const { localFileHandler } = require('../helpers/file-helpers')

/******************************************************************************** */
const userController = {
  signupPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')
    // 先確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then((hash) => {
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        })
      })
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        res.redirect('/signin')
      })
      .catch((err) => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout() //passport提供的logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    const userId = req.params.id
    return User.findByPk(userId)
      .then((user) => {
        const userData = user.toJSON()
        return res.render('users/profile', { userData: userData })
      })
      .catch((err) => next(err))
  },
  editUser: (req, res, next) => {
    const userId = req.params.id
    return User.findByPk(userId)
      .then((user) => {
        const userData = user.toJSON()
        return res.render('users/edit', { userData: userData })
      })
      .catch((err) => next(err))
  },
  putUser: (req, res, next) => {
    const restaurantId = req.params.id
    const userName = req.body.name
    const file = req.file

    Promise.all([User.findByPk(restaurantId), localFileHandler(file)])
      .then(([userData, filePath]) => {
        return userData.update({
          name: userName,
          image: filePath || userData.image
        })
      })
      .then(() => {
        req.flash('success_messages', 'User was successfully to update')
        res.redirect(`/users/${restaurantId}`)
      })
      .catch((err) => next(err))
  }
}

module.exports = userController
