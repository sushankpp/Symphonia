import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import SongsList from "../components/ui/layouts/SongsList.tsx";
import { useCallback, useEffect, useState } from "react";
import {
  formatTime,
  getAudioDuration,
  convertStorageUrl,
} from "../utils/audioDuration";
import { useNavigate } from "react-router-dom";
import { playSong } from "../utils/playSong";
import { useAuth } from "../contexts/AuthContext";

type Song = {
  id: number;
  title: string;
  file_path: string;
  song_cover?: string;
  song_cover_path?: string;
  cover_image_path?: string;
  duration?: string;
  artist_id?: number;
  album_id?: number;
  genre?: string;
  description?: string;
  views?: number;
  release_date?: string;
  released_date?: string;
};

type Album = {
  id: number;
  title: string;
  cover_image?: string;
  cover_image_path?: string;
  cover_image_url?: string;
  songs: Song[];
  artist_id: number;
  artist_name?: string;
  user_id?: number;
  artists?: {
    id: number;
    artist_name: string;
    user_id: number;
  };
  release_date?: string;
  created_at?: string;
  updated_at?: string;
};

type ArtistSong = {
  id: number;
  title: string;
  file_path: string;
  song_cover_path?: string;
  song_cover_url?: string;
  genre?: string;
  views: number;
  status?: string;
  upload_status?: string;
  album_id?: number;
};

