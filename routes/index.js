const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const admin = require('./modules/admin')
const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const commentController = require('../controllers/comment-controller')

const { authenticated, authenticatedAdmin } = require('../middlewares/auth')

const upload = require('../middlewares/multer')

router.use('/admin', authenticatedAdmin, admin) // 檢查admin權限

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true
}), userController.signIn)

router.get('/logout', userController.logout)

router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/', (req, res) => res.redirect('/restaurants')) // 設定 fallback路由 如都匹配不到就會執行這行  如果想甚麼都沒匹配到然後導入/restaurants 把get 更改成 use

router.delete('/comments/:id', authenticated, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)

module.exports = router
