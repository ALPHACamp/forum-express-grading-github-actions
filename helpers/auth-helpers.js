const getUser = (req) => {
  return req.user || null;
};

const authenticate = (req) => {
  return req.isAuthenticated();
};

module.exports = {
  getUser,
  authenticate,
};
