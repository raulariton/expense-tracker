import en from "./english";
import ro from "./romanian";

const languages = {
  en,
  ro,
};

const getLanguage = (langCode = "en") => {
  return languages[langCode] || en;
};

export default getLanguage;
