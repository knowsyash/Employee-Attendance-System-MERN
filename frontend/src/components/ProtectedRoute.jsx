import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole, minRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for specific role requirement
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // Check for minimum role requirement
  if (minRole) {
    const roleHierarchy = {
      super_admin: 5,
      admin: 4,
      manager: 3,
      hr: 2,
      employee: 1,
    };
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const minRoleLevel = roleHierarchy[minRole] || 0;
    if (userRoleLevel < minRoleLevel) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

