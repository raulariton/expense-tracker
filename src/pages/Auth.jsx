import React, { useState } from "react";
import "../styles/Auth.css";
import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";

const Auth = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem("appData"));
    const user = db.users.find(
      (u) => u.email === form.email && u.passwordHash === form.password
    );

    // if user is found
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      setError("");
      navigate("/");
    } else {
      // if user is not found
      setError(lang.auth.errorInvalid);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // ensure the two passwords match
    if (form.password !== form.confirm) {
      setError(lang.auth.errorMismatch);
      return;
    }

    // submit to server
    try {
      const response = await axios.post(
        "http://localhost:8000/auth/register",
        {
          email: form.email,
          password: form.password
        }
      )

      const access_token = response.data.access_token;
      localStorage.setItem("access_token", access_token);

      setError("");
      navigate("/");

    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(lang.auth.errorExists);
      }
      else {
        // TODO: Need to have specific text based on error
        //  and not just error.message
        setError(error.message);
      }
    }
  };

  return (
    <MainLayout>
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-tabs">
            <button
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              {lang.auth.loginTab}
            </button>
            <button
              className={activeTab === "register" ? "active" : ""}
              onClick={() => setActiveTab("register")}
            >
              {lang.auth.registerTab}
            </button>
          </div>

          <div className="auth-box">
            {activeTab === "login" ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder={lang.auth.email}
                  name="email"
                  value={form.email}
                  onChange={handleInput}
                  required
                />
                <input
                  type="password"
                  placeholder={lang.auth.password}
                  name="password"
                  value={form.password}
                  onChange={handleInput}
                  required
                />
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="submit-btn">
                  {lang.auth.loginBtn}
                </button>
              </form>
            ) : (
              // registration form
              <form className="auth-form" onSubmit={handleRegister}>
                <input
                  type="email"
                  placeholder={lang.auth.email}
                  name="email"
                  value={form.email}
                  onChange={handleInput}
                  required
                />
                <input
                  type="password"
                  placeholder={lang.auth.password}
                  name="password"
                  value={form.password}
                  onChange={handleInput}
                  required
                />
                <input
                  type="password"
                  placeholder={lang.auth.confirmPassword}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleInput}
                  required
                />
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="submit-btn">
                  {lang.auth.signupBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Auth;
