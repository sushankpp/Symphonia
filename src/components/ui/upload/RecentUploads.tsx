import React, { useEffect, useState } from "react";

interface Artist {
  id: number;
  artist_name: string;
}

interface UploadedTrack {
  id: number;
  title: string;
  artist: Artist;
  song_cover?: string;
  file_path?: string;
  uploaded_at?: string;
  status?: "pending" | "uploaded" | "processing";
  fileSize?: string;
}

interface RecentUploadsProps {
  uploads: UploadedTrack[];
}

const RecentUploads: React.FC<RecentUploadsProps> = ({ uploads }) => {
  const [durations, setDurations] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    uploads.forEach((track) => {
      if (track.file_path) {
        const audio = new Audio(track.file_path);
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
                    src={track.song_cover}
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
                <p className="track-artist">{track.artist.artist_name}</p>
              </div>
              <div className="track-meta">
                <span className="duration">
                  {durations[track.id] || "--:--"}
                </span>
                <span className="file-size">{track.fileSize || "--"}</span>
                <span className="upload-date">
                  {track.uploaded_at
                    ? new Date(track.uploaded_at).toLocaleString()
                    : ""}
                </span>
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
