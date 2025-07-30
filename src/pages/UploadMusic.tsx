import React, { useState, useRef, useEffect } from "react";
import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
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

interface UploadedTrack {
  id: number;
  title: string;
  artist: any;
  file_path?: string;
  song_cover?: string;
  uploaded_at?: string;
  status?: "pending" | "uploaded" | "processing";
  fileSize?: string;
}

const UploadMusic: React.FC = () => {
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

  // Song details form state
  const [songForm, setSongForm] = useState({
    songTitle: "",
    selectedArtistId: "",
    genre: "",
    description: "",
    releaseDate: "",
    lyrics: "",
  });

  // Artist form state
  const [artistForm, setArtistForm] = useState({
    artistName: "",
    email: "",
    phone: "",
    genre: "",
    description: "",
    socialMedia: "",
    website: "",
  });

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch(`${API_URL}/api/artists`);
        if (response.ok) {
          const data = await response.json();
          setArtists(data);
        } else {
          console.error("Failed to fetch artists");
        }
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setIsLoadingArtists(false);
      }
    };

    fetchArtists();
  }, [API_URL]);

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

  const handleArtistFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setArtistForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper to format bytes
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper to fetch file size from URL
  const fetchFileSize = async (url: string): Promise<number> => {
    try {
      const res = await fetch(url, { method: "HEAD" });
      const size = res.headers.get("Content-Length");
      return size ? parseInt(size, 10) : 0;
    } catch {
      return 0;
    }
  };

  const [recentUploads, setRecentUploads] = useState<UploadedTrack[]>([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await fetch(`${API_URL}/api/uploaded-music`);
        const data = await res.json();

        // Calculate file sizes for each track
        const uploadsWithSize = await Promise.all(
          data.map(async (track: UploadedTrack) => {
            let fileSize = "";
            if (track.file_path) {
              const size = await fetchFileSize(track.file_path);
              fileSize = formatFileSize(size);
              console.log(`File size for ${track.title}: ${fileSize}`);
            }
            return { ...track, fileSize };
          })
        );

        setRecentUploads(uploadsWithSize);
        console.log("Recent uploads fetched:", uploadsWithSize);
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

      if (selectedCoverImage) {
        formData.append("cover_image", selectedCoverImage);
      }

      const response = await fetch(`${API_URL}/api/upload-music`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-Custom-Header": "trigger-preflight",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUploadMessage("Music uploaded successfully!");

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
          </div>

          <RecentUploads uploads={recentUploads} />
        </div>
      </main>
    </>
  );
};

export default UploadMusic;
