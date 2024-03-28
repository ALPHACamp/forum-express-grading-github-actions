const path = require('path');

const express = require('express');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');
const flash = require('connect-flash');

const handlebarsHelpers = require('./helpers/handlebars-helpers');
const { generalMessageHandler } = require('./middlewares/message-handler');
const { generalErrorHandler } = require('./middlewares/error-handler');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.NODE_ENV) {
  console.log(
    `'process.env.NODE_ENV' is not defined. It will be set as 'development'`
  );
  process.env.NODE_ENV = 'development';
}
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }));
app.set('view engine', 'hbs');

app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: process.env.SESSION_RE_SAVE,
    saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(generalMessageHandler);
app.use(routes);
app.use(generalErrorHandler);

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`);
});

module.exports = app;
