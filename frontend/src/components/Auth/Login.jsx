import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api"; 
import './AuthForm.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      if (!token || !user || !user.name || !user.role || !user.email) { // ✅ email-ஐயும் சரிபார்க்கவும்
          console.error("Invalid login response structure:", res.data);
          throw new Error("Login response from server is missing data.");
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("name", user.name);
      localStorage.setItem("role", user.role);
      localStorage.setItem("email", user.email); // ✅ --- சரிசெய்யப்பட்ட வரி (email-ஐ சேமிக்கவும்) ---

      setMsg("Login Successful. Redirecting...");
      window.dispatchEvent(new Event("storage")); 

      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "access") navigate("/access");
        else navigate("/student");
      }, 1000);

    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed. Please check credentials.");
      console.error("Login Error:", err.response?.data || err.message || err); 
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fadeInUp"> 
      <form onSubmit={handle} className="auth-form-card">
        <h2 className="auth-title">Login</h2>
        <p className="auth-subtitle">Welcome back to EduPro!</p>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="form-input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="form-group password-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="form-input"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
          {loading ? <span className="spinner small"></span> : "Login Securely"}
        </button>

        {msg && (
          <div className={`alert ${msg.includes('Successful') ? 'alert-success' : 'alert-danger'}`}>
            {msg}
          </div>
        )}

        <p className="form-footer-text">
          Don't have an account yet?{" "}
          <Link to="/register" className="btn-link">Register here</Link>
        </p>
      </form>
    </div>
  );
}