import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if(!token){
    return res.status(401).json({ message: "Authentication required. Please login."});
  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();

  } catch(error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Session expired. Please log in again.",
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('[Auth] Invalid token attempt:', {
      ip: req.ip,
      path: req.path,
      error: error.message,
    });

    return res.status(401).json({
      message: "Authentication failed. Please log in again."
    })
  }

};


const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if(!token){
    return next();  // no token = guest = fine = continue
  }

 try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = {
    id:      decoded.id,
    email:   decoded.email,
    role:    decoded.role
  }
 } catch {
  // invalid token on optional route = treat as guest
 }
 next();

};


const verifyTokenWithDB = async (req, res, next) => {
  const token =  req.cookies?.token;

  if(!token){
     return res.status(401).json({ message: 'Authentication required'});
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // DB lookup confirm user still exists
    const user =  await User.findById(decoded.id)
    .select('id email role')
    .lean();

    if(!user){
      return res.status(401).json({message: 'Account no longer exists.'})
    }

    req.user = user;
    next();
  } catch (error) {
    if(error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired',
        code: 'TOKEN_EXPIRED'
      })
    }
    return res.status(401).json({ message: 'Authentication failed'});
  }
};

export { verifyToken, optionalAuth, verifyTokenWithDB };
export default verifyToken;


