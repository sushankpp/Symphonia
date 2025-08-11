import React, { useState } from "react";
import { Link } from "react-router-dom";
import OptionsMenu from "../menus/OptionsMenu";
import RatingPopup from "../menus/RatingPopup";
import { convertStorageUrl } from "../../../utils/audioDuration.tsx";
import { sendRating } from "../../../utils/sendRating";
import { getRating } from "../../../utils/getRating";

interface Artist {
  id: number;
  artist_name: string | object;
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
  columns?: number;
}

const CardListings: React.FC<CardListingsProps> = ({
  artists,
  title = "Top Artists",
  linkText = "See All",
  style,
  onArtistClick,
  showRatingOption = false,
  columns = 5,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [artistRatings, setArtistRatings] = useState<Record<number, number>>(
    {}
  );
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const apiURL = import.meta.env.VITE_API_URL;

  const toggleMenu = (e: React.MouseEvent, artistId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(activeMenuId === artistId ? null : artistId);
  };

  const handleRate = async (artist: Artist) => {
    setSelectedArtist(artist);

    if (!artistRatings[artist.id]) {
      try {
        const rating = await getRating({
          rateableId: artist.id,
          rateableType: "artist",
        });
        setArtistRatings((prev) => ({
          ...prev,
          [artist.id]: rating,
        }));
      } catch (error) {
        console.error("Error fetching artist rating:", error);
        setArtistRatings((prev) => ({
          ...prev,
          [artist.id]: 0,
        }));
      }
    }

    setShowRatingPopup(true);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!selectedArtist) return;

    try {
      await sendRating({
        rateableId: selectedArtist.id,
        rateableType: "artist",
        rating: rating,
      });

      console.log("Artist rated successfully:", rating);
      if (selectedArtist) {
        setArtistRatings((prev) => ({
          ...prev,
          [selectedArtist.id]: rating,
        }));
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const getArtistName = (artist: Artist): string => {
    if (!artist || !artist.artist_name) {
      return "Unknown Artist";
    }

    if (typeof artist.artist_name === "string") {
      return artist.artist_name;
    }

    if (typeof artist.artist_name === "object" && artist.artist_name !== null) {
      // If it's an object, try to extract a meaningful name
      const artistNameObj = artist.artist_name as any;
      if (artistNameObj.name) {
        return artistNameObj.name;
      }
      if (artistNameObj.title) {
        return artistNameObj.title;
      }
      if (artistNameObj.artist_name) {
        return artistNameObj.artist_name;
      }
      // If none of the above, stringify it
      try {
        return JSON.stringify(artist.artist_name);
      } catch (error) {
        console.error("Error stringifying artist name:", error);
        return "Unknown Artist";
      }
    }

    return "Unknown Artist";
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
        <div
          className="card-listings__grid"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {artists.map((artist) => {
            const artistName = getArtistName(artist);
            return (
              <div className="card-listings__item" key={artist.id}>
                <button
                  className="screen-link"
                  onClick={() => onArtistClick(artist.id)}
                >
                  {artistName}
                </button>

                <figure className="card-listings__media">
                  <img
                    src={convertStorageUrl(
                      artist.artist_image,
                      import.meta.env.VITE_API_URL
                    )}
                    alt={`${artistName} image`}
                    onError={(e) => {
                      console.error(
                        "Failed to load artist image:",
                        artist.artist_image
                      );
                      console.error(
                        "Converted URL:",
                        convertStorageUrl(
                          artist.artist_image,
                          import.meta.env.VITE_API_URL
                        )
                      );
                      console.error("API URL:", import.meta.env.VITE_API_URL);
                    }}
                  />
                </figure>
                <h2 className="card-listings__item-title">
                  {artistName}
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
        title={
          selectedArtist ? getArtistName(selectedArtist) : ""
        }
        currentRating={
          selectedArtist ? artistRatings[selectedArtist.id] || 0 : 0
        }
        type="artist"
        rateableId={selectedArtist?.id || 0}
      />
    </>
  );
};

export default CardListings;
