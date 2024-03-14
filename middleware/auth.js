//const { ensureAuthenticated, getUser } = require('../helpers/auth-helpers')
const helpers = require('../helpers/auth-helpers')

//middleware*************************************************//
const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}
//middleware*************************************************//
const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) return next()
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}
module.exports = {
  authenticated,
  authenticatedAdmin
}
