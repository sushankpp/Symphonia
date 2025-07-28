export const addToRecentlyPlayed = async (songId: number) => {
    const apiURL = import.meta.env.VITE_API_URL;

    try {
        const response = await fetch(`${apiURL}/api/recently-played`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({song_id: songId}),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch recently played");
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding to recently played:", error);
        throw error;
    }
}