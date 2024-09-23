const { Category } = require('../models/')
const categoryController = {
  getCategories: (req, res, next) => {
    console.log('req.params.id:' + req.params.id)
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        // console.log('categories:' + JSON.stringify(categories, null, 2))
        console.log('category:' + JSON.stringify(category, null, 2))
        res.render('admin/categories', {
          categories,
          category
        })
      })
      .catch(error => next(error))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.create({ name }).then(() => {
      req.flash('success_message', 'Category創建成功')
      res.redirect('/admin/categories')
    }).catch(error => next(error))
  },
  putCategory: (req, res, next) => {
    const { name } = req.body

    if (!name) throw new Error('Category name is required!')

    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exist!")

        return category.update({ name })
      })
      .then(() => res.redirect('/admin/categories'))
      .catch(error => next(error))
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category didn't exist!")

        return category.destroy()
      })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  }
}

module.exports = categoryController
