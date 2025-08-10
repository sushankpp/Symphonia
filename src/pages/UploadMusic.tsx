import React, { useState, useRef, useEffect } from "react";
import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import { useAuth } from "../contexts/AuthContext";
import { makeAuthenticatedRequest } from "../services/apiService";
import {
  FileUpload,
  SongDetailsForm,
  CoverImageUpload,
  RecentUploads,
  UploadActions,
} from "../components/ui/upload";

interface Artist {
  id: number;
  artist_name: string;
  email: string;
}

interface CompressionStats {
  original_size: string;
  compressed_size: string;
  compression_ratio: number;
  space_saved: string;
}

interface UploadedTrack {
  id: number;
  title: string;
  artist: any;
  file_path?: string;
  song_cover?: string;
  uploaded_at?: string;
  status?: "pending" | "uploaded" | "processing";
  file_size?: string;
  compression_stats?: CompressionStats;
}

const UploadMusic: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Check if user can upload music (artists and admins)
  const canUploadMusic = user?.role === 'artist' || user?.role === 'admin';

  // Song details form state
  const [songForm, setSongForm] = useState({
    songTitle: "",
    selectedArtistId: "",
    genre: "",
    description: "",
    releaseDate: "",
    lyrics: "",
  });

  // Note: Artist form state removed as artists now upload to their own profile only

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        if (user?.role === 'artist') {
          // For artists, fetch all artists and find the one that matches the current user
          const response = await fetch(`${API_URL}/api/artists`);
          
          if (response.ok) {
            const allArtists = await response.json();
            console.log("All artists data:", allArtists);
            
            // Find the artist that matches the current user
            const currentArtist = allArtists.find((artist: any) => 
              artist.email === user.email || 
              artist.artist_name === user.name ||
              artist.user_id === user.id
            );
            
            if (currentArtist) {
              console.log("Found current artist:", currentArtist);
              
              const artist = {
                id: currentArtist.id,
                artist_name: currentArtist.artist_name,
                email: currentArtist.email || user.email
              };
              
              setArtists([artist]);
              setSongForm(prev => ({
                ...prev,
                selectedArtistId: artist.id.toString()
              }));
              console.log("Using artist data from backend:", artist);
            } else {
              console.error("Could not find artist record for current user");
              console.log("User data:", user);
              console.log("Available artists:", allArtists);
              setUploadMessage("Unable to find your artist profile. Please contact support.");
            }
          } else {
            console.error("Failed to fetch artists");
            setUploadMessage("Failed to load artists list");
          }
        } else if (user?.role === 'admin') {
          // For admins, fetch all artists (existing behavior)
          const response = await fetch(`${API_URL}/api/artists`);
          if (response.ok) {
            const data = await response.json();
            setArtists(data);
          } else {
            console.error("Failed to fetch artists");
            setUploadMessage("Failed to load artists list");
          }
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
        setUploadMessage("Error loading artist information");
      } finally {
        setIsLoadingArtists(false);
      }
    };

    // Only fetch artists if user can upload music and user data is available
    if (canUploadMusic && user) {
      fetchArtistData();
    } else if (canUploadMusic) {
      setIsLoadingArtists(false);
    }
  }, [API_URL, canUploadMusic, user?.role, user?.id, user?.name, user?.email]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file);
        setUploadMessage("");
      } else {
        setUploadMessage("Please select an audio file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file);
        setUploadMessage("");
      } else {
        setUploadMessage("Please select an audio file");
      }
    }
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedCoverImage(file);
        setUploadMessage("");
      } else {
        setUploadMessage("Please select an image file for cover");
      }
    }
  };

  const handleSongFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSongForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handleArtistFormChange removed as artists now upload to their own profile only

  // Helper to format bytes for display (only for selected file)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const [recentUploads, setRecentUploads] = useState<UploadedTrack[]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await fetch(`${API_URL}/api/uploaded-music`);
        const data = await res.json();

        setRecentUploads(data);
        console.log("Recent uploads fetched:", data);
      } catch (err) {
        console.error("Failed to fetch recent uploads:", err);
        setRecentUploads([]);
      }
    };
    fetchUploads();
  }, [API_URL]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select a music file to upload");
      return;
    }

    if (!songForm.songTitle) {
      setUploadMessage("Please enter a song title");
      return;
    }

    if (!songForm.selectedArtistId) {
      setUploadMessage("Please select an artist");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("audio_file", selectedFile);
      formData.append("song_title", songForm.songTitle);
      formData.append("artist_id", songForm.selectedArtistId);
      formData.append("genre", songForm.genre);
      formData.append("description", songForm.description);
      formData.append("release_date", songForm.releaseDate);
      formData.append("lyrics", songForm.lyrics);

      console.log("Uploading with data:", {
        song_title: songForm.songTitle,
        artist_id: songForm.selectedArtistId,
        genre: songForm.genre,
        description: songForm.description,
        release_date: songForm.releaseDate,
        lyrics: songForm.lyrics,
      });

      if (selectedCoverImage) {
        formData.append("cover_image", selectedCoverImage);
      }

      // For FormData uploads, we need to handle headers differently
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/upload-music`, {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Upload response:", result);

        // Show compression statistics
        const stats = result.compression_stats;
        const compressionMessage = `Music uploaded successfully! 
          Original: ${stats.original_size} → Compressed: ${stats.compressed_size} 
          (${stats.compression_ratio}% smaller, saved ${stats.space_saved})`;

        setUploadMessage(compressionMessage);
        console.log(compressionMessage);

        setSelectedFile(null);
        setSelectedCoverImage(null);
        setSongForm({
          songTitle: "",
          selectedArtistId: "",
          genre: "",
          description: "",
          releaseDate: "",
          lyrics: "",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (coverInputRef.current) coverInputRef.current.value = "";
        console.log("Upload result:", result);
      } else {
        const error = await response.json();
        setUploadMessage(`Upload failed: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      setUploadMessage("Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="main-content">
        <div className="container">
          <TopHeader />

          <div className="upload-music__wrapper">
            <h2>Upload Music</h2>

            {!isAuthenticated ? (
              <div className="access-denied">
                <p>Please log in to view upload information.</p>
              </div>
            ) : canUploadMusic ? (
              <>
                <FileUpload
                  selectedFile={selectedFile}
                  isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFileSelect={handleFileSelect}
                  fileInputRef={fileInputRef}
                  formatFileSize={formatFileSize}
                />

                <SongDetailsForm
                  songForm={songForm}
                  onSongFormChange={handleSongFormChange}
                  artists={artists}
                  isLoadingArtists={isLoadingArtists}
                />

                <CoverImageUpload
                  selectedCoverImage={selectedCoverImage}
                  onCoverImageSelect={handleCoverImageSelect}
                  coverInputRef={coverInputRef}
                />

                <UploadActions
                  uploadMessage={uploadMessage}
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  isDisabled={
                    !selectedFile ||
                    !songForm.songTitle ||
                    !songForm.selectedArtistId ||
                    isUploading
                  }
                />
              </>
            ) : (
              <div className="access-denied">
                <p>You need to be an Artist or Administrator to upload music.</p>
                <p>Current role: <strong>{user?.role || 'User'}</strong></p>
              </div>
            )}
          </div>

          {/* Recent Uploads - visible to all authenticated users */}
          {isAuthenticated && <RecentUploads uploads={recentUploads} />}
        </div>
      </main>
    </>
  );
};

export default UploadMusic;
