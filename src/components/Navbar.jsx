import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUser, FaGlobe } from "react-icons/fa";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [language, setLanguage] = useState("en");

  const isAuthenticated = true; // testing

  const isActive = (path) => location.pathname === path;

  const handleLanguageSwitch = (lang) => {
    setLanguage(lang);
    // getLanguage.js // 
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          testing
        </Link>
      </div>

      {isAuthenticated && (
        <>
          {/* Links (desktop) */}
          <div className="navbar-links">
            <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
              Dashboard
            </Link>
            <Link to="/add-expense" className={isActive("/add-expense") ? "active" : ""}>
              Add Expense
            </Link>
            <Link to="/statistics" className={isActive("/statistics") ? "active" : ""}>
              Statistics
            </Link>
          </div>

          {/* Right section: profile and language */}
          <div className="navbar-right">
            <div className="profile-container">
              <button
                className="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <FaUser className="icon" />
                Profile
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <Link to="/settings">Settings</Link>
                  <Link to="/auth">Logout</Link>
                </div>
              )}
            </div>

            <div className="lang-container">
              <FaGlobe className="icon" />
              <select
                className="lang-dropdown"
                value={language}
                onChange={(e) => handleLanguageSwitch(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="ro">RO</option>
              </select>
            </div>
          </div>

          {/* Hamburger (always visible on mobile) */}
          <button className="hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            ☰
          </button>

          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="mobile-menu-panel">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/add-expense">Add Expense</Link>
              <Link to="/statistics">Statistics</Link>
              <Link to="/settings">Settings</Link>
              <Link to="/auth">Logout</Link>
              <hr className="divider" />
              <div className="mobile-lang-switch">
                <span><FaGlobe className="icon" /> Language:</span>
                <button
                  onClick={() => handleLanguageSwitch("ro")}
                  className={language === "ro" ? "active-lang" : ""}
                >
                  RO
                </button>
                <button
                  onClick={() => handleLanguageSwitch("en")}
                  className={language === "en" ? "active-lang" : ""}
                >
                  EN
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!isAuthenticated && (
        <div className="navbar-right">
          <Link to="/auth" className="login-link">Login</Link>
          <div className="lang-container">
            <FaGlobe className="icon" />
            <select
              className="lang-dropdown"
              value={language}
              onChange={(e) => handleLanguageSwitch(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="ro">RO</option>
            </select>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
