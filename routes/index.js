const express = require('express')
const router = express.Router()
const admin = require('./modules/admin.js')
const restController = require('../controllers/restaurant-controller.js')
const userController = require('../controllers/user-controller.js')
const generalErrorHandler = require('../middleware/error-handler.js')
const passport = require('../config/passport')
const { authenticated, authenticatedAdmin } = require('../middleware/auth.js')
const commentController = require('../controllers/comment-controller')
const upload = require('../middleware/multer')

router.use('/admin', authenticatedAdmin, admin)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.get('/users/:id', userController.getUser)
router.get('/users/:id/edit', userController.editUser)
router.put('/users/:id', upload.single('image'), userController.putUser)
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }),
  userController.signIn
)
router.post('/logout', userController.logout)
router.get("/restaurants/feeds", authenticated, restController.getFeeds);
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)
router.use('/', (req, res) => {
  res.redirect('/restaurants')
})
router.use(generalErrorHandler)

module.exports = router
