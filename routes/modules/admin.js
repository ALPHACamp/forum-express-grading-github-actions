const express = require('express')

const upload = require('../../middlewares/multer')

const router = express.Router()

const adminController = require('../../controllers/admin-controller')

// 載入 categoryController
const categoryController = require('../../controllers/category-controller')

router.get('/restaurants/create', adminController.createRestaurant)

router.get('/restaurants/:id/edit', adminController.editRestaurant)

router.get('/restaurants/:id', adminController.getRestaurant)

router.get('/restaurants', adminController.getRestaurants)

router.get('/users', adminController.getUsers)

router.post('/restaurants', upload.single('image'), adminController.postRestaurant)

router.patch('/users/:id', adminController.patchUser)

router.put('/restaurants/:id/edit', upload.single('image'), adminController.putRestaurant)

router.delete('/restaurants/:id', adminController.deleteRestaurant)

router.get('/categories/:id/edit', categoryController.getCategories)

router.put('/categories/:id/edit', categoryController.putCategory)

router.get('/categories', categoryController.getCategories)

router.post('/categories', categoryController.postCategory)

router.delete('/categories/:id', categoryController.deleteCategory)

router.use('', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router
