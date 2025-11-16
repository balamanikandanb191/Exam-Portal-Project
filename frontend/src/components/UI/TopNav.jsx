import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx"; // ✅ GYARA: Na kara ".jsx" a nan
import './TopNav.css'; // Idhu unga puthu CSS file

// ==========================================================
// PUTHU ICONS (SVG EMOJIS) 🎨
// ==========================================================
// Naan icons ah ingaye create panren, appo easy ah use pannikalam
const IconSun = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="theme-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 002.25 2.25 2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 12z" />
  </svg>
);

const IconMoon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="theme-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 008.25-4.498z" />
  </svg>
);

const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="btn-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const IconLogin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="btn-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="btn-icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" />
  </svg>
);
// ==========================================================
// END ICONS
// ==========================================================


export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Inga logic la endha maathamum illa
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      setIsLoggedIn(!!token);
      setUserRole(role);
    };
    checkAuth();
    // Storage event listen panrom, appo auto ah update aagum
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setIsLoggedIn(false);
    setUserRole(null);
    window.dispatchEvent(new Event("storage")); // Dispatch event to update
    navigate("/");
  };

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "access") return "/access";
    if (userRole === "student") return "/student";
    return "/login"; // Fallback
  };

  return (
    // ✅ PUTHU "glass-nav" style inga add pannirukken
    <nav className="top-nav glass-nav">
      <div className="top-nav-container">
        {/* Left Section: Logo & Brand */}
        <div className="top-nav-left">
          <Link to="/" className="top-nav-logo-link">
            <span className="top-nav-logo-icon">E</span>
            <span className="top-nav-logo-text">EduPro</span>
          </Link>
        </div>

        {/* Right Section: Theme Toggle & Auth Buttons */}
        <div className="top-nav-right">
          <button onClick={toggleTheme} className="theme-toggle-button" title="Toggle theme">
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>

          {isLoggedIn ? (
            // ✅ Logged in: Puthu icon buttons
            <div className="top-nav-auth-buttons">
              <Link to={getDashboardLink()} className="top-nav-link-button">
                <IconDashboard />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="top-nav-link-button logout-button">
                <IconLogout />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            // ✅ Not logged in: Puthu icon buttons
            <div className="top-nav-auth-buttons">
              <Link to="/login" className="btn btn-secondary top-nav-login-button">
                <IconLogin />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary top-nav-register-button">
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

