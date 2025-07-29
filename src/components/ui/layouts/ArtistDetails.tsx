type ArtistDetailsProps = {
  artistImage: string;
  artistName: string;
  albumName?: string;
  songCount: number;
  onPlayAllClick: () => void;
};

const ArtistDetails: React.FC<ArtistDetailsProps> = ({
  artistImage,
  artistName,
  albumName,
  songCount,
  onPlayAllClick,
}) => {
  return (
    <div className="artist-details">
      <figure className="music-list__media">
        <img src={artistImage} alt={artistName} />
      </figure>
      <div className="artist-list__meta">
        {albumName && (
          <p className="artist-list__title albumName">{albumName} by</p>
        )}
        <h2 className="artist-list__title">{artistName}</h2>

        <p className="artist-list__count">{songCount} songs</p>
      </div>
      <a
        href="#"
        className="play-button"
        title="All Songs"
        onClick={(e) => {
          e.preventDefault();
          onPlayAllClick();
        }}
      >
        <img src="/images/play-button.svg" alt="play-button" />
      </a>
    </div>
  );
};

export default ArtistDetails;
