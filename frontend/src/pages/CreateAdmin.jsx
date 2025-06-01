import MainLayout from "../layouts/MainLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext.jsx";
import "../styles/CreateAdmin.css";
import toast from "react-hot-toast";

const CreateAdmin = () => {
  const { lang } = useLanguage();
  const [form,setForm] = useState({ email:""});
  const [error, setError] = useState("");
  const [response, setResponse] = useState('');
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

   useEffect(() => {
    const fetchAdmins = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await axios.get("http://localhost:8000/admin/admin_table", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAdmins(response.data);
      } catch (error) {
        toast.error("Error occurred: " + error.message);
      } finally {
        setLoadingAdmins(false);
      }
    };

    fetchAdmins();
  }, []);



  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleCreateAdmin = async(e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    setResponse("")
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

      setResponse(response.data)

      } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(lang.auth.errorExists);
      } else {
        setError(error.message);
      }
    }

  };


  //Admin Card template
  const AdminCard = ({admin}) => {
    const [expanded,setExpanded] = useState(false);


    return (
      <div className="admin-card">
        <div className="admin_text_wrapper">
          <p><strong>ID:</strong> {admin.id}</p>
          <p>{admin.email}</p>
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? "▲" : "▼"}
      </button>
        </div>
      {expanded && (
        <div className="admin-details">
          <p><strong>Created at:</strong> {admin.creation_date} </p>
          <p><strong>Username:</strong> {admin.username}</p>
        </div>
      )}
    </div>
  );
  }



  // TODO: take into account user languages
  return (
    <MainLayout>

    <div className="wrapper">
       <h1 className="title"> {lang.admin.title} </h1>
       <div className="create-admin">



        <div className="card admin-table">
        {loadingAdmins ? (
          <p>Loading admins...</p>
        ) : (
          <>
          <h1 className="title"> {lang.admin.adminList}</h1>


          <div className="admin-scroll-body">
            {admins.map((admin) => (
               <AdminCard key={admin.id} admin={admin} />

            ))}
          </div>
           </>
        )}

        </div>

         <div className="space"></div>


        <div className="card">
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
          {response && (
            <div className="password-outside-box">
              <p><strong>{lang.admin.status}</strong></p>
              <div className="password-box">
                <div className="generated-password">{response}</div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>

    </MainLayout>
  );
}

export default CreateAdmin;