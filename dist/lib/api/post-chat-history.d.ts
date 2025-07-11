interface ChatHistoryResponse {
    [key: string]: any;
}
/**
 * Posts chat history to the server
 * @param userId - The ID of the user
 * @param courseId - The ID of the course
 * @param query - The user's query
 * @param answer - The AI's answer
 * @param isUserUsingAvatar - Whether the user is using the avatar
 * @param isUserSpeaking - Whether the user is speaking
 * @returns The response from the server
 */
export declare const postChatHistory: (userId: string, courseId: string, query: string, answer: string, isUserUsingAvatar?: boolean, isUserSpeaking?: boolean) => Promise<ChatHistoryResponse>;
export {};
