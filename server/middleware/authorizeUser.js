const authorizeUser = (req, res, next) => {
  const { userId } = req.params;

  // allow admin
  if (req.user.role === "admin") {
    return next();
  }

  if (req.user.id !== userId) {
    return res.status(403).json({
      message: "Access denied"
    });
  }

  next();
};

export default authorizeUser;
