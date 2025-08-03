import React, { useState } from "react";
import { Link } from "react-router-dom";
import OptionsMenu from "../menus/OptionsMenu";
import RatingPopup from "../menus/RatingPopup";
import { convertStorageUrl } from "../../../utils/audioDuration.tsx";
import { sendRating } from "../../../utils/sendRating";

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
  showRatingOption?: boolean;
}

const CardListings: React.FC<CardListingsProps> = ({
  artists,
  title = "Top Artists",
  linkText = "See All",
  style,
  onArtistClick,
  showRatingOption = false,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const apiURL = import.meta.env.VITE_API_URL;

  const toggleMenu = (e: React.MouseEvent, artistId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(activeMenuId === artistId ? null : artistId);
  };

  const handleRate = (artist: Artist) => {
    setSelectedArtist(artist);
    setShowRatingPopup(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!selectedArtist) return;
    
    try {
      await sendRating({
        rateableId: selectedArtist.id,
        rateableType: "artist",
        rating: rating
      });
      
      console.log("Artist rated successfully:", rating);
      setCurrentRating(rating);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".card-listings__options")) {
        setActiveMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
    return (
    <>
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
                {showRatingOption && (
                  <div className="card-listings__options" title="more options">
                    <a href="#" onClick={(e) => toggleMenu(e, artist.id)}>
                      <img src="/images/options-icon.svg" alt="options" />
                    </a>

                    {activeMenuId === artist.id && (
                      <OptionsMenu
                        onAddToPlaylist={() => console.log("Add to playlist")}
                        onGoToArtist={() => onArtistClick(artist.id)}
                        onGoToAlbum={() => console.log("Go to Album")}
                        onShare={() => console.log("Share")}
                        onRate={() => handleRate(artist)}
                        showRateOption={true}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <RatingPopup
        isOpen={showRatingPopup}
        onClose={() => setShowRatingPopup(false)}
        onRate={handleRatingSubmit}
        title={selectedArtist?.artist_name || ""}
        currentRating={currentRating}
        type="artist"
        rateableId={selectedArtist?.id || 0}
      />
    </>
  );
  };

export default CardListings;
