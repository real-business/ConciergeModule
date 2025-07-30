// Main export for the Concierge Module
export { default as ConciergeModule } from './ConciergeModuleWrapper';
export { default as ConciergeModuleRaw } from './ConciergeModule';
export type { SuggestedPrompt } from './ConciergeModule';

// Export types
export type { ConciergeModuleProps } from './ConciergeModule';

// Export individual components if needed
export { default as ConversationComponent } from './components/replica/ConversationComponent';
export { default as SpeechComponent } from './components/voice/SpeechComponent';

// Export contexts for advanced usage
export { ConciergeProvider, useConciergeContext } from './contexts/ConciergeContext';

// Export SSR utilities
export { default as SSRSafeWrapper } from './components/SSRSafeWrapper';
export { default as useLocalStorage } from './hooks/useLocalStorage';
