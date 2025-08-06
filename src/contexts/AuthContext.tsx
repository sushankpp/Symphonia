import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/authService";

interface User {
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(authService.getUser()); // Initialize from localStorage
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { // Only check auth if user is not already in state (from localStorage)
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [user]); // Added user to dependency array to re-run if user changes

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data
    setUser(userData);
  };

  const checkAuth = async () => {
    try {
      const userData = await authService.checkSessionAuth(); // Using authService
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error("Session auth check failed:", error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const csrfToken = await authService.getCSRFToken(); // Get CSRF token for logout
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/session/logout`, { // Corrected endpoint
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken // Use the obtained CSRF token
        },
        credentials: "include",
      });
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
