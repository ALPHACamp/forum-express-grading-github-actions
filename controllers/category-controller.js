const { Category } = require('../models')

const categoryController = {
  getCategories: (req, res, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        res.render('admin/categories', {
          categories,
          category
        })
      })
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body // 從 req.body 拿出表單裡的資料
    if (!name) throw new Error('Category name is required!') // name 是必填，若發先是空值就會終止程式碼，並在畫面顯示錯誤提示
    return Category.create({ name })
      .then(() => {
        req.flash('success_messages', 'Category was successfully created') // 在畫面顯示成功提示
        res.redirect('/admin/categories') // 新增完成後導回後台首頁
      })
      .catch(err => next(err))
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
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category didn't exist!") // 反查，確認要刪除的類別存在，再進行下面刪除動作
        return category.destroy()
      })
      .then(() => res.redirect('/admin/categories'))
      .catch(err => next(err))
  }
}
module.exports = categoryController