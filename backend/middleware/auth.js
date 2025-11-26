// Legacy middleware for backward compatibility
const { verifyToken, requireRole, requireMinRole } = require("./rbac");

const verifyAdmin = requireRole("admin", "super_admin");

module.exports = { 
  verifyAdmin,
  verifyToken,
  requireRole,
  requireMinRole,
};
