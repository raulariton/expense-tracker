import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUser, FaGlobe } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Navbar.css";
import { AuthContext } from "../App.jsx";
import SVGIcon from "../assets/logo.svg?react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLangCode, setLanguage, lang } = useLanguage();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <SVGIcon className="logo"/>
        </Link>
      </div>

      {isAuthenticated && (
        <>
          {/* Desktop Links */}
          <div className="navbar-links">
            <Link
              to="/dashboard"
              className={isActive("/dashboard") ? "active" : ""}
            >
              {lang.navbar.dashboard}
            </Link>
            <Link
              to="/add-expense"
              className={isActive("/add-expense") ? "active" : ""}
            >
              {lang.navbar.addExpense}
            </Link>
            <Link
              to="/statistics"
              className={isActive("/statistics") ? "active" : ""}
            >
              {lang.navbar.statistics}
            </Link>
          </div>

          <div className="navbar-right">
            <div className="profile-container">
              <button
                className="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <FaUser className="icon" />
                {lang.navbar.profile}
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <Link to="/settings">{lang.navbar.settings}</Link>
                  <Link
                    to="/auth"
                    onClick={handleLogout}
                    className="logout-btn"
                  >
                    {lang.navbar.logout}
                  </Link>
                </div>
              )}
            </div>

            <div className="lang-container">
              <FaGlobe className="icon" />
              <select
                className="lang-dropdown"
                value={currentLangCode}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="ro">RO</option>
              </select>
            </div>
          </div>

          <button
            className="hamburger"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            ☰
          </button>

          {showMobileMenu && (
            <div className="mobile-menu-panel">
              <Link to="/dashboard">{lang.navbar.dashboard}</Link>
              <Link to="/add-expense">{lang.navbar.addExpense}</Link>
              <Link to="/statistics">{lang.navbar.statistics}</Link>
              <Link to="/settings">{lang.navbar.settings}</Link>
              <Link to="/auth" onClick={handleLogout} className="logout-btn">
                {lang.navbar.logout}
              </Link>
              <hr className="divider" />
              <div className="mobile-lang-switch">
                <span>
                  <FaGlobe className="icon" /> {lang.navbar.language}:
                </span>
                <button
                  onClick={() => setLanguage("ro")}
                  className={currentLangCode === "ro" ? "active-lang" : ""}
                >
                  RO
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={currentLangCode === "en" ? "active-lang" : ""}
                >
                  EN
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!isAuthenticated && (
        <>
          {/* Desktop for non-authenticated */}
          <div className="navbar-right hide-on-mobile">
            <Link to="/auth" className="login-link">
              {lang.navbar.login}
            </Link>
            <div className="lang-container">
              <FaGlobe className="icon" />
              <select
                className="lang-dropdown"
                value={currentLangCode}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="ro">RO</option>
              </select>
            </div>
          </div>

          {/* Mobile version */}
          <button
            className="hamburger"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            ☰
          </button>

          {showMobileMenu && (
            <div className="mobile-menu-panel">
              <Link to="/auth">{lang.navbar.login}</Link>
              <hr className="divider" />
              <div className="mobile-lang-switch">
                <span>
                  <FaGlobe className="icon" /> {lang.navbar.language}:
                </span>
                <button
                  onClick={() => setLanguage("ro")}
                  className={currentLangCode === "ro" ? "active-lang" : ""}
                >
                  RO
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={currentLangCode === "en" ? "active-lang" : ""}
                >
                  EN
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default Navbar;
