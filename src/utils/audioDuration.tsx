export const getAudioDuration = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio(url);

    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
    });

    audio.addEventListener("error", () => {
      console.error(`Error loading audio file: ${url}`);
      resolve(0); // Resolve with 0 duration on error
    });
  });
};

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// Utility function to convert storage URLs to CORS-compatible format
export const convertStorageUrl = (url: string, apiUrl: string): string => {
  if (!url) return url;
  
  // Debug: Log the URL being processed
  console.log("Converting URL:", url);
  console.log("API URL:", apiUrl);
  
  // If apiUrl is undefined, return the original URL
  if (!apiUrl) {
    console.log("API URL is undefined, returning original URL");
    return url;
  }
  
  // Handle audio files
  if (url.includes("/storage/audios/")) {
    const filename = url.split("/storage/audios/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=audio`;
  } else if (url.includes("/storage/audios/compressed/")) {
    const filename = url.split("/storage/audios/compressed/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=compressed`;
  }
  
  // Handle cover images
  if (url.includes("/storage/songs_cover/")) {
    const filename = url.split("/storage/songs_cover/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=cover`;
  }
  
  // Handle artist images - they might be in different storage paths
  if (url.includes("/storage/artists/")) {
    const filename = url.split("/storage/artists/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=artist`;
  }
  
  // Handle artist images in other possible paths
  if (url.includes("/storage/artist_images/")) {
    const filename = url.split("/storage/artist_images/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=artist`;
  }
  
  if (url.includes("/storage/artist_photos/")) {
    const filename = url.split("/storage/artist_photos/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=artist`;
  }
  
  // Handle album covers
  if (url.includes("/storage/albums/")) {
    const filename = url.split("/storage/albums/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=album`;
  }
  
  // Handle any other storage paths
  if (url.includes("/storage/")) {
    const pathParts = url.split("/storage/");
    if (pathParts.length > 1) {
      const fullPath = pathParts[1];
      const pathSegments = fullPath.split("/");
      const type = pathSegments[0]; // e.g., "artists", "albums", "songs_cover", etc.
      const filename = pathSegments[pathSegments.length - 1];
      return `${apiUrl}/audio.php?file=${filename}&type=${type}`;
    }
  }
  
  // If it's already a full URL or doesn't match any pattern, return as is
  console.log("URL not converted (returning as is):", url);
  return url;
};
