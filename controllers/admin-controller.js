const { Restaurant, User } = require('../models');
const { localFileHandler } = require('../helpers/file-helpers');

const adminController = {
  getRestaurants: async (req, res, next) => {
    try {
      const restaurants = await Restaurant.findAll({ raw: true });
      const tab = 'restaurants';

      return res.render('admin/restaurants', { restaurants, tab });
    } catch (error) {
      return next(error);
    }
  },
  getRestaurant: async (req, res, next) => {
    try {
      const id = req.params.id;

      const restaurant = await Restaurant.findByPk(id, { raw: true });
      if (!restaurant) throw new Error(`Restaurant doesn't exist.`);

      return res.render('admin/restaurant', { restaurant });
    } catch (error) {
      return next(error);
    }
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create-restaurant');
  },
  postRestaurant: async (req, res, next) => {
    try {
      const { name, tel, openingHours, address, description } = req.body;

      if (!name) throw new Error('Restaurant name is required.');

      const file = req.file; // multer 處理過的圖片會存放在 req.file
      const filePath = await localFileHandler(file);

      await Restaurant.create({
        name,
        tel,
        openingHours,
        address,
        description,
        image: filePath || null,
      });

      req.flash('success_messages', 'Restaurant was successfully created.');
      return res.redirect('/admin/restaurants');
    } catch (error) {
      return next(error);
    }
  },
  editRestaurant: async (req, res, next) => {
    try {
      const id = req.params.id;

      const restaurant = await Restaurant.findByPk(id, { raw: true });
      if (!restaurant) throw new Error(`Restaurant doesn't exist.`);

      return res.render('admin/edit-restaurant', { restaurant });
    } catch (error) {
      return next(error);
    }
  },
  putRestaurant: async (req, res, next) => {
    try {
      const id = req.params.id;
      const { name, tel, openingHours, address, description } = req.body;

      if (!name) throw new Error('Restaurant name is required.');

      const file = req.file;
      const [filePath, restaurant] = await Promise.all([
        localFileHandler(file),
        Restaurant.findByPk(id),
      ]);

      if (!restaurant) throw new Error(`Restaurant doesn't exist.`);

      await restaurant.update({
        name,
        tel,
        openingHours,
        address,
        description,
        image: filePath || restaurant.image,
      });

      req.flash('success_messages', 'Restaurant was successfully updated.');
      return res.redirect('/admin/restaurants');
    } catch (error) {
      return next(error);
    }
  },
  deleteRestaurant: async (req, res, next) => {
    try {
      const id = req.params.id;

      const restaurant = await Restaurant.findByPk(id);
      if (!restaurant) throw new Error(`Restaurant doesn't exist.`);

      await restaurant.destroy();

      req.flash('success_messages', 'Restaurant was successfully deleted.');
      return res.redirect('/admin/restaurants');
    } catch (error) {
      return next(error);
    }
  },
  getUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'is_admin'],
        raw: true,
      });
      const tab = 'users';

      return res.render('admin/users', { users, tab });
    } catch (error) {
      return next(error);
    }
  },
  patchUser: async (req, res, next) => {
    try {
      const id = req.params.id;

      const user = await User.findByPk(id);

      if (!user) throw new Error(`User doesn't exist.`);

      if (user.email === process.env.ROOT_ADMIN_EMAIL) {
        req.flash('error_messages', '禁止變更 root 權限');
        return res.redirect('back');
      }

      await user.update({ isAdmin: !user.isAdmin });

      req.flash('success_messages', `使用者權限變更成功`);
      return res.redirect('/admin/users');
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = adminController;
