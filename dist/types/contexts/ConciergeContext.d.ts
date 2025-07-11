import { ReactNode } from "react";
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
export declare const ConciergeProvider: ({ children, value }: {
    children: ReactNode;
    value: ConciergeContextProps;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useConciergeContext: () => ConciergeContextProps;
