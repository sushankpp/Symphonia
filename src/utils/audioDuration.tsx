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

export const convertProfilePictureUrl = (url: string, apiUrl: string): string => {
  if (!url) return "/uploads/pig.png";

  if (!apiUrl) {
    console.log("API URL is undefined, returning fallback image");
    return "/uploads/pig.png";
  }

  // If the URL is already a full URL (starts with http:// or https://), return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative path, convert it to a full URL
  if (url.startsWith('images/') || url.startsWith('profile_pictures/')) {
    return `${apiUrl}/storage/${url}`;
  }

  // If it doesn't start with storage/, add it
  if (!url.startsWith('storage/')) {
    return `${apiUrl}/storage/${url}`;
  }

  return `${apiUrl}/${url}`;
};

export const convertStorageUrl = (url: string, apiUrl: string): string => {
  if (!url) return url;

  if (!apiUrl) {
    console.log("API URL is undefined, returning original URL");
    return url;
  }

  // If the URL is already a full URL (starts with http:// or https://), return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle audio files that start with "audios/" (from API response)
  if (url.startsWith("audios/")) {
    const filename = url.replace("audios/", "");
    return `${apiUrl}/audio.php?file=${filename}&type=audio`;
  }

  if (url.includes("/storage/audios/")) {
    const filename = url.split("/storage/audios/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=audio`;
  } else if (url.includes("/storage/audios/compressed/")) {
    const filename = url.split("/storage/audios/compressed/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=compressed`;
  }

  // Handle cover images that start with "songs_cover/" (from API response)
  if (url.startsWith("songs_cover/")) {
    const filename = url.replace("songs_cover/", "");
    return `${apiUrl}/audio.php?file=${filename}&type=cover`;
  }

  // Handle artist images that start with "artist_image/" (from API response)
  if (url.startsWith("artist_image/")) {
    const filename = url.replace("artist_image/", "");
    return `${apiUrl}/audio.php?file=${filename}&type=artist`;
  }

  // Handle album covers that start with "albums_cover/" (from API response)
  if (url.startsWith("albums_cover/")) {
    const filename = url.replace("albums_cover/", "");
    return `${apiUrl}/audio.php?file=${filename}&type=album`;
  }

  // Handle temp uploads (for pending upload requests)
  if (url.startsWith("temp_uploads/")) {
    return `${apiUrl}/storage/${url}`;
  }

  // Handle cover images
  if (url.includes("/storage/songs_cover/")) {
    const filename = url.split("/storage/songs_cover/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=cover`;
  }

  // Handle artist images
  if (url.includes("/storage/artists/")) {
    const filename = url.split("/storage/artists/")[1];
    return `${apiUrl}/audio.php?file=${filename}&type=artist`;
  }

  // Handle artist images in other possible paths
  if (url.includes("/storage/artist_images/")) {
    const filename = url.split("/storage/artist_images/")[1];
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

  return url;
};
