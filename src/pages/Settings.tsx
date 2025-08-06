import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
} from "lucide-react";
import TopHeader from "../components/ui/headers/TopHeader";
import SidebarHeader from "../components/ui/headers/SidebarHeader";

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: "en",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement settings save functionality
    console.log("Saving settings:", settings);
  };

  if (!isAuthenticated) {
    return (
      <>
        <SidebarHeader />
        <main className="page__home" id="primary">
          <div className="container">
            <TopHeader />
            <div className="settings-container">
              <div className="settings-error">
                <h2>Access Denied</h2>
                <p>Please log in to access settings.</p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="settings-container">
            <div className="settings-header">
              <h1>
                <SettingsIcon size={24} />
                Settings
              </h1>
            </div>

            <div className="settings-content">
              <div className="settings-section">
                <h2>Notifications</h2>
                <div className="setting-item">
                  <div className="setting-info">
                    <Bell size={20} />
                    <div>
                      <h3>Push Notifications</h3>
                      <p>Receive notifications for new music and updates</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange("notifications", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <Bell size={20} />
                    <div>
                      <h3>Email Updates</h3>
                      <p>Receive email notifications for important updates</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.emailUpdates}
                      onChange={(e) => handleSettingChange("emailUpdates", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h2>Appearance</h2>
                <div className="setting-item">
                  <div className="setting-info">
                    <Palette size={20} />
                    <div>
                      <h3>Dark Mode</h3>
                      <p>Switch between light and dark themes</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => handleSettingChange("darkMode", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h2>Language</h2>
                <div className="setting-item">
                  <div className="setting-info">
                    <Globe size={20} />
                    <div>
                      <h3>Language</h3>
                      <p>Choose your preferred language</p>
                    </div>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange("language", e.target.value)}
                    className="language-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <div className="settings-actions">
                <button onClick={handleSaveSettings} className="save-settings-btn">
                  <Save size={16} />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings; 