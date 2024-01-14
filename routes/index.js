const express = require('express')
const router = express.Router()

const passport = require('../config/passport')

const admin = require('./modules/admin')

const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/admin', admin) // 導到後台 admin 路徑

router.get('/signup', userController.signUpPage) // 取得註冊頁

router.post('/signup', userController.signUp) // 使用者註冊處理

router.get('/signin', userController.signInPage) // 取得登入頁

router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn) // 登入處理

router.get('/logout', userController.logout) // 登出

router.get('/restaurants', restController.getRestaurants)

router.use('/', (req, res) => res.redirect('/restaurants')) // 設定 fallback 路由，其他路由條件都不符合時，最終會通過的路由

router.use('/', generalErrorHandler) // 錯誤訊息處理

module.exports = router
