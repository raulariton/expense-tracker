import MainLayout from "../layouts/MainLayout";
import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext.jsx";
import "../styles/CreateAdmin.css";

const CreateAdmin = () => {
  const { lang } = useLanguage();
  const [form,setForm] = useState({ email:""});
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState('');


  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAdmin = async(e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    setGeneratedPassword('');
    setError('');

    const formData = new FormData();
    formData.append("email", form.email);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/admin/create_admin",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        },
      );

      setGeneratedPassword(response.data);

      } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(lang.auth.errorExists);
      } else {
        setError(error.message);
      }
    }

  };

  // TODO: take into account user languages
  return (
    <MainLayout>
      <div className="create-admin">
        <h1 className="title"> {lang.admin.title} </h1>
        <div className="admin-creation-box">
              <form className="auth-form" onSubmit={handleCreateAdmin}>
                <input
                  type="email"
                  placeholder={lang.auth.email}
                  name="email"
                  value={form.email}
                  onChange={handleInput}
                  required
                />
                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="submit-btn">
                  {lang.admin.button}
                </button>
              </form>
          {generatedPassword && (
            <div className="password-outside-box">
              <p><strong>{lang.admin.passwordGeneration}</strong></p>
              <div className="password-box">
                <div className="generated-password">{generatedPassword}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default CreateAdmin;