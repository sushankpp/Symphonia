import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { Music, Upload, Search, LogIn, Bell, Settings, Star } from "lucide-react";
import LoginRegisterPopup from "../menus/LoginRegisterPopup";
import UserDropdown from "../menus/UserDropdown";
import { convertProfilePictureUrl } from "../../../utils/audioDuration.tsx";

const TopHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userProfileRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    if (path !== "/" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const handleLoginSuccess = (userData: any) => {
    setShowLoginPopup(false);
  };

  const handleUserProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <section className="main-header">
      <div className="main-header__nav">
        <ul className="main-header__nav-items">
          <li>
            <Link to="/music" className={isActive("/music") ? "active" : ""}>
              <Music size={18} />
              Music
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/upload" className={isActive("/upload") ? "active" : ""}>
                <Upload size={18} />
                Upload Music
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="search-music">
        <input
          type="text"
          name="Music-Input"
          id="searchMusic"
          className="search-music__input"
          placeholder="Search music name here"
        />
        <button className="search-music__btn">
          <Search size={18} />
        </button>
      </div>
      <div className="header__links">
        {!isAuthenticated ? (
          <button
            className="header__auth-btn"
            onClick={() => setShowLoginPopup(true)}
          >
            <LogIn size={18} />
            <span>Login / Register</span>
          </button>
        ) : (
          <>
            <Link to="/notification" className="header__link">
              <Bell size={24} />
            </Link>
            <Link to="/ratings" className="header__link">
              <Star size={24} />
            </Link>
            <Link to="/settings" className="header__link">
              <Settings size={24} />
            </Link>
            <a
              href="#"
              ref={userProfileRef}
              onClick={handleUserProfileClick}
              className="user__profile"
            >
              <figure className="header__media">
                <img
                  src={convertProfilePictureUrl(user?.profile_picture || "/uploads/pig.png", apiURL)}
                  alt={user?.name || "user image"}
                />
              </figure>
            </a>
          </>
        )}
      </div>
      <LoginRegisterPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <UserDropdown
        isOpen={showUserDropdown}
        onClose={() => setShowUserDropdown(false)}
        triggerRef={userProfileRef}
      />
    </section>
  );
};

export default TopHeader;
