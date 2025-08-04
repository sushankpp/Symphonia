import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const UserDropdown = ({ isOpen, onClose, triggerRef }: UserDropdownProps) => {
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  const dropdownContent = (
    <div className="user-dropdown-overlay">
      <div ref={dropdownRef} className="user-dropdown">
        <div className="user-dropdown__header">
          <div className="user-dropdown__user-info">
            <img
              src={user?.profile_picture || "/uploads/pig.png"}
              alt={user?.name || "user"}
              className="user-dropdown__avatar"
            />
            <div className="user-dropdown__details">
              <h4 className="user-dropdown__name">{user?.name || "User"}</h4>
              <p className="user-dropdown__email">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="user-dropdown__menu">
          <a href="/profile" className="user-dropdown__item">
            <User size={16} />
            <span>User Profile</span>
          </a>
          <button
            onClick={handleLogout}
            className="user-dropdown__item user-dropdown__item--logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dropdownContent, document.body);
};

export default UserDropdown;
