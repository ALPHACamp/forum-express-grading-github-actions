const express = require('express')
const router = express.Router()

const adminController = require('../../controllers/admin-controller')

const upload = require('../../middlewares/multer')

router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant) // upload.single('內填入要上傳的name名稱')
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)

router.use('/', (req, res) => res.redirect('/admin/restaurants')) // 設定 fallback路由 如都匹配不到就會執行這行

module.exports = router
