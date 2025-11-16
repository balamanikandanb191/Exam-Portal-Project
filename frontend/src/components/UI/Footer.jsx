import React from "react";
import { Link } from "react-router-dom";
// Import the new CSS file
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} EduPro. All rights reserved.
        </p>
        <div className="footer-links">
          <Link to="/" className="footer-link">
            Home
          </Link>
          <Link to="/student" className="footer-link">
            Dashboard
          </Link>
          <Link to="/login" className="footer-link">
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}