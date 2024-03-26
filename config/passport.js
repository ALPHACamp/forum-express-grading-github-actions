const passport = require('passport')
const LocalStrategy = require('passport-local')

const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  },
  function (req, email, password, done) {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return done(null, false, req.flash('error_messages', '帳號或密碼錯誤！'))
        bcrypt.compare(password, user.password).then(valid => {
          if (!valid) return done(null, false, req.flash('error_messages', '帳號或密碼錯誤！'))
          done(null, user)
        })
      })
  }
))

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findByPk(id)
    .then(user => {
      user = user.toJSON()
      console.log(user)
      return done(null, user)
    })
})

module.exports = passport
