import jwt from "jsonwebtoken";

const SECRET_KEY = "santhosh123";

export const verifyToken = (req, res, next) => {
  if (!SECRET_KEY) {
    console.error("JWT_SECRET is not defined.");
    return res.status(500).json({ message: "Server configuration error." });
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided, authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); 
    req.user = decoded; 
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const roleCheck = (roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
     return res.status(401).json({ message: "Authentication required." });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Requires role: ${roles.join(' or ')}` });
  }
  next();
};