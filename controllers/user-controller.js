const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db
const { getUser } = require('../helpers/auth-helpers')
const { localFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')

        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        return res.redirect('/signin')
      })
      .catch(err => next(err))
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
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    return Promise.all([
      User.findByPk(req.params.id, {
        include: [{ model: Comment, include: Restaurant }]
      }),
      Comment.findAndCountAll({ where: { userId: req.params.id } })
    ])
      .then(([user, comments]) => {
        if (!user) throw new Error('User does not exist!')
        return res.render('users/profile', { user: user.toJSON(), commentsCount: comments.count })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    const currentUser = getUser(req)

    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('User does not exist or do not have permission!')
        if (user.id !== currentUser.id) throw new Error('User does not exist or do not have permission!')
        return res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const currentUser = getUser(req)
    const { name } = req.body
    if (!name) throw new Error('Name is required!')

    const { file } = req

    return Promise.all([
      User.findByPk(req.params.id),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error('User does not exist or do not have permission!')
        if (user.id !== currentUser.id) throw new Error('User does not exist or do not have permission!')
        return user.update({ name, image: filePath || user.image })
      })
      .then(updatedUser => {
        req.flash('success_messages', '使用者資料編輯成功')
        return res.redirect(`/users/${updatedUser.id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const userId = req.user.id
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({ where: { userId, restaurantId } })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error('Restaurant does not exist!')
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    const userId = req.user.id
    const { restaurantId } = req.params

    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({ where: { userId, restaurantId } })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error('Restaurant does not exist!')
        if (!favorite) throw new Error('You have not favorited this restaurant!')

        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const userId = req.user.id
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({ where: { userId, restaurantId } })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error('Restaurant does not exist!')
        if (like) throw new Error('You have liked this restaurant!')

        return Like.create({ userId, restaurantId })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    const userId = req.user.id
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({ where: { userId, restaurantId } })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error('Restaurant does not exist!')
        if (!like) throw new Error('You have not liked this restaurant!')

        like.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        const result = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const { userId } = req.params
    Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error('User does not exist!')
        if (followship) throw new Error('You have already following this user!')

        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    const { userId } = req.params
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error('You have not followed this user!')

        return followship.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController
