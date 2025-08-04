import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/style.scss";
import { AuthProvider } from "./contexts/AuthContext";
import Music from "./pages/Music.tsx";
import Artists from "./pages/Artists.tsx";
import Home from "./pages/Home.tsx";
import SongListings from "./pages/SongListings.tsx";
import MusicPlayer from "./pages/MusicPlayer.tsx";
import Recent from "./pages/Recent.tsx";
import Albums from "./pages/Albums.tsx";
import Album from "./pages/Album.tsx";
import { CreatePlaylist } from "./pages/CreatePlaylist.tsx";
import UploadMusic from "./pages/UploadMusic.tsx";
import UserProfile from "./pages/UserProfile.tsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home src={""} />} />
          <Route path="/music" element={<Music />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:id" element={<SongListings />} />
          <Route path="/record" element={<Artists />} />
          <Route path="/player/:artistId/:songId" element={<MusicPlayer />} />

          {/*library*/}
          <Route path="/recent" element={<Recent />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/album/:albumId" element={<Album />} />
          <Route path="/downloads" element={<Artists />} />

          {/*playlists*/}
          <Route path="/create-playlist" element={<CreatePlaylist />} />
          <Route path="/playlist/1" element={<Artists />} />

          {/*top-header*/}
          <Route path="/upload" element={<UploadMusic />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
