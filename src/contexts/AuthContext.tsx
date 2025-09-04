import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
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
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Ensure isAuthenticated is never undefined during loading
  useEffect(() => {
    if (!isLoading && !user && authService.isAuthenticated()) {
      // Force a re-render with the correct authentication state
      checkAuth();
    }
  }, [isLoading, user]);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const checkAuth = async () => {
    try {
      const userData = await authService.checkAuth();
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Ensure isAuthenticated is always a boolean, not undefined
  const isAuthenticated = Boolean(user && authService.isAuthenticated());

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
