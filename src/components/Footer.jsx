import React from "react";
import "../styles/Footer.css";
import { useLanguage } from "../context/LanguageContext";
//return the footer layout
const Footer = () => {
  const { lang } = useLanguage();
  return (
    <footer className="footer">
    {lang.footer.rights} &copy; {new Date().getFullYear()} | <a href="/#">{lang.footer.credits}</a>
  </footer>

  );
};

export default Footer;
