const express = require('express')
const router = express.Router()
const admin = require('./modules/admin.js')

const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')

router.use('/admin', admin)

router.get('/signup', userController.signupPage)
router.post('/signup', userController.signUp)

router.get('/restaurants', restController.getRestaurants)
router.use('/', (req, res) => {
  res.redirect('/restaurants')
})

module.exports = router
