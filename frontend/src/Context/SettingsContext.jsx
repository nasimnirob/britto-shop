import { createContext, useContext, useState } from "react";

export const SettingsContext = createContext(null); // ← createContext লাগবে

export const SettingsProvider = ({ children }) => { // ← আলাদা Provider
  const [coverEnabled, setCoverEnabled] = useState(false);
  return (
    <SettingsContext.Provider value={{ coverEnabled, setCoverEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext); // ← hook