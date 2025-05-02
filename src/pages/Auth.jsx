import React, { useState } from "react";
import "../styles/Auth.css";
import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

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

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      setError("");
      navigate("/");
    } else {
      setError(lang.auth.errorInvalid);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem("appData"));
    const existing = db.users.find((u) => u.email === form.email);

    if (existing) {
      setError(lang.auth.errorExists);
      return;
    }

    if (form.password !== form.confirm) {
      setError(lang.auth.errorMismatch);
      return;
    }

    const newUser = {
      id: Date.now(),
      email: form.email,
      passwordHash: form.password,
      name: "",
      lastName: "",
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    localStorage.setItem("appData", JSON.stringify(db));
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    setError("");
    navigate("/");
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
