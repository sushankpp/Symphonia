import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/style.scss";
import { AuthProvider } from "./contexts/AuthContext";
import { RecommendationProvider } from "./contexts/RecommendationContext";
import Music from "./pages/Music";
import Artists from "./pages/Artists";
import Home from "./pages/Home";
import SongListings from "./pages/SongListings";
import MusicPlayer from "./pages/MusicPlayer";
import Recent from "./pages/Recent";
import Albums from "./pages/Albums";
import Album from "./pages/Album";
import { CreatePlaylist } from "./pages/CreatePlaylist";
import UploadMusic from "./pages/UploadMusic";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminRoleRequests from "./pages/AdminRoleRequests";
import ArtistDashboard from "./pages/ArtistDashboard";
import ArtistMusic from "./pages/ArtistMusic";
import ArtistSongStats from "./pages/ArtistSongStats";
import RoleRequests from "./pages/RoleRequests";
import ArtistUploadRequests from "./pages/ArtistUploadRequests";

const LoginRedirect = () => {
  window.location.href = "/";
  return null;
};

function App() {
  return (
    <AuthProvider>
      <RecommendationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home src={""} />} />
            <Route path="/login" element={<LoginRedirect />} />
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
            <Route path="/settings" element={<Settings />} />
            <Route path="/notification" element={<Notifications />} />

            {/*auth*/}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/*admin routes*/}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route
              path="/admin/role-requests"
              element={<AdminRoleRequests />}
            />

            {/*artist routes*/}
            <Route path="/artist/dashboard" element={<ArtistDashboard />} />
            <Route path="/artist/music" element={<ArtistMusic />} />
            <Route
              path="/artist/music/:songId/stats"
              element={<ArtistSongStats />}
            />
            <Route
              path="/artist/upload-requests"
              element={<ArtistUploadRequests />}
            />

            {/*role requests*/}
            <Route path="/role-requests" element={<RoleRequests />} />
          </Routes>
        </Router>
      </RecommendationProvider>
    </AuthProvider>
  );
}

export default App;
