/**
 * Gets the base URL for API calls based on the current environment
 * @returns The base URL for API calls
 */
export const getBaseUrl = () => {
  return "https://developmentapis.azure-api.net/sandbox/v1/api";
};

/**
 * Appends the base URL to the given API endpoint
 * @param endpoint The API endpoint to append to the base URL
 * @returns The complete URL for the API call
 */
export const getApiUrl = (endpoint: string) => {
  const baseUrl = getBaseUrl().replace(/\/$/, ""); // Remove trailing slash
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // If baseUrl ends with /api and endpoint starts with /api, remove one
  if (baseUrl.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
  }

  return `${baseUrl}${cleanEndpoint}`;
}; 