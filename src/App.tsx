import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/style.scss";
import { AuthProvider } from "./contexts/AuthContext";
import { RecommendationProvider } from "./contexts/RecommendationContext";
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
import Settings from "./pages/Settings.tsx";
import Notifications from "./pages/Notifications.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";
import AdminRoleRequests from "./pages/AdminRoleRequests.tsx";
import ArtistDashboard from "./pages/ArtistDashboard.tsx";
import ArtistMusic from "./pages/ArtistMusic.tsx";
import ArtistSongStats from "./pages/ArtistSongStats.tsx";
import RoleRequests from "./pages/RoleRequests.tsx";
import ArtistUploadRequests from "./pages/ArtistUploadRequests.tsx";

// Simple Login redirect component
const LoginRedirect = () => {
  // Redirect to home page where users can access the login popup
  window.location.href = '/';
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
            <Route path="/admin/role-requests" element={<AdminRoleRequests />} />
            
            {/*artist routes*/}
            <Route path="/artist/dashboard" element={<ArtistDashboard />} />
            <Route path="/artist/music" element={<ArtistMusic />} />
            <Route path="/artist/music/:songId/stats" element={<ArtistSongStats />} />
            <Route path="/artist/upload-requests" element={<ArtistUploadRequests />} />
            
            {/*role requests*/}
            <Route path="/role-requests" element={<RoleRequests />} />
          </Routes>
        </Router>
      </RecommendationProvider>
    </AuthProvider>
  );
}

export default App;
