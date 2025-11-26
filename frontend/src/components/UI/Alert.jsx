import React, { useState, useEffect } from "react";
import "./Alert.css";

const Alert = ({ 
  type = "info", 
  message, 
  onClose, 
  autoClose = false,
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Wait for fade out animation
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`alert alert-${type} ${!isVisible ? "alert-hiding" : ""}`}>
      <div className="alert-content">
        <span className="alert-message">{message}</span>
        {onClose && (
          <button className="alert-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;

