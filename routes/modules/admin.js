const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/multer');
const adminController = require('../../controllers/admin-controller');

router.get('/restaurants/create', adminController.createRestaurant);

router.get('/restaurants/:id/edit', adminController.editRestaurant);

router.get('/restaurants/:id', adminController.getRestaurant);

router.get('/restaurants', adminController.getRestaurants);

router.get('/users', adminController.getUsers);

// 若 multer 遇到 request 裡有圖片檔案
// 就會自動把檔案複製到 temp 資料夾

router.post(
  '/restaurants',
  upload.single('image'),
  adminController.postRestaurant
);

router.put(
  '/restaurants/:id',
  upload.single('image'),
  adminController.putRestaurant
);

router.patch('/users/:id', adminController.patchUser);

router.delete('/restaurants/:id', adminController.deleteRestaurant);

router.use('/', (req, res) => res.redirect('/admin/restaurants'));

module.exports = router;
