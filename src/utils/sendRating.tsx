type RatingProps = {
  rateableId: number | string;
  rateableType: string;
  rating: number;
};

export const sendRating = async ({
  rateableId,
  rateableType,
  rating,
}: RatingProps): Promise<any> => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Validate required fields
  if (!rateableId) {
    throw new Error("rateableId is required");
  }
  
  if (!rateableType) {
    throw new Error("rateableType is required");
  }
  
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("rating must be between 1 and 5");
  }
  
  console.log("Sending rating with data:", { rateableId, rateableType, rating });
  
  try {
    const requestBody = {
      rateable_id: rateableId,
      rateable_type: rateableType,
      rating: rating,
    };
    
    console.log("Request body:", requestBody);
    
    const response = await fetch(`${API_URL}/api/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`Failed to send rating: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Rating submission error:", error);
    throw error;
  }
};
