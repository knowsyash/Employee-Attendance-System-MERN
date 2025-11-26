import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { MdOutlineAlternateEmail } from "react-icons/md";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [secretKey, setSecretKey] = useState("");
  const navigate = useNavigate();

  // Check if selected role requires secret key (super_admin removed - backend only)
  const requiresSecretKey = ["admin", "manager", "hr"].includes(role);

  const handleRegister = async (event) => {
    event.preventDefault();

    // Validate secret key if required
    if (requiresSecretKey && !secretKey) {
      alert("Secret key is required to register as " + role);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role,
        secretKey: requiresSecretKey ? secretKey : undefined,
      });
      alert("Registration Successful!");
      navigate("/");
    } catch (error) {
      alert("Registration Failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  return (
    <div>
      <div className="wrapper">
        <form onSubmit={handleRegister}>
          <h2>Register</h2>
          <div className="input-box">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <MdOutlineAlternateEmail className="icon" />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>
          <label style={{ 
            color: '#0bc5ea', 
            fontSize: '12px', 
            fontWeight: '600', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            marginBottom: '8px',
            display: 'block'
          }}>
            SELECT ROLE
          </label>
          <select 
            value={role} 
            onChange={(e) => {
              setRole(e.target.value);
              setSecretKey(""); // Clear secret key when role changes
            }}
            style={{
              backgroundColor: '#2d3748',
              color: '#ffffff'
            }}
          >
            <option value="employee" style={{ backgroundColor: '#2d3748', color: '#ffffff' }}>Employee</option>
            <option value="hr" style={{ backgroundColor: '#2d3748', color: '#ffffff' }}>HR</option>
            <option value="manager" style={{ backgroundColor: '#2d3748', color: '#ffffff' }}>Manager</option>
            <option value="admin" style={{ backgroundColor: '#2d3748', color: '#ffffff' }}>Admin</option>
            {/* Super Admin removed - can only be created from backend */}
          </select>
          
          {requiresSecretKey && (
            <div className="input-box">
              <input
                type="password"
                placeholder="Secret Key (Required for elevated roles)"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
              <FaLock className="icon" />
              <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
                A secret key is required to register as {role}
              </small>
            </div>
          )}
          
          <button type="submit">Sign Up</button>
          <div className="register-link">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
