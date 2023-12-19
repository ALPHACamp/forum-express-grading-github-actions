const bcrypt = require('bcryptjs')

const { User } = require('../models')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    const isAdmin = req.user?.isAdmin
    const { name, email, password, passwordCheck } = req.body
    if (!name || !email || !password) throw new Error('Please enter name, email and password!')

    if (password !== passwordCheck) throw new Error('Passwords do not match!');

    (async () => {
      try {
        if (await User.findOne({ where: { email } })) throw new Error('Email already exists!')
        await User.create({ name, email, password: await bcrypt.hash(password, 10) })
        req.flash('success', '註冊成功!')
        res.redirect(isAdmin ? '/admin/users' : '/signin')
      } catch (error) {
        next(error)
      }
    })()
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res, next) => {
    req.logout(error => {
      if (error) throw new Error('Logout failed. Please try again!')
      else req.flash('success', '登出成功!')
      res.redirect('/signin')
    })
  }
}
module.exports = userController
