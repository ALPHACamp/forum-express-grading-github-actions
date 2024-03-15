const db = require('../models')
const Categorys = db.Category

const categoryController = {
  getCategories: (req, res, next) => {
    return Categorys.findAll({
      raw: true
    })
      .then((categories) => res.render('admin/categories', { categories }))
      .catch((err) => next(err))
  },
  postCategory: (req, res, next) => {
    const { newCategory } = req.body
    if (!newCategory) throw new Error('Category name is required!')
    return Categorys.findOne({
      where: { name: newCategory },
      raw: true
    })
      .then((category) => {
        if (category) throw new Error('Category already exists!')
        return Categorys.create({
          name: newCategory
        })
      })
      .then(() => {
        req.flash('success_messages', '成功新增類別！')
        return res.redirect('/admin/categories')
      })
      .catch((err) => next(err))
  }
}
module.exports = categoryController
