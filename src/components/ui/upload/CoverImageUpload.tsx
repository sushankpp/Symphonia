import React from "react";

interface CoverImageUploadProps {
  selectedCoverImage: File | null;
  onCoverImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  selectedCoverImage,
  onCoverImageSelect,
  coverInputRef,
}) => (
  <div className="cover-upload-section">
    <h3>Cover Image</h3>
    <p className="form-description">
      Upload a cover image for your song (optional but recommended).
    </p>

    <div
      className="cover-upload-area"
      onClick={() => coverInputRef.current?.click()}
    >
      <div className="cover-upload-content">
        {selectedCoverImage ? (
          <div className="cover-preview">
            <img
              src={URL.createObjectURL(selectedCoverImage)}
              alt="Cover preview"
              className="cover-image"
            />
            <p className="cover-filename">{selectedCoverImage.name}</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="upload-text">Click to upload cover image</p>
            <p className="upload-hint">Supports: JPG, PNG, WebP (Max 5MB)</p>
          </>
        )}
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={onCoverImageSelect}
        style={{ display: "none" }}
      />
    </div>
  </div>
);

export default CoverImageUpload;
