import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/Settings.css";
import { useLanguage } from "../context/LanguageContext";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Settings = () => {
  const { lang } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState('');
  const [alert, setAlert] = useState("")
  const [originalForm, setOriginalForm] = useState({});
  const [form, setForm] = useState({


    email: "",
    createdAt: "",
    password: ""
  });


  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user_info"));
    if (storedUser) {
      const initialData = {
        username: storedUser.username,
        email: storedUser.email,
        createdAt: storedUser.creation_date,
        role: storedUser.role
      }

      setForm(initialData)
      setOriginalForm(initialData);

    }
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const regex = /^[A-Za-z0-9_]+$/;
    if (regex.test(value) || value === "") {
      setAlert("");
    } else {
      setAlert("Only letters, numbers, and underscores allowed!");
    }

    if(value.length > 10) {
      setAlert("Username must not be longer than 10 characters!")
    }


    setForm((prev) => ({ ...prev, [name]: value }));
  };

   const handleSubmit = async(e) => {
    e.preventDefault();



    const user_data = JSON.parse(localStorage.getItem("user_info"))

    //TODO: make api request to change username in database
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/settings/modify-settings",
        {"username": form.username},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          },
        },
      );

      setResponse(response.data)

      if(response.data){
        user_data.username = form.username
        localStorage.setItem("user_info",JSON.stringify(user_data))
      }



      } catch (error) {
      if (error.response && error.response.status === 400) {
        setAlert(lang.settings.userExists);
        return
      } else {
        setError(error.message);
      }
    }


    setEditing(false);
  };

  return (
    <MainLayout>
      <div className="settings-container">
        {!editing ? (
          <div className="profile-card">
            <h2>{lang.settings.viewTitle}</h2>
            <p><strong>{lang.settings.username}:</strong> {form.username}</p>
            <p><strong>{lang.settings.email}:</strong> {form.email}</p>
            <p><strong>{lang.settings.created}:</strong> {form.createdAt}</p>
            <p><strong>{lang.settings.role}:</strong> {form.role}</p>
            <button className="edit-btn" onClick={() => setEditing(true)}>
              {lang.settings.edit}
            </button>
          </div>
        ) : (
          <form className="settings-form" onSubmit={handleSubmit}>
            <h2>{lang.settings.edit}</h2>

            <label>
              {lang.settings.username}
              <input name="username" value={form.username} onChange={handleChange} />
            </label>

            <p className="alert-message">{alert}</p>


            <div className="readonly-info">

              <strong>{lang.settings.email}:</strong> {form.email}
              <p></p>
              <strong>{lang.settings.created}:</strong> {form.createdAt}

            </div>



            <div className="form-actions">
              <button
                className="cancel-btn"
                type="button"
                onClick={() => {
                  setEditing(false);
                  setAlert("");
                  setForm(originalForm);
                }}
              >
                {lang.settings.cancel}
              </button>

              <button type="submit"
                      disabled={alert !== "" || !form.username}
                      className="save-btn">
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
