import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Calendar,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";
import TopHeader from "../components/ui/headers/TopHeader";
import SidebarHeader from "../components/ui/headers/SidebarHeader";

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
  role: string;
  is_email_verified: boolean;
  created_at: string;
  gender?: string;
  dob?: string;
  phone?: string;
  bio?: string;
  address?: string;
  status: string;
}

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    bio: "",
    address: "",
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("No authentication token found");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setProfileData(data);
      setEditForm({
        name: data.name || "",
        phone: data.phone || "",
        bio: data.bio || "",
        address: data.address || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setPreviewImage(null);
    setEditForm({
      name: profileData?.name || "",
      phone: profileData?.phone || "",
      bio: profileData?.bio || "",
      address: profileData?.address || "",
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("phone", editForm.phone);
      formData.append("bio", editForm.bio);
      formData.append("address", editForm.address);

      if (selectedImage) {
        formData.append("profile_picture", selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      setIsEditing(false);
      setSelectedImage(null);
      setPreviewImage(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="profile-container">
            {isLoading ? (
              <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
              </div>
            ) : error ? (
              <div className="profile-error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={fetchUserProfile} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : !isAuthenticated ? (
              <div className="profile-error">
                <h2>Access Denied</h2>
                <p>Please log in to view your profile.</p>
              </div>
            ) : (
              <>
                <div className="profile-header">
                  <h1>User Profile</h1>
                  <div className="profile-actions">
                    {!isEditing ? (
                      <button onClick={handleEdit} className="edit-btn">
                        <Edit size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="edit-actions">
                        <button onClick={handleSave} className="save-btn">
                          <Save size={16} />
                          Save
                        </button>
                        <button onClick={handleCancel} className="cancel-btn">
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="profile-content">
                  <div className="profile-section">
                    <div className="profile-avatar">
                      <img
                        src={
                          previewImage ||
                          profileData?.profile_picture ||
                          "/uploads/pig.png"
                        }
                        alt={profileData?.name || "Profile"}
                      />
                      {isEditing && (
                        <button
                          onClick={handleImageClick}
                          className="change-photo-btn"
                        >
                          <Camera size={16} />
                          Change Photo
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: "none" }}
                      />
                    </div>
                    <div className="profile-info">
                      {isEditing ? (
                        <div className="edit-form">
                          <div className="form-group">
                            <label>Name</label>
                            <input
                              type="text"
                              name="name"
                              value={editForm.name}
                              onChange={handleInputChange}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Phone</label>
                            <input
                              type="tel"
                              name="phone"
                              value={editForm.phone}
                              onChange={handleInputChange}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Bio</label>
                            <textarea
                              name="bio"
                              value={editForm.bio}
                              onChange={handleInputChange}
                              className="form-textarea"
                              rows={4}
                            />
                          </div>
                          <div className="form-group">
                            <label>Address</label>
                            <input
                              type="text"
                              name="address"
                              value={editForm.address}
                              onChange={handleInputChange}
                              className="form-input"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="profile-details">
                          <div className="detail-item">
                            <User size={16} />
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">
                              {profileData?.name}
                            </span>
                          </div>
                          <div className="detail-item">
                            <Mail size={16} />
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">
                              {profileData?.email}
                            </span>
                            {profileData?.is_email_verified && (
                              <span className="verified-badge">✓ Verified</span>
                            )}
                          </div>
                          {profileData?.phone && (
                            <div className="detail-item">
                              <Phone size={16} />
                              <span className="detail-label">Phone:</span>
                              <span className="detail-value">
                                {profileData.phone}
                              </span>
                            </div>
                          )}
                          {profileData?.dob && (
                            <div className="detail-item">
                              <Calendar size={16} />
                              <span className="detail-label">
                                Date of Birth:
                              </span>
                              <span className="detail-value">
                                {profileData.dob}
                              </span>
                            </div>
                          )}
                          {profileData?.address && (
                            <div className="detail-item">
                              <MapPin size={16} />
                              <span className="detail-label">Address:</span>
                              <span className="detail-value">
                                {profileData.address}
                              </span>
                            </div>
                          )}
                          {profileData?.bio && (
                            <div className="detail-item">
                              <span className="detail-label">Bio:</span>
                              <span className="detail-value">
                                {profileData.bio}
                              </span>
                            </div>
                          )}
                          <div className="detail-item">
                            <span className="detail-label">Role:</span>
                            <span className="detail-value capitalize">
                              {profileData?.role}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Member Since:</span>
                            <span className="detail-value">
                              {new Date(
                                profileData?.created_at || ""
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default UserProfile;
