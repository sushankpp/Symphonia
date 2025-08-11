export const getAudioDuration = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    // Check if URL is valid
    if (!url || url === "/uploads/pig.png" || url.trim() === "") {
      resolve(0);
      return;
    }

    const audio = new Audio(url);

    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
    });

    audio.addEventListener("error", () => {
      resolve(0);
    });
  });
};

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const convertProfilePictureUrl = (
  url: string,
  apiUrl: string
): string => {
  if (!url) return "/uploads/pig.png";

  if (!apiUrl) {
    return "/uploads/pig.png";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("images/") || url.startsWith("profile_pictures/")) {
    return `${apiUrl}/storage/${url}`;
  }

  if (!url.startsWith("storage/")) {
    return `${apiUrl}/storage/${url}`;
  }

  return `${apiUrl}/${url}`;
};

// Helper function to get audio URL from song object
export const getAudioUrlFromSong = (song: any, apiUrl: string): string => {
  // Try audio_url first (used in recommendations)
  if (song.audio_url) {
    const url = convertStorageUrl(song.audio_url, apiUrl);
    return url;
  }
  
  // Fallback to file_path (used in other parts of the app)
  if (song.file_path) {
    const url = convertStorageUrl(song.file_path, apiUrl);
    return url;
  }
  
  return ""; // Return empty string instead of image file
};

// Helper function to check if audio URL is accessible


export const convertStorageUrl = (url: string, apiUrl: string): string => {
  if (!url) {
    return "/uploads/pig.png";
  }

  if (!apiUrl) {
    return url;
  }

  // Handle empty or invalid URLs
  if (url.trim() === "" || url === "null" || url === "undefined") {
    return "/uploads/pig.png";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("audios/")) {
    const filename = url.replace("audios/", "");
    const result = `${apiUrl}/audio.php?file=${filename}&type=audio`;
    return result;
  }

  if (url.includes("/storage/audios/")) {
    const filename = url.split("/storage/audios/")[1];
    const result = `${apiUrl}/audio.php?file=${filename}&type=audio`;
    return result;
  } else if (url.includes("/storage/audios/compressed/")) {
    const filename = url.split("/storage/audios/compressed/")[1];
    const result = `${apiUrl}/audio.php?file=${filename}&type=compressed`;
    return result;
  }

  if (url.startsWith("songs_cover/")) {
    const filename = url.replace("songs_cover/", "");
    const result = `${apiUrl}/audio.php?file=${filename}&type=cover`;
    return result;
  }

  if (url.startsWith("artist_image/")) {
    const filename = url.replace("artist_image/", "");
    const result = `${apiUrl}/audio.php?file=${filename}&type=artist`;
    return result;
  }

  if (url.startsWith("albums_cover/")) {
    const filename = url.replace("albums_cover/", "");
    const result = `${apiUrl}/audio.php?file=${filename}&type=album`;
    return result;
  }

  if (url.startsWith("temp_uploads/")) {
    const result = `${apiUrl}/storage/${url}`;
    return result;
  }

  if (url.includes("/storage/songs_cover/")) {
    const filename = url.split("/storage/songs_cover/")[1];
    const result = `${apiUrl}/audio.php?file=${filename}&type=cover`;
    return result;
  }

  if (url.includes("/storage/artists/")) {
    const filename = url.split("/storage/artists/")[1];
    const result = `${apiUrl}/audio.php?file=${filename}&type=artist`;
    return result;
  }

  if (url.includes("/storage/artist_images/")) {
    const filename = url.split("/storage/artist_images/")[1];
    const result = `${apiUrl}/audio.php?file=${filename}&type=artist`;
    return result;
  }

  if (url.includes("/storage/albums/")) {
    const filename = url.split("/storage/albums/")[1];
    const result = `${apiUrl}/audio.php?file=${filename}&type=album`;
    return result;
  }

  if (url.includes("/storage/")) {
    const pathParts = url.split("/storage/");
    if (pathParts.length > 1) {
      const fullPath = pathParts[1];
      const pathSegments = fullPath.split("/");
      const type = pathSegments[0];
      const filename = pathSegments[pathSegments.length - 1];
      const result = `${apiUrl}/audio.php?file=${filename}&type=${type}`;
      return result;
    }
  }

  return url;
};
