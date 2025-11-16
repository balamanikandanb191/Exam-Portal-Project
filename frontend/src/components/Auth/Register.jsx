import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import api from "../../api"; 
// Import the shared CSS file
import './AuthForm.css';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const response = await api.post("/auth/register", { name, email, password, role });
      setMsg(response.data.message + " Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Registration failed.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container animate-fade-in-up">
      <form onSubmit={handle} className="auth-form-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join EduPro Today!</p>

        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input id="name" required value={name} onChange={e=>setName(e.target.value)} className="form-input" placeholder="Balamurugan S" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" required value={email} onChange={e=>setEmail(e.target.value)} type="email" className="form-input" placeholder="you@example.com" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" required value={password} onChange={e=>setPassword(e.target.value)} type="password" className="form-input" placeholder="••••••••" />
        </div>

        <div className="form-group role-group">
          <label className="form-label" htmlFor="role">Select Role</label>
          <select id="role" className="form-select" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="admin">Admin (Requires Approval)</option>
            <option value="access">Access Manager (Requires Approval)</option>
          </select>
          <p className="role-help-text">Admin/Access roles are restricted.</p>
        </div>
        
        <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
          {loading ? <span className="spinner small"></span> : "Register"}
        </button>

        {msg && (
          <div className={`alert ${msg.includes('Redirecting') ? 'alert-success' : 'alert-danger'}`}>
            {msg}
          </div>
        )}

        <p className="form-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="btn-link">Login here</Link>
        </p>
      </form>
    </div>
  );
}