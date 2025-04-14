import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./styles/global.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); //for testing purposes

  return (
    <BrowserRouter>
     
      <AppRoutes isAuthenticated={isAuthenticated} />
     
    </BrowserRouter>
  );
}

export default App;
