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
  }
}

module.exports = adminController
