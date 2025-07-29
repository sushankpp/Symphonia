import TopHeader from "../components/ui/headers/TopHeader.tsx";
import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import { PlaylistLists } from "../components/ui/cards/PlaylistsLists.tsx";
import { useFetchPlaylists } from "../hooks/useFetchPlaylists";
import { PlaylistDetails } from "../components/ui/cards/PlaylistDetails.tsx";

export const CreatePlaylist = () => {
  const { playlists, error, createPlaylist } = useFetchPlaylists();

  const handleCreatePlaylist = async (playlistName: string) => {
    try {
      await createPlaylist(playlistName);
    } catch (error) {
      console.error("Error creating playlist:", error);
      throw error;
    }
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="create-playlist__wrapper">
            <h2>Create Playlist</h2>
            {error ? (
              <p className="error">{error}</p>
            ) : (
              <PlaylistLists
                playlists={playlists}
                onAddToPlaylist={() => {}}
                onCreatePlaylist={handleCreatePlaylist}
                className="dialog dialog-popUp"
                showAddToPlaylist={false}
              />
            )}
          </div>

          <div className="playlists-overview__wrapper">
            <h2>All Playlists</h2>
            {error ? (
              <p className="error">{error}</p>
            ) : (
              <PlaylistDetails playlists={playlists as any} />
            )}
          </div>
        </div>
      </main>
    </>
  );
};
