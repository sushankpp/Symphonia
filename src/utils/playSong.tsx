export const playSong = async (songId: number): Promise<any> => {
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiURL}/api/music/${songId}/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to play song");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error playing song:", error);
    throw error;
  }
};
