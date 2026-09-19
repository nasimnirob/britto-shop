import { createContext, useContext, useState } from "react";

export const SiteSettingsContext = createContext(null); // ← createContext লাগবে

export const SiteSettingsProvider = ({ children }) => { // ← আলাদা Provider
  const [coverEnabled, setCoverEnabled] = useState(false);
  return (
    <SiteSettingsContext.Provider value={{ coverEnabled, setCoverEnabled }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext); // ← hook