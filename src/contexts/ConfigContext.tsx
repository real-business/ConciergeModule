// src/config/ConfigContext.ts
import React, { createContext, useContext } from "react";

export interface Config {
  region: string;
  apiBaseUrl: string;
  speechKey: string;
  azureTranslatorKey: string;
  azureTranslatorEndpoint: string;
  azureTranslatorRegion: string;
  tavusApiKey: string;

}

const defaultConfig: Config = {
  region: "",
  apiBaseUrl: "",
  speechKey: "",
  azureTranslatorKey: "",
  azureTranslatorEndpoint: "",
  azureTranslatorRegion: "",
  tavusApiKey: "",
};

const ConfigContext = createContext<Config>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ value: Partial<Config>, children: React.ReactNode }> = ({ value, children }) => {
  const merged = { ...defaultConfig, ...value };
  return (
    <ConfigContext.Provider value={merged}>
      {children}
    </ConfigContext.Provider>
  );
};
