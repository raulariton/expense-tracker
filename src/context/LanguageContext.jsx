import React, { createContext, useContext, useState } from "react";
import english from "../languages/english";
import romanian from "../languages/romanian";

const LanguageContext = createContext();
//lang files
const languages = {
  en: english,
  ro: romanian
};
//lang switcher 
export const LanguageProvider = ({ children }) => {
  const [currentLangCode, setCurrentLangCode] = useState("en");

  const value = {
    lang: languages[currentLangCode],
    currentLangCode,
    setLanguage: setCurrentLangCode
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
