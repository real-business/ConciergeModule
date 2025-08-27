import { getApiUrl } from "../get-base-url";

interface ChatHistoryPayload {
  UserId: string;
  CourseId: string;
  Query: string;
  Answer: string;
  Avatar: boolean;
  STT: boolean;
}

interface ChatHistoryResponse {
  // Add response type if needed
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
export const postChatHistory = async (
  userId: string,
  courseId: string,
  query: string,
  answer: string,
  isUserUsingAvatar: boolean = false,
  isUserSpeaking: boolean = false
): Promise<ChatHistoryResponse> => {
  // Construct the request payload
  const payload: ChatHistoryPayload = {
    UserId: userId,
    CourseId: courseId,
    Query: query,
    Answer: answer,
    Avatar: isUserUsingAvatar,
    STT: isUserSpeaking,
  };

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  let result: ChatHistoryResponse;
  try {
    const apiUrl = getApiUrl("/api/User/chathistory/post");
    //console.log('Attempting to post chat history to:', apiUrl);
    //console.log('With payload:', payload);

    const response = await fetch(apiUrl, requestOptions);

    if (!response.ok) {
      let errorDetails = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        errorDetails = await response.json();
      } else {
        errorDetails = { message: await response.text() };
      }
      console.error("Error details:", errorDetails);
      throw new Error(
        `Failed to post chat history: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`
      );
    }

    result = response.headers.get("content-length") === "0" 
      ? { Data: true, Success: true, Message: "Ok" }
      : await response.json();

    //console.log('Chat history posted successfully:', result);
    return result;

  } catch (error) {
    console.error("Error posting chat history:", error);
    // Return a structured error response instead of throwing
    return {
      Success: false,
      Message: error instanceof Error ? error.message : "Unknown error occurred",
      Data: null
    };
  }
}; 