/**
 * API for avatar profile fetching
 */
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
export declare const getAllAvatarsAPI: () => Promise<ApiResponse | undefined>;
export {};
