import React from "react";

type Song = {
    id: number;
    title: string;
    duration: string; // Already formatted as a string
};

type SongsListProps = {
    songs: Song[];
    onSongClick: (songId: number) => void;
    activeMenuId: number | null;
};

const SongsList: React.FC<SongsListProps> = ({songs, activeMenuId, onSongClick}) => {
    return (
        <div className="songs-list">
            <h2 className="songs-list__title">Songs</h2>
            {songs.length > 0 ? (
                songs.map((song) => (
                    <div className="song-items" key={song.id}>
                        <h3 className="song-title" onClick={() => onSongClick(song.id)}>{song.title}</h3>
                        <div className="song-add-fav">
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                <img src="/images/add-plus.svg" alt="add-to-fav" title="add to playlist"/>
                            </a>
                        </div>
                        <p className="song-duration">{song.duration}</p>
                        <div className="song-options" title="more options" onClick={(e) => e.preventDefault()}>
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                <img src="/images/options-icon.svg" alt="options"/>
                            </a>
                            {activeMenuId === song.id && (
                                <div className="options-menu">
                                    <ul>
                                        <li><a href="#">Add to Playlist</a></li>
                                        <li><a href="#">Go to artist</a></li>
                                        <li><a href="#">Go to album</a></li>
                                        <li><a href="#">Share</a></li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p className="info">No songs available</p>
            )}
        </div>
    );
};

export default SongsList;