const { User, Comment, Restaurant, Favorite, Like, Followship } = require('../models')
const bcrypt = require('bcryptjs')
const { localFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('驗證密碼輸入錯誤!')
    if (!req.body.name) throw new Error('請輸入名字!')
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('此信箱已被註冊!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => {
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        })
      })
      .then(() => {
        req.flash('success_messages', '帳戶註冊成功!')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '登入成功!')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    const { id } = req.params
    return User.findByPk(id, {
      include: [{ model: Comment, include: Restaurant }]
    })
      .then(user => {
        if (!user) throw new Error('沒有此使用者!')
        // 把資料toJSON()化
        user = user.toJSON()
        // 新增user屬性CommentedRestaurants存放餐廳資訊
        user.CommentedRestaurants = user.Comments && user.Comments.map(c => c.Restaurant)
        const followers = req.user && req.user.Followers
        const followings = req.user && req.user.Followings
        const favoritedRestaurants = req.user && req.user.FavoritedRestaurants
        res.render('users/profile', { user, followers, followings, favoritedRestaurants })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    const { id } = req.params
    return User.findByPk(id, { raw: true })
      .then(user => {
        res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    const { id } = req.params
    const { file } = req
    if (!name) throw new Error('請輸入名字!')
    return Promise.all([
      User.findByPk(id),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error('沒有此使用者!')
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    // 加入我的最愛之前，先做防呆:1.是否有這間餐廳 2.使用者是否有重複把餐廳加到我的最愛
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      // Favorite利用findOne使用where查詢資料。 不用加上raw:true，因為不會用到純資料。
      Favorite.findOne({
        where: {
          userId,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error('沒有此餐廳!')
        if (favorite) throw new Error('已經加到最愛餐廳了!')
        return Favorite.create({
          userId,
          restaurantId
        })
      })
      .then(() => {
        req.flash('success_messages', '成功加到最愛!')
        res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    return Favorite.findOne({
      where: {
        restaurantId,
        userId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error('沒有將此餐廳加到我的最愛!無法移除!')
        return favorite.destroy()
      })
      .then(() => {
        req.flash('success_messages', '已移除掉我的最愛!')
        res.redirect('back')
      })
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const { restaurantId } = req.params
    const userId = req.user.id
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: {
          userId,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error('沒有此餐廳!')
        if (like) throw new Error('已把這間餐廳like過了!')
        return Like.create({
          restaurantId,
          userId
        })
      })
      .then(() => {
        req.flash('success_messages', '成功like這個餐廳!')
        res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    const userId = req.user.id
    const { restaurantId } = req.params
    return Like.findOne({
      where: {
        userId,
        restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error('沒有將此餐廳加到我的最愛!無法移除!')
        return like.destroy()
      })
      .then(() => {
        req.flash('success_messages', '成功移除Like!')
        res.redirect('back')
      })
      .catch(err => next(err))
  },
  topUsers: (req, res, next) => {
    return User.findAll({
      include: { model: User, as: 'Followers' } // 取得User關聯Followers資料，撈出follower_id的資料(透過followship的fk:following_id查找的)
    })
      .then(users => {
        const result = users
          .map(user => ({
            // 展開物件user
            ...user.toJSON(), // 前面沒有放raw、nest，要加上toJSON整理格式

            // 計算這位物件user有多少個follower_id
            followerCount: user.Followers.length, // 透過Followers，userId為following_id(FK)，找出對應的follower_id

            // 確認這位登入者user的following_id = 這位物件user.id(確認有無追蹤)
            isFollowed: req.user.Followings.some(f => f.id === user.id) // 透過Followings，userId為follower_id(FK)，找出對應的following_id，所以才確認登入者user.following_id是否等於這位物件user.id
          }))
          // 排序followerCount多寡
          .sort((a, b) => b.followerCount - a.followerCount) // sort((a,b) => b-a) 排序由大到小
        return res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const userId = req.user.id
    const followingId = req.params.userId
    return Promise.all([
      User.findByPk(followingId),
      Followship.findOne({
        where: {
          followerId: userId,
          followingId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error('沒有此使用者!')
        if (followship) throw new Error('已追蹤此使用者!')
        return Followship.create({
          followerId: userId,
          followingId
        })
      })
      .then(() => {
        req.flash('success_messages', '成功追蹤此使用者!')
        res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    const userId = req.user.id
    const followingId = req.params.userId
    return Followship.findOne({
      where: {
        followerId: userId,
        followingId
      }
    })
      .then(followship => {
        if (!followship) throw new Error('沒有追蹤此使用者!')
        return followship.destroy()
      })
      .then(() => {
        req.flash('success_messages', '成功退追使用者!')
        res.redirect('back')
      })
      .catch(err => next(err))
  }
}

module.exports = userController
