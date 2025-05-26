const jwt = require("jsonwebtoken");
// isLoggedIn checkAuth 'Bearer token'
const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized, Invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) {
      return res
        .status(401)
        .json({ message: "Unauthorized to perform action" });
    }
    req.user = {
      email: payload.email,
      role: payload.role,
      userId: payload.userId,
    };
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Authentication Failed" });
  }
};

// have the required permissions

const requirePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to access this route" });
    }
    next();
  };
};

module.exports = { isLoggedIn, requirePermissions };
