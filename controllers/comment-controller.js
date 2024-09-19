const { Comment, User, Restaurant } = require('../db/models')

const commentController = {
  postComment: (req, res, next) => {
    const { restaurantId, text } = req.body // 取得 form 表單的資料
    const userId = req.user.id // 取得 user id

    if (!text) throw new Error('Comment text is required!') // 檢查是否輸入評論

    // 這裡的 Promise.all() 是為了後續檢查 user 和 restaurant 是否存在
    Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error("User didn't exist!") // 檢查 user 是否存在
        if (!restaurant) throw new Error("Restaurant didn't exist!") // 檢查 restaurant 是否存在

        return Comment.create({ text, userId, restaurantId })
      })
      .then(() => {
        req.flash('success_messages', '成功留言!')
        res.redirect(`/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  },

  deleteComment: (req, res, next) => {
    const { id } = req.params

    return Comment.findByPk(id, { include: Restaurant })
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")

        return comment.destroy()
      })
      .then(deletedComment => {
        req.flash('error_messages', '成功刪除留言!')
        res.redirect(`/restaurants/${deletedComment.restaurantId}`)
      })
      .catch(err => next(err))
  }
}

module.exports = commentController
