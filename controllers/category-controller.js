const { Category } = require('../models')
const categoryController = {
  getCategories: (req, res, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        res.render('admin/categories', { categories, category })
      })
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('類別不可為空值')
    Category.findOne({ where: { name } })
      .then(category => {
        if (category) throw new Error('Category already exists!')
        return Category.create({ name })
      })
      .then(() => {
        req.flash('success_messages', '新增成功')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  putCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('類別不可為空值')
    Category.findOne({ where: { name } })
      .then(category => {
        if (category && category.id !== Number(req.params.id)) throw new Error('category already exists')
        return Category.findByPk(req.params.id)
      })
      .then(category => {
        if (!category) throw new Error("category didn't exist")
        return category.update({
          name
        })
      })
      .then(() => {
        req.flash('success_messages', '修改成功')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("category didn't exist")
        return category.destroy()
      })
      .then(() => {
        req.flash('success_messages', '刪除成功')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}
module.exports = categoryController
