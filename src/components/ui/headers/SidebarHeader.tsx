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
  Library,
} from "lucide-react";
// import svgSprite from '@templates/template-svg.html?raw';

const SidebarHeader = () => {
  const location = useLocation();

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
          <MenuPlaylist />
        </div>
      </header>
    </>
  );
};

export default SidebarHeader;
