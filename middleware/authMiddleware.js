const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized access" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminMiddleware = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findById(req.user.id);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};

module.exports = { authMiddleware, adminMiddleware };

