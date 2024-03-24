const db = require('../models')
const Restaurant = db.Restaurant
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
      Restaurant.findAndCountAll({
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
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map((fr) => fr.id)
        const data = restaurants.rows.map((r) => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id)
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
    return Restaurant.findByPk(restaurantId, {
      /*raw: true,***** 改成使用.toJSON()*/
      /*nest: true,***** 改成使用.toJSON()*/
      include: [Category, { model: Comment, include: User }, { model: User, as: 'FavoritedUsers' }]
    })
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.increment('viewCounts', { where: { id: restaurantId } })
      })
      .then((restaurant) => {
        const isFavorited = restaurant.FavoritedUsers.some((f) => f.id === req.user.id)
        res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited })
      })
      .catch((err) => next(err))
  },
  getDashboard: (req, res, next) => {
    const restaurantId = req.params.id
    return Restaurant.findByPk(restaurantId, {
      include: [Category, { model: Comment, include: User }]
    })
      .then((restaurantData) => {
        if (!restaurantData) throw new Error("Restaurant didn't exist!")
        res.render('dashboard', { restaurant: restaurantData.toJSON() })
      })
      .catch((err) => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: Category,
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Restaurant, User],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', { restaurants, comments })
      })
      .catch((err) => next(err))
  }
}

module.exports = restaurantController
