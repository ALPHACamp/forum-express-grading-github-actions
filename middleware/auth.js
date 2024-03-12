const { ensureAuthenticated, getUser } = require('../helpers/auth-helpers')

//midelware*************************************************//
const authenticated = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}
//midelware*************************************************//
const authenticatedAdmin = (req, res, next) => {
  if (ensureAuthenticated(req)) {
    if (getUser(req).isAdmin) return next()
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}
module.exports = {
  authenticated,
  authenticatedAdmin
}
