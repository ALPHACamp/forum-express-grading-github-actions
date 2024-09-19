const express = require('express')

const router = express.Router()

const upload = require('../middlewares/multer')

const userController = require('../controllers/user-controller') // 載入 user controller

router.get('/top', userController.getTopUsers)

router.get('/:id', userController.getUser)

router.get('/:id/edit', userController.editUser)

router.put('/:id', upload.single('image'), userController.putUser)

module.exports = router
