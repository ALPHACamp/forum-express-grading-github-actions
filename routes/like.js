const express = require('express')

const userController = require('../controllers/user-controller')

const router = express.Router()

router.post('/:restaurantId', userController.addLike)

router.delete('/:restaurantId', userController.removeLike)

module.exports = router
