const authorizerUser = (req, res, next) => {
  if(!req.user) {
    return res.status(403).json({ message: " Not autehenticated "})
  }

  if(req.user.role === 'admin') {
    return next();
  }

  const { userId } = req.params;
  if(req.user.id.toString() !==  userId.toString()){
    return res.status(403).json({ message: "Access denied"});
  }

  next();
}

export default authorizerUser;