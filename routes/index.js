const express = require('express')
const router = express.Router()

// 載入 admin
const admin = require('./modules/admin')

// 載入 user
const user = require('./user')

// 載入 favorite
const favorite = require('./favorite')

// 載入 like
const like = require('./like')

// 載入 restaurant-controller
const restController = require('../controllers/restaurant-controller')

// 載入 user-controller
const userController = require('../controllers/user-controller')

// 載入 comment-controller
const commentController = require('../controllers/comment-controller')

// 載入 authenticated、authenticatedAdmin 狀態
const { authenticated: auth, authenticatedAdmin: authAdmin } = require('../middlewares/auth')

// 載入錯誤 message
const errMessage = require('../middlewares/error-handler')

// 引入設定好的 passport
const passport = require('../config/passport')

router.use('/admin', authAdmin, admin)

router.use('/users', auth, user) // user 路由

router.use('/favorite', auth, favorite)

router.use('/like', auth, like) // like 路由

router.get('/signup', userController.signUpPage)

router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)

router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/logout', userController.signOut)

router.get('/restaurants/top', auth, restController.getTopRestaurants)

router.get('/restaurants/feeds', auth, restController.getFeeds)

router.get('/restaurants/:id/dashboard', auth, restController.getDashboard)

router.get('/restaurants/:id', auth, restController.getRestaurant)

router.get('/restaurants', auth, restController.getRestaurants)

router.post('/comments', auth, commentController.postComment) // 建立評論路由

router.delete('/comments/:id', authAdmin, commentController.deleteComment) // 刪除評論路由

router.post('/following/:userId', auth, userController.addFollowing) // 追蹤使用者

router.delete('/following/:userId', auth, userController.removeFollowing)

// 若匹配不到路由，最後進到從導向路由
router.use('/', (req, res) => res.redirect('/restaurants'))

router.use(errMessage.generalError)

module.exports = router
