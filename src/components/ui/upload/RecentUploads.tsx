import React, { useEffect, useState } from "react";
import { convertStorageUrl } from "../../../utils/audioDuration.tsx";

interface Artist {
  id: number;
  artist_name: string;
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

  // Debug: Log the uploads data to see what we're receiving
  useEffect(() => {
    console.log('RecentUploads received data:', uploads);
    uploads.forEach((track, index) => {
      console.log(`Track ${index}:`, {
        id: track.id,
        title: track.title,
        status: track.status,
        artist: track.artist
      });
    });
  }, [uploads]);

  useEffect(() => {
    uploads.forEach((track) => {
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
          uploads.map((track) => (
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
                <span className="file-size">{track.file_size || "--"}</span>
                <span className="upload-date">
                  {track.uploaded_at
                    ? new Date(track.uploaded_at).toLocaleString()
                    : ""}
                </span>
                {track.compression_stats && (
                  <span
                    className="compression-info"
                    title={`Original: ${track.compression_stats.original_size} | Saved: ${track.compression_stats.space_saved}`}
                  >
                    {track.compression_stats.compression_ratio}% smaller
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
