import { useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

interface AuthHeaders {
  headers: HeadersInit;
  isAuthenticated: boolean;
  user: any;
}

export const useAuthHeaders = () => {
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.warn("AuthProvider not available, using default auth headers");
    return {
      getAuthHeaders: async (): Promise<AuthHeaders> => ({
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        isAuthenticated: false,
        user: null,
      }),
      makeAuthenticatedRequest: async (
        url: string,
        options: RequestInit = {}
      ) => {
        return fetch(url, {
          ...options,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...options.headers,
          },
        });
      },
      isAuthenticated: false,
      user: null,
    };
  }

  const { user, isAuthenticated } = authContext;

  const getAuthHeaders = useCallback(async (): Promise<AuthHeaders> => {
    try {
      if (!isAuthenticated || !user) {
        console.log("User not authenticated, returning basic headers");
        return {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          isAuthenticated: false,
          user: null,
        };
      }

      const token = authService.getToken();
      console.log(
        "Bearer Token value:",
        token ? token.substring(0, 20) + "..." : "None"
      );
      // console.log('User data:', user);

      if (!token) {
        console.warn("No Bearer token found, user may need to re-login");
        return {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          isAuthenticated: false,
          user: null,
        };
      }

      return {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        isAuthenticated: true,
        user,
      };
    } catch (error) {
      console.error("Error getting auth headers:", error);
      return {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        isAuthenticated: false,
        user: null,
      };
    }
  }, [isAuthenticated, user]);

  const makeAuthenticatedRequest = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const { headers, isAuthenticated } = await getAuthHeaders();

      const requestOptions: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      return fetch(url, requestOptions);
    },
    [getAuthHeaders]
  );

  const result = useMemo(
    () => ({
      getAuthHeaders,
      makeAuthenticatedRequest,
      isAuthenticated,
      user,
    }),
    [getAuthHeaders, makeAuthenticatedRequest, isAuthenticated, user]
  );

  return result;
};
