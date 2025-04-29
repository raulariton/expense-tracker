import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/Settings.css";
import { useLanguage } from "../context/LanguageContext";

const Settings = () => {
  const { lang } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    createdAt: "",
    password: ""
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setForm({
        name: storedUser.name || "",
        lastName: storedUser.lastName || "",
        email: storedUser.email,
        createdAt: storedUser.createdAt,
        password: ""
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...form,
      id: JSON.parse(localStorage.getItem("currentUser")).id,
      passwordHash: form.password || JSON.parse(localStorage.getItem("currentUser")).passwordHash
    };

    const db = JSON.parse(localStorage.getItem("appData"));
    const updatedUsers = db.users.map((u) =>
      u.id === updatedUser.id ? updatedUser : u
    );
    db.users = updatedUsers;

    localStorage.setItem("appData", JSON.stringify(db));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    setEditing(false);
  };

  return (
    <MainLayout>
      <div className="settings-container">
        {!editing ? (
          <div className="profile-card">
            <h2>{lang.settings.viewTitle}</h2>
            <p><strong>{lang.settings.name}:</strong> {form.name || "—"}</p>
            <p><strong>{lang.settings.lastName}:</strong> {form.lastName || "—"}</p>
            <p><strong>{lang.settings.email}:</strong> {form.email}</p>
            <p><strong>{lang.settings.created}:</strong> {form.createdAt}</p>
            <button className="edit-btn" onClick={() => setEditing(true)}>
              {lang.settings.edit}
            </button>
          </div>
        ) : (
          <form className="settings-form" onSubmit={handleSubmit}>
            <h2>{lang.settings.edit}</h2>

            <label>
              {lang.settings.name}
              <input name="name" value={form.name} onChange={handleChange} />
            </label>

            <label>
              {lang.settings.lastName}
              <input name="lastName" value={form.lastName} onChange={handleChange} />
            </label>

            <label>
              {lang.settings.email}
              <input name="email" value={form.email} onChange={handleChange} />
            </label>

            <label>
              {lang.settings.password}
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />
            </label>

            <div className="readonly-info">
              <strong>{lang.settings.created}:</strong> {form.createdAt}
            </div>

            <div className="form-actions">
              <button
                className="cancel-btn"
                type="button"
                onClick={() => setEditing(false)}
              >
                {lang.settings.cancel}
              </button>
              <button type="submit" className="save-btn">
                {lang.settings.save}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default Settings;
