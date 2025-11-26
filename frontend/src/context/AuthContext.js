import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          
          // Try to get fresh user data (silently, no error alerts)
          try {
            const response = await axios.get("http://localhost:5000/api/auth/me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
          } catch (err) {
            // If token expired, try refresh (silently)
            if (refreshToken && err.response?.status === 401) {
              try {
                const refreshResponse = await axios.post("http://localhost:5000/api/auth/refresh", {
                  refreshToken
                });
                localStorage.setItem("token", refreshResponse.data.token);
                const newDecoded = jwtDecode(refreshResponse.data.token);
                setUser(newDecoded);
              } catch (refreshErr) {
                // Silently clear invalid tokens
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                setUser(null);
              }
            } else {
              // Fallback to decoded token (silently)
              setUser(decoded);
            }
          }
        } catch (error) {
          // Silently handle invalid token during initialization
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token, refreshToken, userData) => {
    localStorage.setItem("token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (userData) {
      setUser(userData);
    } else {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const hasMinRole = (minRole) => {
    if (!user) return false;
    const roleHierarchy = {
      super_admin: 5,
      admin: 4,
      manager: 3,
      hr: 2,
      employee: 1,
    };
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const minRoleLevel = roleHierarchy[minRole] || 0;
    return userRoleLevel >= minRoleLevel;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      login, 
      logout, 
      updateUser,
      hasRole,
      hasMinRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
