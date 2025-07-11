import { useConfig } from "../../contexts/ConfigContext";

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
export const createConversationApi = async ({
  replicaId,
  personaId,
  conversationName,
  conversationalContext,
  customGreeting,
  language,
  apiKey
}: CreateConversationParams): Promise<ConversationApiResponse> => {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      replica_id: replicaId,
      persona_id: personaId,
      conversation_name: conversationName,
      conversational_context: conversationalContext,
      custom_greeting: customGreeting,
      properties: {
        enable_recording: false,
        participant_absent_timeout: 180,
        language: language,
      },
    }),
  };

  try {
    const response = await fetch(
      "https://tavusapi.com/v2/conversations",
      requestOptions
    );

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorData;

      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }

      throw new Error(
        errorData?.message || `HTTP error! Status: ${response.status}`
      );
    }

    const result = await response.json();
    return result as ConversationApiResponse;
  } catch (error) {
    console.error("Error creating Tavus conversation:", error);
    throw error;
  }
};

/**
 * Ends an active Tavus conversation
 */
export const endConversation = async ({
  conversationId,
  apiKey
}: EndConversationParams): Promise<void> => {
  const options: RequestInit = {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
    },
  };

  try {
    await fetch(
      `https://tavusapi.com/v2/conversations/${conversationId}/end`,
      options
    );
  } catch (error) {
    // Silently ignore
  }
};
