const bcrypt = require('bcryptjs')

const { User, Restaurant, Comment, Favorite, Like, Followship } = require('../models')

const { localFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    const isAdmin = req.user?.isAdmin
    const { name, email, password, passwordCheck } = req.body
    if (!name || !email || !password) throw new Error('Please enter name, email and password!')

    if (password !== passwordCheck) throw new Error('Passwords do not match!');

    (async () => {
      try {
        if (await User.findOne({ where: { email } })) throw new Error('Email already exists!')
        await User.create({ name, email, password: await bcrypt.hash(password, 10) })
        req.flash('success', '註冊成功!')
        res.redirect(isAdmin ? '/admin/users' : '/signin')
      } catch (error) {
        next(error)
      }
    })()
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.logout(error => {
      if (error) throw new Error('Logout failed. Please try again!')
      else req.flash('success', '登出成功!')
      res.redirect('/signin')
    })
  },
  getUser: (req, res, next) => {
    return (async () => {
      try {
        const user = await User.findByPk(req.params.id, { include: { model: Comment, include: Restaurant } })
        user.dataValues.commentedRestaurants = user.toJSON().Comments
          ?.map(c => c.Restaurant).filter((item, index, self) => self.findIndex(obj => obj.id === item.id) === index)
        // user.dataValues.commentedRestaurants = user.toJSON().Comments
        //   ?.reduce((acc, c) => { if (!acc.some(r => r.id === c.restaurantId)) acc.push(c.Restaurant); return acc }, [])
        res.render('users/profile', { user: user.toJSON() })
      } catch (error) {
        next(error)
      }
    })()
  },
  editUser: (req, res, next) => {
    return (async () => {
      try {
        const user = await User.findByPk(req.params.id, { raw: true })
        res.render('users/edit', { user })
      } catch (error) {
        next(error)
      }
    })()
  },
  putUser: (req, res, next) => {
    const { file } = req
    if (+req.params.id !== req.user.id) {
      req.flash('error', 'Update failed! Insufficient permissions.')
      return res.redirect(`/users/${req.params.id}`)
    }
    if (!req.body.name) throw new Error('Please enter user name.')
    return (async () => {
      try {
        const [filePath, user] = await Promise.all([localFileHandler(file), User.findByPk(req.params.id)])
        if (!user) throw new Error("The user didn't exist!")
        await user.update({ name: req.body.name, image: filePath || user.image })
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${req.params.id}`)
      } catch (error) {
        next(error)
      }
    })()
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return (async () => {
      try {
        const [restaurant, favorite] = await Promise.all([
          Restaurant.findByPk(restaurantId),
          Favorite.findOne({ where: { userId: req.user.id, restaurantId } })
        ])
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')
        await Favorite.create({ userId: req.user.id, restaurantId })
        req.flash('success', 'this restaurant has been successfully bookmarked!')
        res.redirect('back')
      } catch (error) {
        next(error)
      }
    })()
  },
  removeFavorite: (req, res, next) => {
    return (async () => {
      try {
        const favorite = await Favorite.findOne({ where: { userId: req.user.id, restaurantId: req.params.restaurantId } })
        if (!favorite) throw new Error("You haven't favorited this restaurant")
        await favorite.destroy()
        res.redirect('back')
      } catch (error) {
        next(error)
      }
    })()
  },
  addLike: (req, res, next) => {
    const { id: userId } = req.user
    const { restaurantId } = req.params
    return (async () => {
      try {
        const [restaurant, like] = await Promise.all([
          Restaurant.findByPk(restaurantId),
          Like.findOne({ where: { userId, restaurantId } })
        ])
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (like) throw new Error('You have liked this restaurant!')
        await Like.create({ userId, restaurantId })
        req.flash('success', 'this restaurant has been successfully liked!')
        res.redirect('back')
      } catch (error) {
        next(error)
      }
    })()
  },
  removeLike: (req, res, next) => {
    const { id: userId } = req.user
    const { restaurantId } = req.params
    return (async () => {
      try {
        await Like.destroy({ where: { userId, restaurantId } })
          ? req.flash('success', 'this restaurant has been successfully unliked!')
          : req.flash('error', "You haven't liked this restaurant!")
        res.redirect('back')
      } catch (error) {
        next(error)
      }
    })()
  },
  getTopUsers: (req, res, next) => {
    (async () => {
      try {
        const userDataArr = await User.findAll({ include: { model: User, as: 'Followers' } })
        const users = userDataArr
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings?.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        res.render('top-users', { users })
      } catch (error) {
        next(error)
      }
    })()
  },
  addFollowing: (req, res, next) => {
    const { id: followerId } = req.user
    const { followingId } = req.params;
    (async () => {
      try {
        const [user, follow] = await Promise.all([
          User.findByPk(followingId),
          Followship.findOne({ where: { followerId, followingId } })
        ])
        if (!user) throw new Error("user didn't exist!")
        if (follow) throw new Error('You are already following this user!')
        await Followship.create({ followerId, followingId })
        req.flash('success', 'this user has been successfully followed!')
        res.redirect('back')
      } catch (error) {
        next(error)
      }
    })()
  },
  removeFollowing: (req, res, next) => {
    const { id: followerId } = req.user
    const { followingId } = req.params;
    (async () => {
      try {
        await Followship.destroy({ where: { followerId, followingId } })
          ? req.flash('success', 'this user has been successfully unfollowed!')
          : req.flash('error', "You haven't followed this user!")
        res.redirect('back')
      } catch (error) {
        next(error)
      }
    })()
  }
}
module.exports = userController
