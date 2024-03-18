const db = require('../models')
const Restaurants = db.Restaurant
const Category = db.Category

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const categoryId = Number(req.query.categoryId) || ''
    Promise.all([
      Restaurants.findAll({
        where: {
          ...(categoryId ? { categoryId } : {})
        },
        include: Category,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.map((r) => ({
          ...r,
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId
        })
      })
      .catch((err) => next(err))
  },
  getRestaurant: (req, res, next) => {
    const restaurantId = req.params.id
    return Restaurants.findByPk(restaurantId)
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return Restaurants.increment('viewCounts', { where: { id: restaurantId } })
      })
      .then(() => {
        return Restaurants.findByPk(restaurantId, {
          raw: true,
          nest: true,
          include: [Category]
        })
      })
      .then((restaurant) => {
        res.render('restaurant', { restaurant: restaurant })
      })
      .catch((err) => next(err))
  },
  getDashboard: (req, res, next) => {
    const restaurantId = req.params.id
    return Restaurants.findByPk(restaurantId, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('dashboard', { restaurant: restaurant })
      })
      .catch((err) => next(err))
  }
}

module.exports = restaurantController
