const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStrategy = require('passport-local')

const { User } = require('../models')

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    (email, password, done) => {
      (async () => {
        try {
          const user = await User.findOne({
            attributes: ['id', 'name', 'email', 'password'],
            where: { email },
            raw: true
          })
          return user
            ? (await bcrypt.compare(password, user.password))
                ? done(null, user)
                : done(null, false, {
                  type: 'error', // 此行可省略，因為 type 預設名稱即為 error
                  message: 'email 或密碼錯誤'
                })
            : done(null, false, { message: 'email 或密碼錯誤' })
        } catch (error) {
          console.log(error)
          done(error)
        }
      })()
    // (req, username, password, done) => {
    //   User.findOne({ where: { email: username } })
    //     .then(user => {
    //       if (!user) return done(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))
    //       bcrypt.compare(password, user.password)
    //         .then(res => {
    //           if (!res) return done(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))
    //           return done(null, user)
    //         })
    //     })
    }
  )
)

passport.serializeUser((user, done) => {
  const { id } = user
  done(null, id)
})

passport.deserializeUser((id, done) => {
  (async () => {
    try {
      const user = await User.findByPk(id, { raw: true })
      done(null, user)
    } catch (error) {
      done(error)
    }
  })()
})

module.exports = passport
