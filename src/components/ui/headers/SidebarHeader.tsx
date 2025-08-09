import { Link, useLocation } from "react-router-dom";
import svgSprite from "../../../templates/template-svg.html?raw";
import MenuPlaylist from "../menus/MenuPlaylist.tsx";
import {
  Home,
  Music,
  Users,
  Mic2,
  Clock,
  Disc3,
  Download,
  Shield,
  Crown,
  BarChart3,
  FileText,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
// import svgSprite from '@templates/template-svg.html?raw';

const SidebarHeader = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    if (path !== "/" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <>
      <div
        dangerouslySetInnerHTML={{ __html: svgSprite }}
        style={{ display: "none" }}
      />
      <header className="side-header">
        <div className="header-logo">
          <a href="/">
            <img src="/uploads/symphonia-logo.svg" alt="symphonia-logo" />
          </a>
        </div>
        <div className="header-navigation">
          <div className="header-navigation__items">
            <h2 className="header-navigation__title">Menu</h2>
            <ul className="header-navigation__item">
              <li>
                <Link to="/" className={isActive("/") ? "active" : ""}>
                  <Home size={20} />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/music"
                  className={isActive("/music") ? "active" : ""}
                >
                  <Music size={20} />
                  Music
                </Link>
              </li>
              <li>
                <Link
                  to="/artists"
                  className={isActive("/artists") ? "active" : ""}
                >
                  <Users size={20} />
                  Artists
                </Link>
              </li>
              <li>
                <Link
                  to="/record"
                  className={isActive("/record") ? "active" : ""}
                >
                  <Mic2 size={20} />
                  Record
                </Link>
              </li>
            </ul>
          </div>
          <div className="header-navigation__items">
            <h2 className="header-navigation__title">Library</h2>
            <ul className="header-navigation__item">
              <li>
                <Link
                  to="/recent"
                  className={isActive("/recent") ? "active" : ""}
                >
                  <Clock size={20} />
                  Recent
                </Link>
              </li>
              <li>
                <Link
                  to="/albums"
                  className={isActive("/albums") ? "active" : ""}
                >
                  <Disc3 size={20} />
                  Albums
                </Link>
              </li>
              <li>
                <Link
                  to="/downloads"
                  className={isActive("/downloads") ? "active" : ""}
                >
                  <Download size={20} />
                  Downloads
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Artist Section */}
          {user?.role === 'artist' && (
            <div className="header-navigation__items">
              <h2 className="header-navigation__title">Artist</h2>
              <ul className="header-navigation__item">
                <li>
                  <Link
                    to="/artist/dashboard"
                    className={isActive("/artist/dashboard") ? "active" : ""}
                  >
                    <BarChart3 size={20} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/artist/music"
                    className={isActive("/artist/music") ? "active" : ""}
                  >
                    <Music size={20} />
                    My Music
                  </Link>
                </li>
              </ul>
            </div>
          )}
          
          {/* Admin Section */}
          {user?.role === 'admin' && (
            <div className="header-navigation__items">
              <h2 className="header-navigation__title">Admin</h2>
              <ul className="header-navigation__item">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className={isActive("/admin/dashboard") ? "active" : ""}
                  >
                    <Crown size={20} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/users"
                    className={isActive("/admin/users") ? "active" : ""}
                  >
                    <Users size={20} />
                    Users
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/role-requests"
                    className={isActive("/admin/role-requests") ? "active" : ""}
                  >
                    <FileText size={20} />
                    Role Requests
                  </Link>
                </li>
              </ul>
            </div>
          )}
          
          {/* Role Request Section for Users */}
          {user && user.role !== 'admin' && (
            <div className="header-navigation__items">
              <h2 className="header-navigation__title">Account</h2>
              <ul className="header-navigation__item">
                <li>
                  <Link
                    to="/role-requests"
                    className={isActive("/role-requests") ? "active" : ""}
                  >
                    <Shield size={20} />
                    Role Requests
                  </Link>
                </li>
              </ul>
            </div>
          )}
          
          <MenuPlaylist />
        </div>
      </header>
    </>
  );
};

export default SidebarHeader;
