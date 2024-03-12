//const { Restaurant } = require('../models')等於下面兩行
const db = require('../models')
const Restaurants = db.Restaurant

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurants.findAll({
      raw: true
    })
      .then((restaurants) => {
        res.render('admin/restaurants', { restaurants: restaurants })
      })
      .catch((err) => next(err))
  },
  createRestaurant: (req, res, next) => {
    return res.render('admin/create-restaurant')
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    Restaurants.create({
      name: name,
      tel: tel,
      address: address,
      openingHours: openingHours,
      description: description
    })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch((err) => next(err))
  }
}

module.exports = adminController
