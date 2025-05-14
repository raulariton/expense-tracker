// src/pages/Home.jsx
import React from "react";
import "../styles/Home.css";
import { useLanguage } from "../context/LanguageContext";
import MainLayout from "../layouts/MainLayout";

const Home = () => {
  const { lang } = useLanguage();

  return (
    <MainLayout>
      <div className="home-page">
        <div className="home-hero">
          <div className="home-image-block">
            <img src="" alt="pic" />
          </div>
          <div className="home-text-block">
            <h1>{lang.home.title}</h1>
            <p>{lang.home.description}</p>
          </div>
        </div>

        <div className="Sec_home_hero">
          <div className="Sec_home_text">
            <h2>{lang.home.ShomeTitle}</h2>
              {/* //add somthing here  */}
          </div>
          <div className="Sec_home_image">
            <img src="" alt="pic" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
