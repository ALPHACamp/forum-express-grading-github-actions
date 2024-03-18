const db = require('../models')
const Restaurants = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    const categoryId = Number(req.query.categoryId) || ''

    Promise.all([
      Restaurants.findAndCountAll({
        where: {
          ...(categoryId ? { categoryId } : {})
        },
        include: Category,
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.rows.map((r) => ({
          ...r,
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch((err) => next(err))
  },
  getRestaurant: (req, res, next) => {
    const restaurantId = req.params.id
    return Restaurants.findByPk(restaurantId, {
      /*raw: true,***** 改成使用.toJSON()*/
      /*nest: true,***** 改成使用.toJSON()*/
      include: [
        Category,
        {
          model: Comment,
          include: User
        }
      ]
    })
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.increment('viewCounts', { where: { id: restaurantId } })
      })
      .then((restaurant) => {
        console.log(restaurant)
        res.render('restaurant', { restaurant: restaurant.toJSON() })
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
