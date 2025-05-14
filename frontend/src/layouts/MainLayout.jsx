import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/global.css";
import { Toaster } from "react-hot-toast";
//pages layout 
const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Toaster
        position={"top-center"}
        toastOptions={{
          style: {
            fontWeight: "bold",
          },
          success: {
            style: {
              background: "#7BDF49"
            },
            position: "bottom-center",
          },
          error: {
            style: {
              background: "#EB2D2D"
            },
            position: "bottom-center",
          },
        }}
      />
      <div className="page-content">
        {children}
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
