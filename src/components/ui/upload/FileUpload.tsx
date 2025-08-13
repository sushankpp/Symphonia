import React from "react";
import { formatFileSize } from "../../../utils/fileSize";

interface FileUploadProps {
  selectedFile: File | null;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  selectedFile,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  fileInputRef,
}) => (
  <div className="upload-section">
    <h3>Upload Your Music</h3>

    <div
      className={`file-upload-area ${isDragOver ? "drag-over" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="upload-content">
        <div className="upload-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L12 16M12 2L8 6M12 2L16 6M4 14V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="upload-text">
          {selectedFile
            ? selectedFile.name
            : "Drag and drop your audio file here or click to browse"}
        </p>
        <p className="upload-hint">Supports: MP3, WAV, FLAC, AAC (Max 50MB)</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={onFileSelect}
        style={{ display: "none" }}
      />
    </div>

    {selectedFile && (
      <div className="file-info">
        <p>
          <strong>Selected File:</strong> {selectedFile.name}
        </p>
        <p>
          <strong>Size:</strong> {formatFileSize(selectedFile.size)}
        </p>
        <p>
          <strong>Type:</strong> {selectedFile.type}
        </p>
      </div>
    )}
  </div>
);

export default FileUpload;
