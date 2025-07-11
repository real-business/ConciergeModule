import { getApiUrl } from "../get-base-url"

interface LLMTrainingPayload {
  Input: string;
  UserId: string;
  BusinessId: string;
  Accepted: boolean;
}

const postLLMTrainingAPI = async (
  input: string,
  userId: string,
  businessId: string,
  accepted: boolean,
): Promise<any> => {
  // Construct the request payload
  const payload: LLMTrainingPayload = {
    Input: input,
    UserId: userId,
    BusinessId: businessId,
    Accepted: accepted,
  };

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Indicate JSON payload
    },
    body: JSON.stringify(payload), // Convert the payload to a JSON string
  };

  let result: any;

  try {
    const response = await fetch(
      getApiUrl("/api/AI/training"),
      requestOptions,
    );

    if (!response.ok) {
      const errorDetails = await response.text(); // Use text() to handle non-JSON errors
      console.error("Error details:", errorDetails); // Log the error details
      throw new Error(`Failed: ${response.statusText} - ${errorDetails}`);
    }

    //console.log("LLM training api response", response);

    if (response.headers.get("content-length") === "0") {
      result = {}; // Return an empty object if the response body is empty
    } else {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        console.error("Unexpected response format:", contentType);
      }
    }
  } catch (error) {
    console.error("Saving chat error:", error);
  }

  return result;
};

export default postLLMTrainingAPI;
