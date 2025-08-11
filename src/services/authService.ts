class AuthService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        this.setToken(data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        console.log("Attempting logout...");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Logout response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          console.warn("Logout API call failed:", response.status, errorText);
        } else {
          console.log("Logout successful");
        }
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      console.log("Clearing local authentication data...");
      this.clearToken();
    }
  }

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  async checkAuth() {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      } else {
        this.clearToken();
        return null;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      this.clearToken();
      return null;
    }
  }

  async getUserData() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user data: ${response.status} ${response.statusText}`
        );
      }

      const userData = await response.json();
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Failed to get user data:", error);
      throw error;
    }
  }

  async updateProfile(formData: FormData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/user/profile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update profile: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      } else if (result.data) {
        localStorage.setItem("user", JSON.stringify(result.data));
      }

      return result;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  async changePasswordByEmail(
    email: string,
    newPassword: string
  ): Promise<any> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email,
          new_password: newPassword,
          new_password_confirmation: newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to change password");
    }

    return data;
  }
}

export const authService = new AuthService();
