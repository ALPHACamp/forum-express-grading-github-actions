const express = require('express')
const router = express.Router()
const adminController = require('../../../forum-copy/controllers/admin-controller')
const upload = require('../../../forum-copy/middleware/multer')
router.get('/restaurants', adminController.getRestaurants)
router.get(
  '/restaurants/create',
  adminController.createRestaurant
)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.use('/', (req, res) => {
  res.redirect('admin/restaurants')
})

module.exports = router
