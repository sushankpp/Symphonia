import React from "react";

interface UploadActionsProps {
  uploadMessage: string;
  onUpload: () => void;
  isUploading: boolean;
  isDisabled: boolean;
}

const UploadActions: React.FC<UploadActionsProps> = ({
  uploadMessage,
  onUpload,
  isUploading,
  isDisabled,
}) => (
  <div className="upload-actions">
    {uploadMessage && (
      <div
        className={`message ${uploadMessage.includes("successfully") ? "success" : "error"}`}
      >
        {uploadMessage}
      </div>
    )}

    <button className="upload-button" onClick={onUpload} disabled={isDisabled}>
      {isUploading ? "Uploading..." : "Upload Music"}
    </button>
  </div>
);

export default UploadActions;
