const { Category } = require('../db/models')

const categoryController = {
  getCategories: (req, res, next) => {
    const { id } = req.params

    return Promise.all([
      Category.findAll({ raw: true }),
      id ? Category.findByPk(id, { raw: true }) : null
    ])
      .then(([categories, category]) => res.render('admin/categories', { category, categories }))
      .catch(err => next(err))
  },

  postCategory: (req, res, next) => {
    const { name } = req.body

    if (!name) throw new Error('請輸入名稱!')

    Category.create({ name })
      .then(() => {
        req.flash('success_messages', '分類建立成功')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },

  putCategory: (req, res, next) => {
    const { id } = req.params
    const { name } = req.body

    if (!name) throw new Error('名稱不得為空!')

    return Category.findByPk(id)
      .then(category => {
        if (!category) throw new Error('分類不存在!')
        return category.update({ name })
      })
      .then(() => {
        req.flash('success_messages', '分類修改成功')
        return res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },

  deleteCategory: (req, res, next) => {
    const { id } = req.params

    Category.findByPk(id)
      .then(category => {
        if (!category) throw new Error('分類不存在!')

        return category.destroy()
      })
      .then(() => {
        req.flash('success_messages', '分類刪除成功!')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}

module.exports = categoryController
