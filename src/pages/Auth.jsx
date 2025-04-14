import React, { useState } from "react";
import "../styles/Auth.css";
import MainLayout from "../layouts/MainLayout";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (<MainLayout> 
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-tabs">
          <button
            className={activeTab === "login" ? "active" : ""}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={activeTab === "signup" ? "active" : ""}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          {activeTab === "signup" && (
            <input type="password" placeholder="Confirm Password" required />
          )}

          <button type="submit" className="submit-btn">
            {activeTab === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
    </MainLayout>
    );
};

export default Auth;
