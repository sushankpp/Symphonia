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
  status?: "pending" | "uploaded" | "processing";
  file_size?: string;
  compression_stats?: CompressionStats;
}

interface RecentUploadsProps {
  uploads: UploadedTrack[];
}

const RecentUploads: React.FC<RecentUploadsProps> = ({ uploads }) => {
  const [durations, setDurations] = useState<{ [key: number]: string }>({});

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
      <h2>Recent Uploads</h2>
      <div className="uploads-list">
        {uploads.map((track) => (
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
                <span className={`status status-${track.status}`}>
                  {track.status === "uploaded"
                    ? "Uploaded"
                    : track.status === "processing"
                      ? "Processing"
                      : "Pending"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentUploads;
