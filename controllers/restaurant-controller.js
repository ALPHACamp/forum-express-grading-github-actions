const db = require('../models')
const Restaurants = db.Restaurant
const Category = db.Category

const restaurantController = {
  getRestaurants: (req, res, next) => {
    Restaurants.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then((restaurants) => {
        const data = restaurants.map((r) => ({
          ...r,
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', { restaurants: data })
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
        return res.render('restaurant', { restaurant: restaurant })
      })
      .catch((err) => next(err))
  }
}
module.exports = restaurantController
