import React, { useEffect, useState } from "react";
import i18n from "../../i18n";


function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");
  // const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    i18n.changeLanguage(savedLang);
    setCurrentLang(savedLang);
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setCurrentLang(lang);
  };

  return (
    <div className="flex gap- justify-center items-center mb-2 text-black">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-1 py-1 rounded-l hover:bg-gray-200 dark:hover:bg-gray-700  ${currentLang === "en" ? "text-orange-500 font-semibold border dark:border-gray-600" : "text-black dark:text-white border dark:border-gray-600"
          }`}
      >
        🇺🇸 English
      </button>
      <button
        onClick={() => changeLanguage("bn")}
        className={`px-1 py-1  hover:bg-gray-200 dark:hover:bg-gray-700 ${currentLang === "bn" ? "text-orange-500 font-semibold border-y dark:border-y-gray-600" : "text-black dark:text-white border-y dark:border-y-gray-600"
          }`}
      >
        🇧🇩 বাংলা
      </button>
     
        

    </div>
  );
}

export default LanguageSelector;
