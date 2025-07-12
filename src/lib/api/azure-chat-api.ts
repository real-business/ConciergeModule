interface APIResponse {
  Success: boolean;
  Data: {
    Message: string | null;
    Type: string | null;
    SessionId: string | null;
  } | null;
  Message?: string;
}

// interface RequestBody {
//   Input: string;
//   UserId: string;
//   BusinessId: string;
//   Intent: string;
//   SessionId: string;
//   Platform: string;
// }

export const chatCompletionAPI = async (
  input: string,
  userId: string = "",
  businessId: string = "",
  intent: string = "chat",
  sessionId: string = "",
  delay: number = 0,
  retries: number = 1,
  language: string = "en",
  file?: File
): Promise<APIResponse> => {
  for (let i = 0; i < retries; i++) {
    const myHeaders = new Headers();
    console.log("file in api", file);
    console.log("file size:", file?.size);
    console.log("file name:", file?.name);
    console.log("file type:", file?.type);
    myHeaders.append("Accept", "application/json");
    const prompt =  input + "Language: " + language;
    const defaultUserId = "52533633434137384342";
    const formData = new FormData();
      formData.append("Input", prompt );
      formData.append("UserId", userId ? userId : defaultUserId);
      formData.append("BusinessId", businessId);
      formData.append("Intent", intent);
      formData.append("SessionId", sessionId);
      formData.append("Platform", "EF0306CD");
      if (file && file.size > 0) {
       formData.append("Files", file);
       console.log("File appended to FormData");
      } else {
       console.log("No file to append");
      }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout
    // // Structuring the request body based on the expected API input
    // const requestBody: RequestBody = {
    //   Input: input + ". Reply in " + language + ". Send the response in markdown format, but don't say markdown in the response.", // 'Input' is mandatory
    //   UserId: userId, // Optional UserId
    //   BusinessId: businessId, // Optional BusinessId
    //   Intent: intent,
    //   SessionId: sessionId,
    //   Platform: "EF0306CD"
    // };

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      signal: controller.signal // Add the abort signal to the request
    };

    try {
      // Use environment variable for API base URL if available, else use the default
      const apiBaseUrl = "https://developmentapis.azure-api.net/sandbox/v1/api";
      const response = await fetch(
        `${apiBaseUrl}/AI/assistant`,
        requestOptions,
      );

      clearTimeout(timeoutId); // Clear the timeout after successful response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.Message || `HTTP error! Status: ${response.status}`,
        );
      }

      const result: APIResponse = await response.json();

      // If success but data is null, retry
      if (
        result.Success &&
        (result.Data?.Message === null ||
          result.Data?.Message.toUpperCase() === "INVALID JSON" ||
          result.Data?.Message ===
            "local variable 'result' referenced before assignment" ||
          result.Data?.Message === "Object reference not set to an instance of an object." ||
          result.Data?.Message?.toLowerCase().includes("exception thrown"))
      ) {
        console.warn(
          `Attempt ${i + 1}: Success but received null data. Retrying...`,
        );
        if (delay > 0) await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
        continue; // Retry
      }

      return result; // Return valid result
    } catch (error) {
      clearTimeout(timeoutId); // Clear the timeout in case of error
      if (error instanceof Error && error.name === "AbortError") {
        console.error(`Request timed out after 90 seconds`);
        return { Success: false, Message: "ERROR: API timed out", Data: null };
      } else {
        console.error("Error in chat API:", error);
      }
    }
  }
  // Fallback return statement if retries are exhausted
  return {       
    Success: false,
    Message: "API call failed after all retries",
    Data: null,
  };
};

// Export is already handled above
