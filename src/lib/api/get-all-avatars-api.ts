/**
 * API for avatar profile fetching
 */

import { getApiUrl } from "../get-base-url";

export interface AvatarProfile {
  AvatarId: string;
  Name: string;
  TypeId: string;
  ExternalId: string;
  BusinessId: string;
  ImageUrl: string;
  CreationDate: string;
  LastUpdate: string;
  UpdateSource: string;
  Active: boolean;
}

interface ApiResponse {
  Success: boolean;
  Message?: string;
  Data?: AvatarProfile[];
}

/**
 * Fetches all avatar profiles
 * @returns API response with avatar list
 */
export const getAllAvatarsAPI = async (): Promise<ApiResponse | undefined> => {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  let result: ApiResponse | undefined;

  try {
    const response = await fetch(getApiUrl("/api/Avatar/get/all"), requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    result = response.headers.get("content-length") === "0"
      ? { Success: true, Data: [] }
      : await response.json();
  } catch (error) {
    console.error("Error fetching avatars:", error);
  }

  return result;
};