const { Restaurant, Category, User, Comment } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restController = {
  getRestaurants: (req, res) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(page, limit)

    // 先從網址上拿取參數categortId，再換成Number型態
    const categoryId = Number(req.query.categoryId) || '' // 有拿取categoryId或是空字串
    Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        nest: true,
        raw: true,
        where: { ...categoryId ? { categoryId } : {} }, // 運用三元運算子判斷，回傳{categoryId}or{}然後接觸展開運算子變成...{categoryId} or ...{} ，...{categoryId} = categoryId: categoryId
        limit,
        offset
      }),
      Category.findAll({ raw: true })
    ])

      .then(([restaurants, categories]) => {
        // req.user.FavoritedRestaurants為陣列資料，將此陣列改為只存放id陣列，已可與餐廳id做比對
        const favoritedRestaurantId = req.user && req.user.FavoritedRestaurants.map(fs => fs.id)
        // restaurants為陣列，要調整裡面內容要用map修改
        const data = restaurants.rows.map(r => ({
          ...r, // 把r資料展開，...為展開運算子
          // 展開運算子後面如果有相同的key(屬性)，會以後面的為準
          // 把restaurants當中的description修改為50字以內
          description: r.description.substring(0, 50), // substring(index, index)可指定擷取幾字元至幾字元
          // 使用者已收藏餐廳的id與餐廳id做比對，回傳boolean值，以便於views利用
          isFavorite: favoritedRestaurantId.includes(r.id) // include會回傳boolean陣列
        }))
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        }) // categoryId要拿回前面給ifCond用
      })
  },
  getRestaurant: (req, res, next) => {
    const { id } = req.params
    return Restaurant.findByPk(id, {
      include: [
        Category, // 與category關聯(categoryId在R這)
        { model: Comment, include: User }, // 與Comment關聯，再從Comment關連到User
        // Rid在C那裡，所以要加上{model:C}，關連到C後，C有Uid直接用U即可
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('沒有此餐廳')
        return restaurant.increment('viewCounts')
      })
      .then((restaurant) => {
        console.log('restaurant.FavoritedUsers', restaurant.FavoritedUsers)
        // 因只要查到一筆資料比對即可，所以使用some，也因為使用一筆資料，所以使用User的FavoritedUsers即可比較有效率
        const isFavorite = restaurant.FavoritedUsers.some(f => f.id === req.user.id) // some找到一筆資料即回傳true停止程式
        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorite
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    const { id } = req.params
    return Restaurant.findByPk(id, {
      raw: true,
      include: Category,
      nest: true
    })
      .then(restaurant => {
        return res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        include: Category,
        nest: true,
        raw: true,
        order: [['createdAt', 'DESC']], // order指定排序，'指定欄位'、'排序方式'，可新增其他排序方式所以用陣列來表示
        limit: 10 // 只要10筆資料即可
      }),
      Comment.findAll({
        include: [Restaurant, User],
        nest: true,
        order: [['createdAt', 'DESC']],
        limit: 10,
        raw: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  }
}

module.exports = restController
