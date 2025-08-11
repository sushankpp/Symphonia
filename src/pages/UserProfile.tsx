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
  Lock,
} from "lucide-react";
import TopHeader from "../components/ui/headers/TopHeader";
import SidebarHeader from "../components/ui/headers/SidebarHeader";
import { authService } from "../services/authService";
import { convertProfilePictureUrl } from "../utils/audioDuration";
import ChangePassword from "../components/ui/forms/ChangePassword";

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
  role: string;
  is_email_verified?: boolean;
  created_at: string;
  gender?: string;
  dob?: string;
  phone?: string;
  bio?: string;
  address?: string;
  status: string;
}

const UserProfile = () => {
  const { isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    bio: "",
    address: "",
    gender: "",
    dob: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log("🔄 Fetching user profile from API...");
      const response = await authService.getUserData();
      
      console.log("📥 API Response - response:", response);
      console.log("📥 API Response - response type:", typeof response);
      console.log("📥 API Response - response keys:", response ? Object.keys(response) : "null");
      
      // Handle different response structures - sometimes the user data is nested
      let userData = response;
      if (response && response.user) {
        userData = response.user;
      } else if (response && response.data) {
        userData = response.data;
      }
      
      if (userData && typeof userData === 'object') {
        console.log("✅ Setting profile data:", userData);
        setProfileData(userData);
        setEditForm({
          name: userData.name || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
          address: userData.address || "",
          gender: userData.gender || "",
          dob: userData.dob || "",
        });
        console.log("✅ Form data set:", {
          name: userData.name || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
          address: userData.address || "",
          gender: userData.gender || "",
          dob: userData.dob || "",
        });
      } else {
        console.error("❌ No valid user data received from API");
        console.error("❌ Expected object with user properties, got:", userData);
        throw new Error("Failed to fetch user profile - no valid user data received");
      }
    } catch (err: any) {
      console.error("❌ fetchUserProfile error:", err);
      setError(err.message || "Failed to fetch user profile");
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
      gender: profileData?.gender || "",
      dob: profileData?.dob || "",
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
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      const formData = new FormData();
      
      if (editForm.name && editForm.name.trim()) {
        formData.append("name", editForm.name.trim());
      }
      
      if (editForm.phone && editForm.phone.trim()) {
        formData.append("phone", editForm.phone.trim());
      }
      
      if (editForm.bio && editForm.bio.trim()) {
        formData.append("bio", editForm.bio.trim());
      }
      
      if (editForm.address && editForm.address.trim()) {
        formData.append("address", editForm.address.trim());
      }

      if (editForm.gender && editForm.gender.trim()) {
        formData.append("gender", editForm.gender.trim());
      }

      if (editForm.dob && editForm.dob.trim()) {
        formData.append("dob", editForm.dob.trim());
      }

      if (selectedImage) {
        formData.append("profile_picture", selectedImage);
      }

      const result = await authService.updateProfile(formData);
      
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      setProfileData(result.user || result);
      setIsEditing(false);
      setSelectedImage(null);
      setPreviewImage(null);
      setSuccessMessage("Profile updated successfully!");
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("❌ Profile update error:", err);
      setError(err.message || "An error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
                      <>
                        <button onClick={handleEdit} className="edit-btn">
                          <Edit size={16} />
                          Edit Profile
                        </button>
                        <button 
                          onClick={() => setShowChangePassword(true)} 
                          className="change-password-btn"
                        >
                          <Lock size={16} />
                          Change Password
                        </button>
                      </>
                    ) : (
                      <div className="edit-actions">
                        <button 
                          onClick={handleSave} 
                          className="save-btn"
                          disabled={isSaving}
                        >
                          <Save size={16} />
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button 
                          onClick={handleCancel} 
                          className="cancel-btn"
                          disabled={isSaving}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Success and Error Messages */}
                {successMessage && (
                  <div className="profile-success">
                    <p>{successMessage}</p>
                  </div>
                )}
                
                {error && (
                  <div className="profile-error">
                    <p>{error}</p>
                  </div>
                )}
                <div className="profile-content">
                  <div className="profile-section">
                    <div className="profile-avatar">
                      <img
                        src={
                          previewImage ||
                          convertProfilePictureUrl(
                            profileData?.profile_picture || "",
                            import.meta.env.VITE_API_URL
                          ) ||
                          "/uploads/pig.png"
                        }
                        alt={profileData?.name || "Profile"}
                        onError={(e) => {
                          console.error(
                            "UserProfile - Profile picture failed to load:",
                            e.currentTarget.src
                          );
                          e.currentTarget.src = "/uploads/pig.png";
                        }}
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
                            <label>Email (Read-only)</label>
                            <input
                              type="email"
                              value={profileData?.email || ""}
                              className="form-input"
                              disabled
                              style={{ backgroundColor: '#f5f5f5', color: '#666' }}
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
                            <label>Date of Birth</label>
                            <input
                              type="date"
                              name="dob"
                              value={editForm.dob}
                              onChange={handleInputChange}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Gender</label>
                            <select
                              name="gender"
                              value={editForm.gender}
                              onChange={handleInputChange}
                              className="form-input"
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
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
                        </div>
                      ) : (
                        <div className="profile-details">
                          <div className="detail-item">
                            <User size={16} />
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">
                              {profileData?.name || "Not set"}
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
                          <div className="detail-item">
                            <Phone size={16} />
                            <span className="detail-label">Phone:</span>
                            <span className={`detail-value ${!profileData?.phone ? 'empty' : ''}`}>
                              {profileData?.phone || "Not set"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <Calendar size={16} />
                            <span className="detail-label">Date of Birth:</span>
                            <span className={`detail-value ${!profileData?.dob ? 'empty' : ''}`}>
                              {profileData?.dob || "Not set"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <User size={16} />
                            <span className="detail-label">Gender:</span>
                            <span className={`detail-value ${!profileData?.gender ? 'empty' : ''}`}>
                              {profileData?.gender || "Not set"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <MapPin size={16} />
                            <span className="detail-label">Address:</span>
                            <span className={`detail-value ${!profileData?.address ? 'empty' : ''}`}>
                              {profileData?.address || "Not set"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Bio:</span>
                            <span className={`detail-value ${!profileData?.bio ? 'empty' : ''}`}>
                              {profileData?.bio || "No bio added yet"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Role:</span>
                            <span className="detail-value capitalize">
                              {profileData?.role || "User"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value capitalize">
                              {profileData?.status || "Active"}
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

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ChangePassword
              email={profileData?.email}
              title="Reset Password"
              showCancelButton={true}
              onSuccess={() => {
                setShowChangePassword(false);
                setSuccessMessage("Password reset email sent successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
              }}
              onCancel={() => setShowChangePassword(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
