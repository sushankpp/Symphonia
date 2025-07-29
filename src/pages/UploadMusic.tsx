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

interface UploadedTrack {
  id: number;
  title: string;
  artist: string;
  fileSize: string;
  duration: string;
  uploadDate: string;
  status: "pending" | "uploaded" | "processing";
}

interface Artist {
  id: number;
  artist_name: string;
  email: string;
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

  const recentUploads: UploadedTrack[] = [
    {
      id: 1,
      title: "Midnight Dreams",
      artist: "Alex Johnson",
      fileSize: "8.5 MB",
      duration: "3:45",
      uploadDate: "2024-01-15",
      status: "uploaded",
    },
    {
      id: 2,
      title: "Ocean Waves",
      artist: "Sarah Chen",
      fileSize: "12.2 MB",
      duration: "4:20",
      uploadDate: "2024-01-14",
      status: "uploaded",
    },
    {
      id: 3,
      title: "Urban Rhythm",
      artist: "Mike Davis",
      fileSize: "6.8 MB",
      duration: "2:55",
      uploadDate: "2024-01-13",
      status: "processing",
    },
    {
      id: 4,
      title: "Sunset Vibes",
      artist: "Emma Wilson",
      fileSize: "9.1 MB",
      duration: "3:30",
      uploadDate: "2024-01-12",
      status: "uploaded",
    },
  ];

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch(`${API_URL}/api/artists`);
        if (response.ok) {
          const data = await response.json();
          setArtists(data);
          console.log(data);
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

      console.log("Selected file details:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
      });

      // ... existing FormData code ...

      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
