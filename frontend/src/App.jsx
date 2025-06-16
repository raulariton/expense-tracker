import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";

function App() {

  // TODO: adjust by language
  document.title =
    "ExpenseTracker | Your personal finance, made easy"

  return (
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  );
}

export default App;