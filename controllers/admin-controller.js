const { Restaurant } = require('../models')

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true
    })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants })
      })
      .catch(err => next(err))
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create-restaurant')
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('請輸入餐廳名字!')
    Restaurant.create({
      name,
      tel,
      address,
      openingHours,
      description
    })
      .then(() => {
        req.flash('success_messages', '新增成功!')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  }

}

module.exports = adminController
