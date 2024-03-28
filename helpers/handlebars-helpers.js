const dayjs = require('dayjs');

const currentYear = () => dayjs().year();

const isEqual = (a, b) => a === b;

const isRootAdmin = (email) => email === process.env.ROOT_ADMIN_EMAIL;

module.exports = {
  currentYear,
  isEqual,
  isRootAdmin,
};
