// src/context/ConciergeContext.tsx
import React, { createContext, useContext, ReactNode } from "react";

export interface ConciergeContextProps {
  user?: {
    id?: string;
    firstName?: string;
    UserId?: string;
  };
  businessId?: string;
  brandName?: string;
  selectedLanguage?: string;
  isFirstTimeUser?: boolean;
  setIsFirstTimeUser?: (val: boolean) => void;
}

const ConciergeContext = createContext<ConciergeContextProps | undefined>(undefined);

export const ConciergeProvider = ({ children, value }: { children: ReactNode; value: ConciergeContextProps }) => {
  return <ConciergeContext.Provider value={value}>{children}</ConciergeContext.Provider>;
};

export const useConciergeContext = (): ConciergeContextProps => {
  const context = useContext(ConciergeContext);
  if (!context) {
    throw new Error("useConciergeContext must be used within a ConciergeProvider");
  }
  return context;
};
