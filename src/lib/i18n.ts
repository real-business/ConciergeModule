import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { apiRequest } from './queryClient';
// Translation pages for namespaces
import conciergeEn from "../locales/en/conciergeEn.json";
import conciergeEs from "../locales/es/conciergeEs.json";
import conciergeFr from "../locales/fr/conciergeFr.json";
import conciergeDe from "../locales/de/conciergeDe.json";
import loadingMessagesEn from "../locales/en/en.json";
import loadingMessagesEs from "../locales/es/es.json";
import loadingMessagesFr from "../locales/fr/fr.json";
import loadingMessagesDe from "../locales/de/de.json";

// Default language resources (English)
const resources = {
  en: {
    concierge: conciergeEn,
    common: {
      loadingMessages: loadingMessagesEn
    }
  },
  es: {
    concierge: conciergeEs,
    common: {
      loadingMessages: loadingMessagesEs
    }
  },
  fr: {
    concierge: conciergeFr, 
    common: {
      loadingMessages: loadingMessagesFr
    }
  },
  de: {
    concierge: conciergeDe,
    common: {
      loadingMessages: loadingMessagesDe
    }
  },
};

// Setup i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already handles escaping
    }
  });

// Define supported languages (same as server)
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
];

// Create a translation cache to minimize API calls
const translationCache: Record<string, string> = {};

/**
 * Translate text using OpenAI API
 */
export async function translateText(text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<string> {
  // If target language is the same as source, return the original text
  if (targetLanguage === sourceLanguage) {
    return text;
  }
  
  // Check cache first
  const cacheKey = `${text}:${targetLanguage}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }
  
  try {
    const response = await apiRequest('POST', '/api/translate', {
      text,
      targetLanguage,
      sourceLanguage
    });
    
    const data = await response.json();
    
    if (data.translatedText) {
      // Cache the translation
      translationCache[cacheKey] = data.translatedText;
      return data.translatedText;
    }
    
    return text; // Return original text if translation fails
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Custom hook to get and cache translations for an entire namespace
 */
export async function translateNamespace(namespace: Record<string, string>, targetLanguage: string, sourceLanguage: string = 'en'): Promise<Record<string, string>> {
  if (targetLanguage === sourceLanguage) {
    return namespace;
  }
  
  const translatedNamespace: Record<string, string> = {};
  
  // Translate each key
  for (const [key, value] of Object.entries(namespace)) {
    translatedNamespace[key] = await translateText(value, targetLanguage, sourceLanguage);
  }
  
  return translatedNamespace;
}

// Add a resource bundle for a language
export function addResourceBundle(language: string, namespace: Record<string, string>): void {
  i18n.addResourceBundle(language, 'translation', namespace, true, true);
}

export default i18n;