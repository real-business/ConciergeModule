/**
 * Gets the base URL for API calls based on the current environment
 * @returns The base URL for API calls
 */
export declare const getBaseUrl: () => string;
/**
 * Appends the base URL to the given API endpoint
 * @param endpoint The API endpoint to append to the base URL
 * @returns The complete URL for the API call
 */
export declare const getApiUrl: (endpoint: string) => string;
