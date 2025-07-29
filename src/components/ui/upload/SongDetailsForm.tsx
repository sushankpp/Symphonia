import React from "react";

interface Artist {
  id: number;
  artist_name: string;
  email: string;
}

interface SongForm {
  songTitle: string;
  selectedArtistId: string;
  genre: string;
  description: string;
  releaseDate: string;
  lyrics: string;
}

interface SongDetailsFormProps {
  songForm: SongForm;
  onSongFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  artists: Artist[];
  isLoadingArtists: boolean;
}

const SongDetailsForm: React.FC<SongDetailsFormProps> = ({
  songForm,
  onSongFormChange,
  artists,
  isLoadingArtists,
}) => (
  <div className="song-details-section">
    <h3>Song Details</h3>
    <p className="form-description">Provide information about your song.</p>

    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="songTitle">Song Title *</label>
        <input
          type="text"
          id="songTitle"
          name="songTitle"
          value={songForm.songTitle}
          onChange={onSongFormChange}
          placeholder="Enter song title"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="selectedArtistId">Artist *</label>
        <select
          id="selectedArtistId"
          name="selectedArtistId"
          value={songForm.selectedArtistId}
          onChange={onSongFormChange}
          required
          disabled={isLoadingArtists}
        >
          <option value="">
            {isLoadingArtists ? "Loading artists..." : "Select an artist"}
          </option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.artist_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="genre">Genre</label>
        <select
          id="genre"
          name="genre"
          value={songForm.genre}
          onChange={onSongFormChange}
        >
          <option value="">Select a genre</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
          <option value="hip-hop">Hip Hop</option>
          <option value="electronic">Electronic</option>
          <option value="jazz">Jazz</option>
          <option value="classical">Classical</option>
          <option value="country">Country</option>
          <option value="r&b">R&B</option>
          <option value="indie">Indie</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="releaseDate">Release Date</label>
        <input
          type="date"
          id="releaseDate"
          name="releaseDate"
          value={songForm.releaseDate}
          onChange={onSongFormChange}
        />
      </div>

      <div className="form-group full-width">
        <label htmlFor="description">Song Description</label>
        <textarea
          id="description"
          name="description"
          value={songForm.description}
          onChange={onSongFormChange}
          placeholder="Describe your song, inspiration, or any additional information..."
          rows={3}
        />
      </div>

      <div className="form-group full-width">
        <label htmlFor="lyrics">Lyrics (Optional)</label>
        <textarea
          id="lyrics"
          name="lyrics"
          value={songForm.lyrics}
          onChange={onSongFormChange}
          placeholder="Enter song lyrics..."
          rows={6}
        />
      </div>
    </div>
  </div>
);

export default SongDetailsForm;
