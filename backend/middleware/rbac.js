const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Role hierarchy: super_admin > admin > manager > hr > employee
const roleHierarchy = {
  super_admin: 5,
  admin: 4,
  manager: 3,
  hr: 2,
  employee: 1,
};

// Verify token and attach user to request
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided. Authorization denied." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Check if user has minimum required role level
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}` 
      });
    }

    next();
  };
};

// Check if user has role equal or higher than required
const requireMinRole = (minRole) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const minRoleLevel = roleHierarchy[minRole] || 0;

    if (userRoleLevel < minRoleLevel) {
      return res.status(403).json({ 
        message: `Access denied. Minimum required role: ${minRole}` 
      });
    }

    next();
  };
};

// Check if user can manage target user (self or lower role)
const canManageUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id || req.params.userId || req.body.userId;
    const userRole = req.user.role;
    const userClassroom = req.user.classroom;
    
    if (!targetUserId) {
      return res.status(400).json({ message: "User ID required." });
    }

    // Super admin can manage anyone
    if (userRole === "super_admin") {
      return next();
    }

    // Users can manage themselves
    if (targetUserId.toString() === req.user._id.toString()) {
      return next();
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found." });
    }

    // Check classroom access for same-level roles
    if (userRole === "admin" && userClassroom) {
      // Admins can only manage users in their classroom
      if (targetUser.classroom !== userClassroom) {
        return res.status(403).json({ 
          message: "You can only manage users in your classroom." 
        });
      }
    }

    const userRoleLevel = roleHierarchy[userRole] || 0;
    const targetRoleLevel = roleHierarchy[targetUser.role] || 0;

    // Can only manage users with lower or equal role
    if (userRoleLevel >= targetRoleLevel) {
      return next();
    }

    res.status(403).json({ message: "You don't have permission to manage this user." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  verifyToken,
  requireRole,
  requireMinRole,
  canManageUser,
  roleHierarchy,
};

