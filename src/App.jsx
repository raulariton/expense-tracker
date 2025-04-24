import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./styles/global.css";
import demoDB from "./data/demodata.json";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); //for testing purposes
  //demo data(localstorage)** duplicate demodata and create a local storge to start with 
  if (!localStorage.getItem("appData")) {
    localStorage.setItem("appData", JSON.stringify(demoDB));
  }
  return (
    <BrowserRouter>
     
      <AppRoutes isAuthenticated={isAuthenticated} />
     
    </BrowserRouter>
  );
}

export default App;
