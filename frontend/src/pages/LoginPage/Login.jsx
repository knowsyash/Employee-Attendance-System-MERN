import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { FaLock } from "react-icons/fa";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      login(data.token, data.refreshToken, data.user);
      
      // Redirect based on role
      if (data.user.role === "super_admin") {
        navigate("/super-admin");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "manager") {
        navigate("/manager");
      } else if (data.user.role === "hr") {
        navigate("/hr");
      } else {
        navigate("/");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid credentials";
      alert(message);
    }
  };

  return (
    <div>
      <div className="wrapper">
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <MdOutlineAlternateEmail className="icon" />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>
          <div className="remember-forgot">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit">Sign In</button>
          <div className="register-link">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
