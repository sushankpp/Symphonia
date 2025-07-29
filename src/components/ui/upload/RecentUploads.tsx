import React from "react";

interface UploadedTrack {
  id: number;
  title: string;
  artist: string;
  fileSize: string;
  duration: string;
  uploadDate: string;
  status: "pending" | "uploaded" | "processing";
}

interface RecentUploadsProps {
  uploads: UploadedTrack[];
}

const RecentUploads: React.FC<RecentUploadsProps> = ({ uploads }) => (
  <div className="recent-uploads__wrapper">
    <h2>Recent Uploads</h2>

    <div className="uploads-list">
      {uploads.map((track) => (
        <div key={track.id} className="upload-item">
          <div className="upload-info">
            <div className="track-details">
              <h4 className="track-title">{track.title}</h4>
              <p className="track-artist">{track.artist}</p>
            </div>

            <div className="track-meta">
              <span className="file-size">{track.fileSize}</span>
              <span className="duration">{track.duration}</span>
              <span className="upload-date">{track.uploadDate}</span>
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

export default RecentUploads;
