import React, { useEffect, useState } from "react";
import { convertStorageUrl } from "../../../utils/audioDuration.tsx";
import { formatFileSizeFromString, calculateCompressionPercentage } from "../../../utils/fileSize";

interface Artist {
  id: number;
  artist_name: string | object;
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
  artist: Artist;
  song_cover?: string;
  file_path?: string;
  uploaded_at?: string;
  status?: "pending" | "uploaded" | "processing" | "approved" | "rejected";
  upload_status?: "pending" | "uploaded" | "processing" | "approved" | "rejected";
  file_size?: string;
  compression_stats?: CompressionStats;
}

interface RecentUploadsProps {
  uploads: UploadedTrack[];
  onRefresh?: () => void;
}

const RecentUploads: React.FC<RecentUploadsProps> = ({ uploads, onRefresh }) => {
  const [durations, setDurations] = useState<{ [key: number]: string }>({});

  // Filter out duplicates based on title and artist
  const uniqueUploads = uploads.filter((track, index, self) => {
    const trackKey = `${track.title}-${typeof track.artist.artist_name === 'string' ? track.artist.artist_name : JSON.stringify(track.artist.artist_name)}`;
    return index === self.findIndex(t => {
      const tKey = `${t.title}-${typeof t.artist.artist_name === 'string' ? t.artist.artist_name : JSON.stringify(t.artist.artist_name)}`;
      return tKey === trackKey;
    });
  });



  useEffect(() => {
    uniqueUploads.forEach((track) => {
      if (track.file_path) {
        const audioUrl = convertStorageUrl(
          track.file_path,
          import.meta.env.VITE_API_URL
        );
        const audio = new Audio(audioUrl);
        audio.addEventListener("loadedmetadata", () => {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          setDurations((prev) => ({
            ...prev,
            [track.id]: `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`,
          }));
        });
      }
    });
  }, [uniqueUploads]);

  // Debug: Log approved uploads data when it changes
  useEffect(() => {
    if (uploads.length > 0) {
      console.log("=== APPROVED UPLOADS DATA ===");
      console.log("Total uploads:", uploads.length);
      uploads.forEach((track, index) => {
        console.log(`Upload ${index + 1}:`, {
          id: track.id,
          title: track.title,
          artist: track.artist?.artist_name,
          file_size: (track as any).file_size,
          compressed_size: (track as any).compressed_size,
          file_size_bytes: (track as any).file_size_bytes,
          original_size: (track as any).original_size,
          compression_stats: (track as any).compression_stats,
          compression_data: (track as any).compression_data,
          file_stats: (track as any).file_stats,
          size: (track as any).size,
          fileSize: (track as any).fileSize
        });
      });
    }
  }, [uploads]);

  return (
    <div className="recent-uploads__wrapper">
      <div className="recent-uploads-header">
        <h2>Approved Uploads</h2>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="refresh-btn"
            title="Refresh upload status"
          >
            🔄 Refresh
          </button>
        )}
      </div>
      <div className="uploads-list">
        {uploads.length === 0 ? (
          <div className="no-uploads">
            <div className="no-uploads-icon">🎵</div>
            <h3>No Approved Uploads Yet</h3>
            <p>Your approved music uploads will appear here once they've been reviewed by an admin.</p>
            <p>Check your <strong>Upload Requests</strong> page to track the status of your submissions.</p>
          </div>
        ) : (
          uniqueUploads.map((track) => (
          <div key={track.id} className="upload-item">
            <div className="upload-info">
              <div className="track-cover">
                {track.song_cover && (
                  <img
                    src={convertStorageUrl(
                      track.song_cover,
                      import.meta.env.VITE_API_URL
                    )}
                    alt="Song Cover"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      marginRight: 12,
                    }}
                  />
                )}
              </div>
              <div className="track-details">
                <h4 className="track-title">{track.title}</h4>
                <p className="track-artist">
                  {typeof track.artist.artist_name === 'string' 
                    ? track.artist.artist_name 
                    : JSON.stringify(track.artist.artist_name)}
                </p>
              </div>
              <div className="track-meta">
                <span className="duration">
                  {durations[track.id] || "--:--"}
                </span>
                <span className="file-size">
                  {/* Display original and compressed file sizes */}
                  {(track as any).compression_stats && 
                   (track as any).compression_stats.original_size !== "Unknown" && 
                   (track as any).compression_stats.compressed_size ? (
                    <>
                      <span className="original-size">
                        {(track as any).compression_stats.original_size}
                      </span>
                      <span className="arrow">→</span>
                      <span className="compressed-size">
                        {(track as any).compression_stats.compressed_size}
                      </span>
                    </>
                  ) : (
                    (track as any).file_size && (track as any).file_size !== "Unknown" 
                      ? (track as any).file_size 
                      : "--"
                  )}
                </span>
                <span className="upload-date">
                  {track.uploaded_at
                    ? new Date(track.uploaded_at).toLocaleString()
                    : ""}
                </span>

                {((track as any).compression_stats && 
                  (track as any).compression_stats.original_size !== "Unknown" && 
                  (track as any).compression_stats.compressed_size) && (
                  <span
                    className="compression-info"
                    title={`Original: ${(track as any).compression_stats.original_size} | Compressed: ${(track as any).compression_stats.compressed_size} | Saved: ${(track as any).compression_stats.space_saved || "Unknown"}`}
                  >
                    {calculateCompressionPercentage(
                      (track as any).compression_stats.original_size,
                      (track as any).compression_stats.compressed_size
                    )}% smaller
                  </span>
                )}
                <span className={`status status-${track.status || track.upload_status || 'pending'}`}>
                  {(track.status === "uploaded" || track.status === "approved" || 
                    track.upload_status === "uploaded" || track.upload_status === "approved")
                    ? "Approved"
                    : (track.status === "processing" || track.upload_status === "processing")
                      ? "Processing"
                      : (track.status === "rejected" || track.upload_status === "rejected")
                        ? "Rejected"
                        : "Pending"}
                </span>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default RecentUploads;
