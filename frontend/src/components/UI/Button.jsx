import React from "react";
import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  fullWidth = false,
  icon,
  iconPosition = "left"
}) => {
  const buttonClasses = `
    ui-button 
    button-${variant} 
    button-${size} 
    ${fullWidth ? "button-full-width" : ""}
    ${loading ? "button-loading" : ""}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <span className="button-spinner">
          <span className="spinner-small"></span>
        </span>
      )}
      {!loading && icon && iconPosition === "left" && (
        <span className="button-icon-left">{icon}</span>
      )}
      <span className="button-text">{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="button-icon-right">{icon}</span>
      )}
    </button>
  );
};

export default Button;

