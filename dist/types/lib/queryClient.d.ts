import { QueryClient, QueryFunction } from "@tanstack/react-query";
/**
 * Get the base URL for API requests based on environment
 * @returns The appropriate base URL from environment variables
 */
export declare function getBaseUrl(): string;
export declare function apiRequest(method: string, url: string, data?: unknown | undefined): Promise<Response>;
type UnauthorizedBehavior = "returnNull" | "throw";
export declare const getQueryFn: <T>(options: {
    on401: UnauthorizedBehavior;
}) => QueryFunction<T>;
export declare const queryClient: QueryClient;
export {};
