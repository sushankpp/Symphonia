import React from "react";

type OptionsMenuProps = {
  onAddToPlaylist: () => void;
  onGoToArtist: () => void;
  onGoToAlbum: () => void;
  onShare: () => void;
  onRate?: () => void;
  showRateOption?: boolean;
};

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  onAddToPlaylist,
  onGoToArtist,
  onGoToAlbum,
  onShare,
  onRate,
  showRateOption = false,
}) => {
  return (
    <div className="options-menu">
      <ul>
        <li>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              onAddToPlaylist();
            }}
          >
            Add to Playlist
          </a>
        </li>
        {showRateOption && onRate && (
          <li>
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                onRate();
              }}
            >
              Rate
            </a>
          </li>
        )}
        <li>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              onGoToArtist();
            }}
          >
            Go to artist
          </a>
        </li>
        <li>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              onGoToAlbum();
            }}
          >
            Go to album
          </a>
        </li>
        <li>
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              onShare();
            }}
          >
            Share
          </a>
        </li>
      </ul>
    </div>
  );
};

export default OptionsMenu;
