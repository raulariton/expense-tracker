import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/global.css";
import { Toaster } from "react-hot-toast";
//pages layout 
const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
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
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-25">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
