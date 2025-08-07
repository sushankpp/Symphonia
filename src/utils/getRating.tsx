import { authService } from "../services/authService";

type GetRatingProps = {
  rateableId: number;
  rateableType: string;
};

export const getRating = async ({
  rateableId,
  rateableType,
}: GetRatingProps): Promise<number> => {
  const API_URL = import.meta.env.VITE_API_URL;

  // Validate required fields
  if (!rateableId) {
    console.warn("rateableId is required for getting rating");
    return 0;
  }

  if (!rateableType) {
    console.warn("rateableType is required for getting rating");
    return 0;
  }

  try {
    // Get authentication headers
    const authHeaders = authService.getAuthHeaders();
    
    const response = await fetch(`${API_URL}/api/ratings/${rateableId}?type=${rateableType}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...authHeaders,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No rating found for this item
        return 0;
      }
      console.error("Failed to get rating:", response.status, response.statusText);
      return 0;
    }

    const data = await response.json();
    return data.rating || 0;
  } catch (error) {
    console.error("Error getting rating:", error);
    return 0;
  }
};
