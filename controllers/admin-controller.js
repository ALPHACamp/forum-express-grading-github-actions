const { Restaurant } = require('../models')
const { User } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true
    })
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },
  createRestaurant: (req, res) => {
    res.render('admin/create-restaurant')
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required !')

    const { file } = req // 這邊要獲取的是req中file這個檔案 而req.body.file 獲取的是 name=file 輸入的字串

    localFileHandler(file) // 傳入req獲取的file 有無檔案邏輯已在helpers內做完
      .then(filePath => { // filePath為最後resolve的`/${fileName}`路徑字符串
        return Restaurant.create({ name, tel, address, openingHours, description, image: filePath || null })
      })

      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created') // 在畫面顯示成功提示
        res.redirect('/admin/restaurants') // 新增完成後導回後台首頁
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant did not exist!')

        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant did not exist!')

        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required !')

    const { file } = req // 這邊要獲取的是req中file這個檔案 而req.body.file 獲取的是 name=file 輸入的字串

    // 傳入req獲取的file 有無檔案邏輯已在helpers內做完
    // Promise.all([a.b]) Promise.all會把參數a,b做完 .then會收到a.b的結果 在執行 .then([a,b])
    Promise.all([
      Restaurant.findByPk(req.params.id),
      localFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error('Restaurant did not exist!')
        // 也可用Restaurant.update寫法 裡面多添加where 就好
        // image: filePath || restaurant.image 如果有編輯照片 就用新的 沒有用舊的
        return restaurant.update({ name, tel, address, openingHours, description, image: filePath || restaurant.image })
      })

      .then(() => {
        req.flash('success_messages', 'Update successfully!')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant did not exist!')
        // 也可用Restaurant.update寫法 裡面多添加where 就好
        return restaurant.destroy()
      })
      .then(() => {
        req.flash('success_messages', 'Delete successfully!')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getUsers: (req, res) => {
    User.findAll({
      raw: true
    })
      .then(users => res.render('admin/users', { users }))
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error('User did not exist!')
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
      .catch(err => next(err))
  }
}
module.exports = adminController
