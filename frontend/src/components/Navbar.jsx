import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { FaUser, FaGlobe, FaBars } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Navbar.css";
import { useAuth } from "../context/AuthContext";
import SVGIcon from "../assets/logo.svg?react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLangCode, setLanguage, lang } = useLanguage();

  const auth = useAuth();
  const isAdmin = auth.userRole === "Admin";

  const isActive = (path) => location.pathname === path;

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <SVGIcon className="logo"/>
        </Link>
      </div>

      <div className="navbar-links">
        {auth.isAuthenticated && (
          !isAdmin ? (
          <>
            {/* non-admin options */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {lang.navbar.dashboard}
              </NavLink>
              <NavLink
                to="/add-expense"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {lang.navbar.addExpense}
              </NavLink>
              <NavLink
                to="/statistics"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {lang.navbar.statistics}
              </NavLink>
          </>
        ) : (
          <>
            {/* admin options */}
              <NavLink
                to="/admin_dashboard"
              >
                {lang.navbar.dashboard}
              </NavLink>
              <NavLink
                to="/admin-management"
              >
                {lang.navbar.adminManagement}
              </NavLink>
              <NavLink
                to="/admin-scan-receipt"
              >
                {lang.navbar.scanReceipt}
              </NavLink>
          </>
        )
      )}
      </div>

      <div className="navbar-right">
        {auth.isAuthenticated && (
          <>
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
          </>
        )}

        {/* language switch option is also shown to non-logged in users */}
      </div>

      {/* button is only shown through media CSS queries */}
      <button
        className="hamburger"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <FaBars />
      </button>

      {/* mobile menu shown hamburger icon press */}
      {showMobileMenu && (
        <div className="mobile-menu-panel">
          { !isAdmin ? (
            <>
            <NavLink to="/dashboard">{lang.navbar.dashboard}</NavLink>
            <NavLink to="/add-expense">{lang.navbar.addExpense}</NavLink>
            <NavLink to="/statistics">{lang.navbar.statistics}</NavLink>
            <NavLink to="/settings">{lang.navbar.settings}</NavLink>
            <NavLink to="/auth" onClick={handleLogout} className="logout-btn">
               {lang.navbar.logout}
            </NavLink>
            </>
          ) : (
            <>
            <NavLink to="/admin_dashboard">{lang.navbar.dashboard}</NavLink>
            <NavLink to="/admin-management">{lang.navbar.adminManagement}</NavLink>
            <NavLink to="/admin-scan-receipt">{lang.navbar.scanReceipt}</NavLink>
            </>
          )}
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

      {!auth.isAuthenticated && (
        <>
          {/* login option for non-logged in users */}
          <div className="navbar-right hide-on-mobile">
            {!isActive("/auth") && (
              <NavLink to="/auth" className="login-link">
                {lang.navbar.login}
              </NavLink>
            )}
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

          {/* login option for non-logged in users */}
          {/* mobile version */}
          <button
            className="hamburger"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <FaBars />
          </button>

          {showMobileMenu && (
            <div className="mobile-menu-panel">
              {!isActive("/auth") && (
                <>
                  <NavLink to="/auth">
                    {lang.navbar.login}
                  </NavLink>
                  <hr className="divider" />
                </>
              )}
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
