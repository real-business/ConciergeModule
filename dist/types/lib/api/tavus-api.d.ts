export interface ConversationApiResponse {
    conversation_id: string;
    conversation_name: string;
    status: string;
    conversation_url: string;
    replica_id: string;
    persona_id: string;
    created_at: string;
}
/**
 * Helper function to get the current Tavus API key
 * @returns The current Tavus API key
 */
interface CreateConversationParams {
    replicaId: string;
    personaId: string;
    conversationName: string;
    conversationalContext: string;
    customGreeting: string;
    language: string;
    apiKey: string;
}
interface EndConversationParams {
    conversationId: string;
    apiKey: string;
}
/**
 * Creates a new Tavus conversation
 */
export declare const createConversationApi: ({ replicaId, personaId, conversationName, conversationalContext, customGreeting, language, apiKey }: CreateConversationParams) => Promise<ConversationApiResponse>;
/**
 * Ends an active Tavus conversation
 */
export declare const endConversation: ({ conversationId, apiKey }: EndConversationParams) => Promise<void>;
export {};
