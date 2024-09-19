const express = require('express')
const routes = require('./routes')

const path = require('path')

const app = express()
const port = process.env.PORT || 3000

const db = require('./db/models')

const handlebars = require('express-handlebars')

// 引入 helpers
const handlebarsHelpers = require('./helpers/handlebars-helpers')

// 註冊 Handlebars 樣板引擎，並指定副檔名為 .hbs
app.engine('.hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))

// 設定使用 Handlebars 做為樣板引擎
app.set('view engine', '.hbs')

// 啟用 body-parser
app.use(express.urlencoded({ extended: true }))

// 載入 express-session 套件
const session = require('express-session')

// 載入 connect-flash 套件
const flash = require('connect-flash')

// 載入 message
const message = require('./middlewares/messages')

// 載入 passport
const passport = require('passport')

// 設定 SESSION_SECRET 還境變數
const SESSION_SECRET = 'secret'

// 設定 session
app.use(session({ secret: SESSION_SECRET, saveUninitialized: false, resave: false }))

app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

// 載入 method-override
const methodOverride = require('method-override')

app.use(methodOverride('_method'))

app.use('/upload', express.static(path.join(__dirname, '/upload')))

app.use(message)

app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app
