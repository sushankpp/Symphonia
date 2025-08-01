import * as React from "react";
import { Link } from "react-router-dom";
import { convertStorageUrl } from "../../../utils/audioDuration.tsx";

interface Artist {
  id: number;
  artist_name: string;
  artist_image: string;
  music_count: number;
}

interface CardListingsProps {
  artists: Artist[];
  title?: string;
  linkText?: string;
  style?: React.CSSProperties;
  onArtistClick: (artistId: number) => void;
}

const CardListings: React.FC<CardListingsProps> = ({
  artists,
  title = "Top Artists",
  linkText = "See All",
  style,
  onArtistClick,
}) => {
  return (
    <section className="card-listings">
      <div className="card-listings__header">
        <h2 className="card-listings__title" style={style}>
          {title}
        </h2>
        <Link to="/artists" className="card-listings__link">
          {linkText}
        </Link>
      </div>
      <div className="card-listings__grid">
        {artists.map((artist) => {
          return (
            <div className="card-listings__item" key={artist.id}>
              <button
                className="screen-link"
                onClick={() => onArtistClick(artist.id)}
              >
                {artist.artist_name}
              </button>

              <figure className="card-listings__media">
                <img
                  src={convertStorageUrl(artist.artist_image, import.meta.env.VITE_API_URL)}
                  alt={`${artist.artist_name} image`}
                  onError={(e) => {
                    console.error("Failed to load artist image:", artist.artist_image);
                    console.error("Converted URL:", convertStorageUrl(artist.artist_image, import.meta.env.VITE_API_URL));
                    console.error("API URL:", import.meta.env.VITE_API_URL);
                  }}
                />
              </figure>
              <h2 className="card-listings__item-title">
                {artist.artist_name}
              </h2>
              <p className="card-listings__item-count">
                <span>{artist.music_count} songs</span>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CardListings;
