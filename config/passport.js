const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.User;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({
          attributes: ['id', 'email', 'password'],
          where: { email },
          raw: true,
        });
        if (!user)
          return done(
            null,
            false,
            req.flash('error_messages', 'Email or password is incorrect.')
          );

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return done(
            null,
            false,
            req.flash('error_messages', 'Email or password is incorrect.')
          );

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  let user = await User.findByPk(id);
  user = user.toJSON();
  return done(null, user);
});

module.exports = passport;
