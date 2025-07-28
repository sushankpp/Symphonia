import React from "react";

type OptionsMenuProps = {
  onAddToPlaylist: () => void;
  onGoToArtist: () => void;
  onGoToAlbum: () => void;
  onShare: () => void;
};

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  onAddToPlaylist,
  onGoToArtist,
  onGoToAlbum,
  onShare,
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
