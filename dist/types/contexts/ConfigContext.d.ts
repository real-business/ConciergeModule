import React from "react";
export interface Config {
    region: string;
    apiBaseUrl: string;
    speechKey: string;
    azureTranslatorKey: string;
    azureTranslatorEndpoint: string;
    azureTranslatorRegion: string;
    tavusApiKey: string;
}
export declare const useConfig: () => Config;
export declare const ConfigProvider: React.FC<{
    value: Partial<Config>;
    children: React.ReactNode;
}>;
