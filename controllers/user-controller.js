const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurants = db.Restaurant
const Favorite = db.Favorite
const Followship = db.Followship
const { localFileHandler } = require('../helpers/file-helpers')

/******************************************************************************** */
const userController = {
  signupPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')
    // 先確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then((hash) => {
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        })
      })
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        res.redirect('/signin')
      })
      .catch((err) => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout() //passport提供的logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    const userId = req.params.id
    return User.findByPk(userId, { include: { model: Comment, include: Restaurants } })
      .then((userData) => {
        const user = userData.toJSON()
        return res.render('users/profile', { user: user })
      })
      .catch((err) => next(err))
  },
  editUser: (req, res, next) => {
    const userId = req.params.id
    return User.findByPk(userId)
      .then((user) => {
        const userData = user.toJSON()
        return res.render('users/edit', { user: userData })
      })
      .catch((err) => next(err))
  },
  putUser: (req, res, next) => {
    if (Number(req.params.id) !== Number(req.user.id)) {
      res.redirect(`/users/${req.params.id}`)
    }
    const userId = req.params.id
    const userName = req.body.name
    const file = req.file

    return Promise.all([User.findByPk(userId), localFileHandler(file)])
      .then(([userData, filePath]) => {
        if (!userData) throw new Error("User didn't exist!")
        return userData.update({
          name: userName,
          image: filePath || userData.image
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${userId}`)
      })
      .catch((err) => next(err))
  },
  addFavorite: (req, res, next) => {
    const restaurantId = req.params.restaurantId
    const userId = req.user.id
    return Promise.all([
      Restaurants.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId,
          restaurantId
        })
      })
      .then(() => {
        req.flash('success_messages', '成功加入')
        res.redirect('back')
      })
      .catch((err) => next(err))
  },
  removeFavorite: (req, res, next) => {
    const restaurantId = req.params.restaurantId
    const userId = req.user.id
    return Favorite.findOne({
      where: {
        userId,
        restaurantId
      }
    })
      .then((favorite) => {
        if (!favorite) throw new Error("favorited didn't exist!")
        return favorite.destroy()
      })
      .then(() => {
        req.flash('success_messages', '成功刪除')
        res.redirect('back')
      })
      .catch((err) => next(err))
  },
  getTopUsers: (req, res, next) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then((users) => {
        users = users.map((user) => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: req.user.Followings.some((f) => f.id === user.id)
        }))
        users = users.sort((a, b) => b.followerCount - a.followerCount)
        res.render('top-users', { users: users })
      })
      .catch((err) => next(err))
  },
  addFollowing: (req, res, next) => {
    const { userId } = req.params
    Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error("User didn't exist!")
        if (followship) throw new Error('You are already following this user!')
        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch((err) => next(err))
  },
  removeFollowing: (req, res, next) => {
    Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        if (!followship) throw new Error("You haven't followed this user!")
        return followship.destroy()
      })
      .then(() => res.redirect('back'))
      .catch((err) => next(err))
  }
}

module.exports = userController
