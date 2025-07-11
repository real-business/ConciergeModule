interface APIResponse {
    Success: boolean;
    Data: {
        Message: string | null;
        Type: string | null;
        SessionId: string | null;
    } | null;
    Message?: string;
}
export declare const chatCompletionAPI: (input: string, userId?: string, businessId?: string, intent?: string, sessionId?: string, delay?: number, retries?: number, language?: string) => Promise<APIResponse>;
export {};
