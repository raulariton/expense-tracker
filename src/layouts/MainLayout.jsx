import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/global.css";
//pages layout 
const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="page-content">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
