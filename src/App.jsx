import React, { useState, createContext, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./styles/global.css";
import demoDB from "./data/demodata.json";

export const AuthContext = React.createContext(false);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // check if token is present in local storage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
