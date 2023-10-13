const express = require('express')
const passport = require('../config/passport')

const admin = require('./modules/admin')
const userController = require('../controllers/user-controller');

const { authenticatedAdmin } = require('../middleware/auth')
const router = express.Router()

router.use('/admin', authenticatedAdmin, admin)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true
}), userController.singIn)
router.get('/logout', userController.logout)

module.exports = router
