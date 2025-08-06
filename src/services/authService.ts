class AuthService {
    private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    async getCSRFToken(): Promise<string> {
        try {
            // First, get the CSRF cookie
            const response = await fetch(`${this.baseURL}/sanctum/csrf-cookie`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to get CSRF cookie');
            }

            // Extract the CSRF token from cookies
            const csrfToken = this.getCookie('XSRF-TOKEN');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found in cookies');
            }

            return csrfToken;
        } catch (error) {
            console.error('❌ CSRF token fetch failed:', error);
            throw error;
        }
    }

    async sessionLogin(email: string, password: string) {
        try {
            // Get CSRF token first
            const csrfToken = await this.getCSRFToken();
            
            const response = await fetch(`${this.baseURL}/api/auth/session/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Session login failed:', error);
            throw error;
        }
    }

    async getUserData() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/session/check`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                
                // If the response has authenticated: true and user data
                if (data.authenticated && data.user) {
                    return data.user;
                } else {
                    return null;
                }
            } else {
                const errorData = await response.json();
                console.error('❌ Failed to get user data:', errorData);
                return null;
            }
        } catch (error) {
            console.error('❌ Error getting user data:', error);
            return null;
        }
    }

    async updateProfile(formData: FormData) {
        try {
            // Get CSRF token for profile update
            const csrfToken = await this.getCSRFToken();
            
            const response = await fetch(`${this.baseURL}/api/auth/session/update-profile`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                return data;
            } else {
                // Handle validation errors
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join(', ');
                    throw new Error(`Validation failed: ${errorMessages}`);
                } else if (data.message) {
                    throw new Error(data.message);
                } else {
                    throw new Error('Profile update failed');
                }
            }
        } catch (error) {
            console.error('❌ Profile update error:', error);
            throw error;
        }
    }

    async checkSessionAuth() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/session/check`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok && data.authenticated) {
                return data.user;
            } else {
                return null;
            }
        } catch (error) {
            console.error('❌ Session auth check failed:', error);
            return null;
        }
    }

    async testSession() {
        try {
            const response = await fetch(`${this.baseURL}/api/test-session`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Session test failed:', error);
            return null;
        }
    }

    getCookie(name: string): string {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const token = parts.pop()?.split(';').shift() || '';
            // Decode the token if it's URL encoded
            return decodeURIComponent(token);
        }
        return '';
    }

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

export const authService = new AuthService(); 