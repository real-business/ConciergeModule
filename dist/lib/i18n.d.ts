import { default as i18n } from 'i18next';
export declare const supportedLanguages: {
    code: string;
    name: string;
}[];
/**
 * Translate text using OpenAI API
 */
export declare function translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string>;
/**
 * Custom hook to get and cache translations for an entire namespace
 */
export declare function translateNamespace(namespace: Record<string, string>, targetLanguage: string, sourceLanguage?: string): Promise<Record<string, string>>;
export declare function addResourceBundle(language: string, namespace: Record<string, string>): void;
export default i18n;
