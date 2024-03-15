//const { Restaurant } = require('../models')等於下面兩行
const db = require('../models')
const Restaurants = db.Restaurant
const User = db.User
const Category = db.Category
const { localFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurants.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then((restaurants) => {
        res.render('admin/restaurants', { restaurants: restaurants })
      })
      .catch((err) => next(err))
  },
  createRestaurant: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then((categories) => res.render('admin/create-restaurant', { categories }))
      .catch((err) => next(err))
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    const { file } = req

    if (!name) throw new Error('Restaurant name is required!')

    localFileHandler(file)
      .then((filePath) => {
        Restaurants.create({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
          categoryId
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch((err) => next(err))
  },
  getRestaurant: (req, res, next) => {
    const restaurantId = req.params.id
    Restaurants.findByPk(restaurantId, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('admin/restaurant', { restaurant: restaurant })
      })
      .catch((err) => next(err))
  },
  editRestaurant: (req, res, next) => {
    Promise.all([Restaurants.findByPk(req.params.id, { raw: true }), Category.findAll({ raw: true })])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant doesn't exist!")
        return res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch((err) => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    const restaurantId = req.params.id
    const { file } = req
    if (!name) throw new Error('Restaurant name is required!')
    /*****等全部的promise完成→ 查資料表 + file-helper 處理 → 都完成後才執行下面的.then*********/
    Promise.all([Restaurants.findByPk(restaurantId), localFileHandler(file)])
      /*.then同時擁有上面每一個promise物件的陣列*********/
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name: name,
          tel: tel,
          address: address,
          openingHours: openingHours,
          description: description,
          image: filePath || restaurant.image,
          categoryId: categoryId
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch((err) => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    const restaurantId = req.params.id
    return Restaurants.findByPk(restaurantId)
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch((err) => next(err))
  },
  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true
    })
      .then((users) => {
        res.render('admin/users', { users: users })
      })
      .catch((err) => next(err))
  },
  patchUser: (req, res, next) => {
    const id = req.params.id
    return User.findByPk(id)
      .then((user) => {
        if (!user) throw new Error("User didn't exist!")
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }
        return user.update({
          isAdmin: !user.isAdmin
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        return res.redirect('/admin/users')
      })
      .catch((err) => next(err))
  }
}

module.exports = adminController
