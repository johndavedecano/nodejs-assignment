const auth = async (req, res, next) => {
  if (req.headers['x-api-key'] === process.env.API_KEY) {
    req.user = {};
    return next();
  }

  return res.status(401).json({ message: 'unauthorized' });
};

export default auth;
