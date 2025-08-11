import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AtSign,
  Calendar,
  Phone,
  Music,
  FileText,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/authService";
import ChangePassword from "../forms/ChangePassword";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface LoginRegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: any) => void;
}

const LoginRegisterPopup = ({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginRegisterPopupProps) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    username: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    artistName: "",
    bio: "",
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const result = await authService.login(
          formData.email,
          formData.password
        );

        console.log("Login successful:", result);

        localStorage.setItem("user", JSON.stringify(result.user));

        login(result.user);

        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }

        onClose();
      } else {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.confirmPassword,
            gender: formData.gender,
            dob: formData.dateOfBirth,
            phone: formData.phoneNumber,
            bio: formData.bio,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        alert("Registration successful!");
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    localStorage.setItem("oauth_redirect_url", window.location.href);

    const callbackUrl = `${window.location.origin}/auth/callback`;
    const googleAuthUrl = `${API_BASE_URL}/api/auth/google?redirect_uri=${encodeURIComponent(callbackUrl)}`;

    console.log("Redirecting to Google OAuth:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const popupContent = (
    <div className="login-popup-overlay" onClick={onClose}>
      <div className="login-popup" onClick={(e) => e.stopPropagation()}>
        <div className="login-popup__header">
          <h2 className="login-popup__title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <button className="login-popup__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="login-popup__content">
          {showChangePassword ? (
            <ChangePassword
              email={formData.email}
              title="Reset Password"
              showCancelButton={true}
              onSuccess={() => {
                setShowChangePassword(false);
                setError("");
              }}
              onCancel={() => {
                setShowChangePassword(false);
                setError("");
              }}
            />
          ) : (
            <>
              {error && <div className="login-popup__error">{error}</div>}

          <div className="login-popup__tabs">
            <button
              className={`login-popup__tab ${isLogin ? "active" : ""}`}
              onClick={() => {
                setIsLogin(true);
                setFormData({
                  email: "",
                  password: "",
                  confirmPassword: "",
                  name: "",
                  username: "",
                  dateOfBirth: "",
                  gender: "",
                  phoneNumber: "",
                  artistName: "",
                  bio: "",
                });
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={`login-popup__tab ${!isLogin ? "active" : ""}`}
              onClick={() => {
                setIsLogin(false);
                setFormData({
                  email: "",
                  password: "",
                  confirmPassword: "",
                  name: "",
                  username: "",
                  dateOfBirth: "",
                  gender: "",
                  phoneNumber: "",
                  artistName: "",
                  bio: "",
                });
                setError("");
              }}
            >
              Register
            </button>
          </div>

          <div className="login-popup__google-section">
            <button
              className="login-popup__google-btn"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            <div className="login-popup__divider">
              <span>or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-popup__form">
            {!isLogin && (
              <>
                <div className="login-popup__field">
                  <label className="login-popup__label">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="login-popup__input"
                    placeholder="Enter your full name"
                    required={!isLogin}
                    disabled={isLoading}
                  />
                </div>

                <div className="login-popup__field">
                  <label className="login-popup__label">
                    <AtSign size={16} />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="login-popup__input"
                    placeholder="Choose a unique username"
                    required={!isLogin}
                    disabled={isLoading}
                  />
                </div>

                <div className="login-popup__field">
                  <label className="login-popup__label">
                    <Calendar size={16} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="login-popup__input"
                    required={!isLogin}
                    disabled={isLoading}
                  />
                </div>

                <div className="login-popup__field">
                  <label className="login-popup__label">
                    <User size={16} />
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="login-popup__input"
                    required={!isLogin}
                    disabled={isLoading}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div className="login-popup__field">
                  <label className="login-popup__label">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="login-popup__input"
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                  />
                </div>

                <div className="login-popup__field">
                  <label className="login-popup__label">
                    <Music size={16} />
                    Artist Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleInputChange}
                    className="login-popup__input"
                    placeholder="Your stage name or artist name"
                    disabled={isLoading}
                  />
                </div>

                <div className="login-popup__field">
                  <label className="login-popup__label">
                    <FileText size={16} />
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="login-popup__input"
                    placeholder="Tell us about yourself..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div className="login-popup__field">
              <label className="login-popup__label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="login-popup__input"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-popup__field">
              <label className="login-popup__label">
                <Lock size={16} />
                Password
              </label>
              <div className="login-popup__password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="login-popup__input"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login-popup__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isLogin && (
                <button
                  type="button"
                  className="login-popup__forgot-password"
                  onClick={() => setShowChangePassword(true)}
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              )}
            </div>

            {!isLogin && (
              <div className="login-popup__field">
                <label className="login-popup__label">
                  <Lock size={16} />
                  Confirm Password
                </label>
                <div className="login-popup__password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="login-popup__input"
                    placeholder="Confirm your password"
                    required={!isLogin}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="login-popup__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <div className="login-popup__actions">
              <button
                type="submit"
                className="login-popup__btn login-popup__btn--submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Loading..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </div>
          </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
};

export default LoginRegisterPopup;