const Albums = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [myAlbums, setMyAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [songDurations, setSongDurations] = useState<{ [key: string]: string }>({});
  
  // Album management state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [availableSongs, setAvailableSongs] = useState<ArtistSong[]>([]);
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  
  // Form state
  const [albumForm, setAlbumForm] = useState({
    title: "",
    release_date: "",
    cover_image: null as File | null,
    selectedSongIds: [] as number[],
  });
  
  const apiURL = import.meta.env.VITE_API_URL;
  const isArtist = user?.role === 'artist';
  


  const fetchAllAlbums = useCallback(async () => {
    try {
      const res = await fetch(`${apiURL}/api/albums`);
      if (!res.ok) throw new Error(res.statusText);
      
      const data = await res.json();
      // Extract albums from the correct response structure
      const albumsArray = data.albums?.data || data.data || [];
      setAlbums(albumsArray);
    } catch (error) {
      console.error("Failed to fetch all albums:", error);
      setAlbums([]); // Set empty array on error
    }
  }, [apiURL]);

  const fetchMyAlbums = useCallback(async () => {
    if (!isArtist || !isAuthenticated) {
      setMyAlbums([]);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiURL}/api/artist/albums`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!res.ok) throw new Error(res.statusText);
      
      const data = await res.json();
      // Extract albums from response
      const albumsArray = data.albums || data.data || [];
      setMyAlbums(albumsArray);
    } catch (error) {
      console.error("Failed to fetch my albums:", error);
      setMyAlbums([]);
    }
  }, [apiURL, isArtist, isAuthenticated]);

  const fetchAvailableSongs = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiURL}/api/artist/music`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter only approved songs that are not already in the album
        const approvedSongs = data.music?.data?.filter((song: ArtistSong) => 
          (song.status === 'approved' || song.upload_status === 'approved') &&
          !selectedAlbum?.songs.some(albumSong => albumSong.id === song.id)
        ) || [];
        setAvailableSongs(approvedSongs);
      }
    } catch (error) {
      console.error("Failed to fetch available songs:", error);
    }
  };

  const fetchAvailableSongsForCreate = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiURL}/api/artist/music`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Filter only approved songs that are not already in any album
        const approvedSongs = data.music?.data?.filter((song: ArtistSong) => 
          (song.status === 'approved' || song.upload_status === 'approved') &&
          !song.album_id // Songs not already in an album
        ) || [];
        
        setAvailableSongs(approvedSongs);
      }
    } catch (error) {
      console.error("Failed to fetch available songs for create:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAllAlbums(), fetchMyAlbums()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAllAlbums, fetchMyAlbums]);

  // Fetch available songs when create modal is opened
  useEffect(() => {
    if (showCreateModal) {
      fetchAvailableSongsForCreate();
    }
  }, [showCreateModal]);

  useEffect(() => {
    // Ensure both arrays are actually arrays before spreading
    const albumsArray = Array.isArray(albums) ? albums : [];
    const myAlbumsArray = Array.isArray(myAlbums) ? myAlbums : [];
    const allAlbums = [...albumsArray, ...myAlbumsArray];
    
    if (allAlbums.length > 0) {
      allAlbums.forEach((album) => {
        if (album && album.songs && Array.isArray(album.songs)) {
          album.songs.forEach((song) => {
            if (song && song.file_path) {
              const convertedUrl = convertStorageUrl(song.file_path, apiURL);
              getAudioDuration(convertedUrl)
                .then((duration) => {
                  const formattedDuration = formatTime(duration);
                  setSongDurations((prev) => ({
                    ...prev,
                    [String(song.id)]: formattedDuration,
                  }));
                })
                .catch((error) => {
                  console.error(
                    `Error fetching duration for song ${song.id}:`,
                    error
                  );
                });
            }
          });
        }
      });
    }
  }, [albums, myAlbums, apiURL]);

  const handleSongClick = async (artistId: number, songId: number) => {
    navigate(`/player/${artistId}/${songId}`);
  };

  // Album management functions
  const handleCreateAlbum = async () => {
    if (!albumForm.title || !albumForm.release_date) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('title', albumForm.title);
      formData.append('release_date', albumForm.release_date);
      
      if (albumForm.cover_image) {
        formData.append('cover_image', albumForm.cover_image);
      }

      // Add selected song IDs to form data
      if (albumForm.selectedSongIds.length > 0) {
        formData.append('song_ids', JSON.stringify(albumForm.selectedSongIds));
      }

      // Log the FormData entries for debugging
      console.log("📤 FormData entries being sent:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await fetch(`${apiURL}/api/artist/albums`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        setAlbumForm({ title: "", release_date: "", cover_image: null, selectedSongIds: [] });
        fetchMyAlbums(); // Refresh my albums
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create album");
      }
    } catch (error) {
      console.error("Album creation failed:", error);
      setError("Failed to create album");
    }
  };

  const handleAddSongsToAlbum = async () => {
    if (!selectedAlbum || selectedSongIds.length === 0) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiURL}/api/artist/albums/${selectedAlbum.id}/add-songs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song_ids: selectedSongIds })
      });

      if (response.ok) {
        setShowAddSongsModal(false);
        setSelectedSongIds([]);
        fetchMyAlbums(); // Refresh my albums
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to add songs to album");
      }
    } catch (error) {
      console.error("Failed to add songs:", error);
      setError("Failed to add songs to album");
    }
  };

  const handleRemoveSongFromAlbum = async (albumId: number, songId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiURL}/api/artist/albums/${albumId}/remove-songs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song_ids: [songId] })
      });

      if (response.ok) {
        fetchMyAlbums(); // Refresh my albums
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to remove song from album");
      }
    } catch (error) {
      console.error("Failed to remove song:", error);
      setError("Failed to remove song from album");
    }
  };

  const handleDeleteAlbum = async (albumId: number) => {
    if (!confirm("Are you sure you want to delete this album?")) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiURL}/api/artist/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        fetchMyAlbums(); // Refresh my albums
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete album");
      }
    } catch (error) {
      console.error("Failed to delete album:", error);
      setError("Failed to delete album");
    }
  };

  const handleEditAlbum = async () => {
    if (!selectedAlbum || !albumForm.title || !albumForm.release_date) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('title', albumForm.title);
      formData.append('release_date', albumForm.release_date);
      
      if (albumForm.cover_image) {
        formData.append('cover_image', albumForm.cover_image);
      }

      const response = await fetch(`${apiURL}/api/artist/albums/${selectedAlbum.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setShowEditModal(false);
        setAlbumForm({ title: "", release_date: "", cover_image: null, selectedSongIds: [] });
        setSelectedAlbum(null);
        fetchMyAlbums(); // Refresh my albums
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update album");
      }
    } catch (error) {
      console.error("Album update failed:", error);
      setError("Failed to update album");
    }
  };

  const openAddSongsModal = (album: Album) => {
    setSelectedAlbum(album);
    setSelectedSongIds([]);
    fetchAvailableSongs();
    setShowAddSongsModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAlbumForm(prev => ({ ...prev, cover_image: file }));
    }
  };

  const renderAlbumCard = (album: Album, isMyAlbum: boolean = false) => {
    // Safety check to ensure album is valid
    if (!album || !album.id || !album.title) {
      return null;
    }

    // Check if user should see action buttons
    const shouldShowActions = isArtist && isAuthenticated && (
      user?.id === album.artists?.user_id || 
      user?.id === album.user_id || 
      isMyAlbum
    );
    

    


    // Ensure songs is an array
    const songs = Array.isArray(album.songs) ? album.songs : [];

    return (
      <div className="album-card" key={album.id}>
        <div className="album-header">
          <div className="album-info">
            <img
              src={album.cover_image_url || "/images/default-cover.jpg"}
              alt={album.title}
              className="album-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/default-cover.jpg";
              }}
            />
            <div className="album-details">
              <h1 className="album-name">{album.title}</h1>
              <p className="album-artist">
                {album.artists?.artist_name || 
                 album.artist_name || 
                 (album.user_id === user?.id ? user?.name : null) ||
                 "Unknown Artist"}
              </p>
              <p className="album-song-count">
                {songs.length} songs
              </p>
              {album.release_date && (
                <p className="album-release-date">
                  Released: {new Date(album.release_date).toLocaleDateString()}
                </p>
              )}
              {isMyAlbum && (
                <span className="album-owner-badge">My Album</span>
              )}
            </div>
          </div>

          {/* Album Actions */}
          <div className="album-actions">
            <button 
              className="action-btn view-btn"
              onClick={() => navigate(`/album/${album.id}`)}
            >
              👁️ View Album
            </button>
            
            {/* Artist Management Actions - only for my albums */}
            {isArtist && isAuthenticated && (
              user?.id === album.artists?.user_id || 
              user?.id === album.user_id || 
              isMyAlbum
            ) && (
              <>
                <button 
                  className="action-btn add-songs-btn"
                  onClick={() => openAddSongsModal(album)}
                >
                  ➕ Add Songs
                </button>
                <button 
                  className="action-btn edit-btn"
                  onClick={() => {
                    setSelectedAlbum(album);
                    setAlbumForm({
                      title: album.title,
                      release_date: album.release_date || "",
                      cover_image: null,
                      selectedSongIds: []
                    });
                    setShowEditModal(true);
                  }}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteAlbum(album.id)}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>

        <SongsList
          songs={songs.map((song) => ({
            id: song.id,
            title: song.title,
            duration: songDurations[String(song.id)] || "--:--",
            song_cover: song.song_cover_path 
              ? convertStorageUrl(song.song_cover_path, apiURL)
              : "",
            artist_name: album.artists?.artist_name || 
                         album.artist_name || 
                         (album.user_id === user?.id ? user?.name : null) ||
                         "Unknown Artist",
            artist_id: song.artist_id,
            album_id: song.album_id,
            genre: song.genre,
            description: song.description,
            views: song.views,
            released_date: song.release_date || song.released_date,
          }))}
          activeMenuId={null}
          onSongClick={(songId) =>
            handleSongClick(album.artist_id || 0, songId)
          }
          artistName={album.artists?.artist_name || 
                      album.artist_name || 
                      (album.user_id === user?.id ? user?.name : null) ||
                      "Unknown Artist"}
          artistImage={album.cover_image_url || ""}
          // Add remove song functionality for my albums only
          onRemoveSong={isArtist && isAuthenticated && (
            user?.id === album.artists?.user_id || 
            user?.id === album.user_id || 
            isMyAlbum
          ) ? (songId) => handleRemoveSongFromAlbum(album.id, songId) : undefined}
        />
      </div>
    );
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          
          {/* Artist Album Creation Section */}
          {isArtist && isAuthenticated && (
            <div className="artist-album-section">
              <div className="artist-album-controls">
                <h2>My Albums</h2>
                <button 
                  className="create-album-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  🎵 Create New Album
                </button>
              </div>

              {myAlbums.length === 0 ? (
                <div className="no-albums">
                  <div className="no-albums-icon">🎵</div>
                  <h3>No Albums Created Yet</h3>
                  <p>Create your first album to get started!</p>
                </div>
                             ) : (
                 <div className="albums-container my-albums">
                   {Array.isArray(myAlbums) && myAlbums.map((album) => renderAlbumCard(album, true))}
                 </div>
               )}
            </div>
          )}

          {/* All Albums Section */}
          <div className="all-albums-section">
            <div className="section-header">
              <h2>All Albums</h2>
              <p>Discover music from all artists</p>
            </div>
            


            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {loading ? (
              <p className="loading">Loading albums...</p>
            ) : (
              <div className="albums-container all-albums">
                {albums.length === 0 ? (
                  <div className="no-albums">
                    <div className="no-albums-icon">🎵</div>
                    <h3>No Albums Available</h3>
                    <p>No albums are available at the moment.</p>
                  </div>
                ) : (
                  <>
                    {Array.isArray(albums) && albums.map((album) => renderAlbumCard(album, false))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Album</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="album-title">Album Title *</label>
                <input
                  type="text"
                  id="album-title"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter album title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="album-release-date">Release Date *</label>
                <input
                  type="date"
                  id="album-release-date"
                  value={albumForm.release_date}
                  onChange={(e) => setAlbumForm(prev => ({ ...prev, release_date: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="album-cover">Cover Image (Optional)</label>
                <input
                  type="file"
                  id="album-cover"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <small>Supported formats: JPEG, PNG, JPG, GIF (max 2MB)</small>
              </div>
              
              <div className="form-group">
                <label>
                  Select Songs for Album (Optional)
                  <button 
                    type="button"
                    className="refresh-songs-btn"
                    onClick={fetchAvailableSongsForCreate}
                    title="Refresh available songs"
                  >
                    🔄
                  </button>
                </label>
                <div className="songs-selection-container">
                  {availableSongs.length === 0 ? (
                    <p className="no-songs-message">No available songs to add to this album.</p>
                  ) : (
                    <div className="songs-selection">
                      {availableSongs.map((song) => (
                        <div 
                          key={song.id} 
                          className={`song-selection-item ${albumForm.selectedSongIds.includes(song.id) ? 'selected' : ''}`}
                          onClick={() => {
                            const newSelectedIds = albumForm.selectedSongIds.includes(song.id) 
                              ? albumForm.selectedSongIds.filter(id => id !== song.id)
                              : [...albumForm.selectedSongIds, song.id];
                            
                            setAlbumForm(prev => ({
                              ...prev,
                              selectedSongIds: newSelectedIds
                            }));
                          }}
                        >
                          <div className="song-info">
                            <span className="song-title">{song.title}</span>
                            <span className="song-genre">{song.genre || 'No genre'}</span>
                          </div>
                          <div className="selection-indicator">
                            {albumForm.selectedSongIds.includes(song.id) ? '✓' : '○'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="selected-songs-summary">
                    {albumForm.selectedSongIds.length > 0 && (
                      <p>Selected {albumForm.selectedSongIds.length} song{albumForm.selectedSongIds.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="action-btn create-btn"
                  onClick={handleCreateAlbum}
                >
                  Create Album
                </button>
                <button 
                  className="action-btn cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Songs Modal */}
      {showAddSongsModal && selectedAlbum && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Songs to "{selectedAlbum.title}"</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddSongsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {availableSongs.length === 0 ? (
                <p>No available songs to add to this album.</p>
              ) : (
                <>
                  <div className="songs-selection">
                    {availableSongs.map((song) => (
                      <div 
                        key={song.id} 
                        className={`song-selection-item ${selectedSongIds.includes(song.id) ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedSongIds(prev => 
                            prev.includes(song.id) 
                              ? prev.filter(id => id !== song.id)
                              : [...prev, song.id]
                          );
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSongIds.includes(song.id)}
                          onChange={() => {}}
                        />
                        <span className="song-title">{song.title}</span>
                        {song.genre && <span className="song-genre">{song.genre}</span>}
                      </div>
                    ))}
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      className="action-btn add-btn"
                      onClick={handleAddSongsToAlbum}
                      disabled={selectedSongIds.length === 0}
                    >
                      Add {selectedSongIds.length} Song{selectedSongIds.length !== 1 ? 's' : ''}
                    </button>
                    <button 
                      className="action-btn cancel-btn"
                      onClick={() => setShowAddSongsModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {showEditModal && selectedAlbum && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Album</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-album-title">Album Title *</label>
                <input
                  type="text"
                  id="edit-album-title"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter album title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-album-release-date">Release Date *</label>
                <input
                  type="date"
                  id="edit-album-release-date"
                  value={albumForm.release_date}
                  onChange={(e) => setAlbumForm(prev => ({ ...prev, release_date: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-album-cover">Cover Image (Optional)</label>
                <input
                  type="file"
                  id="edit-album-cover"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <small>Supported formats: JPEG, PNG, JPG, GIF (max 2MB)</small>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="action-btn create-btn"
                  onClick={handleEditAlbum}
                >
                  Update Album
                </button>
                <button 
                  className="action-btn cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Albums;
