const db = require('../models')
const Categorys = db.Category

const categoryController = {
  getCategories: (req, res, next) => {
    Promise.all([Categorys.findAll({ raw: true }), req.params.id ? Categorys.findByPk(req.params.id, { raw: true }) : null])
      .then(([categories, category]) => {
        return res.render('admin/categories', { categories: categories, category: category })
      })
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
  },
  putCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Categorys.findByPk(req.params.id)
      .then((category) => {
        if (!category) throw new Error("Category doesn't exist!")
        return category.update({ name })
      })
      .then(() => res.redirect('/admin/categories'))
      .catch((err) => next(err))
  }
}
module.exports = categoryController
