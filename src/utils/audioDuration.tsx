export const getAudioDuration = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    // Check if URL is valid
    if (!url || url === "/uploads/pig.png" || url.trim() === "") {
      resolve(0);
      return;
    }

    const audio = new Audio(url);
    let isResolved = false;

    const cleanup = () => {
      if (!isResolved) {
        isResolved = true;
        audio.removeEventListener("loadedmetadata", handleLoad);
        audio.removeEventListener("error", handleError);
        audio.removeEventListener("abort", handleAbort);
        audio.src = ""; // Stop loading
      }
    };

    const handleLoad = () => {
      if (!isResolved) {
        isResolved = true;
        resolve(audio.duration);
        cleanup();
      }
    };

    const handleError = () => {
      if (!isResolved) {
        isResolved = true;
        resolve(0);
        cleanup();
      }
    };

    const handleAbort = () => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error("Audio request aborted"));
        cleanup();
      }
    };

    audio.addEventListener("loadedmetadata", handleLoad);
    audio.addEventListener("error", handleError);
    audio.addEventListener("abort", handleAbort);

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        resolve(0);
        cleanup();
      }
    }, 10000); // 10 second timeout

    // Clean up timeout when resolved
    audio.addEventListener("loadedmetadata", () => clearTimeout(timeout), { once: true });
    audio.addEventListener("error", () => clearTimeout(timeout), { once: true });
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
    const result = `${apiUrl}/api/audio-file?file=${encodeURIComponent(filename)}&type=audio`;
    return result;
  }

  if (url.includes("/storage/audios/")) {
    const filename = url.split("/storage/audios/")[1];
    const result = `${apiUrl}/api/audio-file?file=${encodeURIComponent(filename)}&type=audio`;
    return result;
  } else if (url.includes("/storage/audios/compressed/")) {
    const filename = url.split("/storage/audios/compressed/")[1];
    const result = `${apiUrl}/api/audio-file?file=${encodeURIComponent(filename)}&type=compressed`;
    return result;
  }

  if (url.startsWith("songs_cover/")) {
    // Images use /storage/ path
    return `${apiUrl}/storage/${url}`;
  }

  if (url.startsWith("artist_image/")) {
    // Images use /storage/ path
    return `${apiUrl}/storage/${url}`;
  }

  if (url.startsWith("albums_cover/")) {
    // Images use /storage/ path
    return `${apiUrl}/storage/${url}`;
  }

  if (url.startsWith("temp_uploads/")) {
    const result = `${apiUrl}/storage/${url}`;
    return result;
  }

  if (url.includes("/storage/songs_cover/")) {
    // Images use /storage/ path
    return `${apiUrl}/storage/${url}`;
  }

  if (url.includes("/storage/artists/")) {
    // Images use /storage/ path
    return `${apiUrl}/storage/${url}`;
  }

  if (url.includes("/storage/artist_images/")) {
    // Images use /storage/ path
    return `${apiUrl}/storage/${url}`;
  }

  if (url.includes("/storage/albums/")) {
    // Images use /storage/ path
    return `${apiUrl}/storage/${url}`;
  }

  if (url.includes("/storage/")) {
    // Images use /storage/ path
    return `${apiUrl}/storage/${url}`;
  }

  return url;
};
