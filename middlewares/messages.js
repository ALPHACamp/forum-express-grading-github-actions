const { getUser } = require('../helpers/auth-helpers')

const message = (req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = getUser(req)
  next()
}

module.exports = message
