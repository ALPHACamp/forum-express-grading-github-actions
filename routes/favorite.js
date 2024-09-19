const express = require('express') // 載入 express 套件

const router = express.Router() // 建立一個獨立的路由

// 載入 user-controller
const userController = require('../controllers/user-controller')

router.post('/:restaurantId', userController.addFavorite)

router.delete('/:restaurantId', userController.removeFavorite)

module.exports = router
