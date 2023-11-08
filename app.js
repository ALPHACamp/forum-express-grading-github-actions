const path = require('path')
const express = require('express')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const passport = require('./config/passport')

const routes = require('./routes')
const { generalPartialsHandler } = require('./middlewares/partials-handler')
const { generalErrorHandler } = require('./middlewares/error-handler')
const handlebarsHelper = require('./helpers/handlebars-helpers')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret'
// 註冊 Handlebars 樣板引擎，並指定副檔名為 .hbs
app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelper }))
// 設定使用 Handlebars 做為樣板引擎
app.set('view engine', 'hbs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(flash()) // flash這種功能存在 session裡
app.use(methodOverride('_method')) // _method為自定義
app.use('/upload', express.static(path.join(__dirname, 'upload'))) // 以/upload開頭的才被允許訪問 而__dirname/upload 被設為根目錄

app.use(passport.initialize())
app.use(passport.session())
app.use(generalPartialsHandler)

app.use(routes)
app.use(generalErrorHandler)
app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
