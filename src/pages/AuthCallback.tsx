import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        console.log("🚀 AuthCallback component mounted!");
        console.log("✅ Route is working correctly");
        
        // Prevent multiple executions
        if (hasRedirected) {
            console.log("🔄 Already redirected, skipping...");
            return;
        }
        
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
            console.log("✅ User already authenticated, redirecting to home...");
            setHasRedirected(true);
            navigate('/');
            return;
        }
        
        const handleCallback = async () => {
            console.log("=== OAUTH CALLBACK START ===");
            console.log("Current URL:", window.location.href);
            console.log("Pathname:", window.location.pathname);
            console.log("Search:", window.location.search);
            
            // Check for error in URL
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            const success = urlParams.get('success');
            const token = urlParams.get('token');
            const code = urlParams.get('code');
            
            console.log("URL Parameters:", {
                error,
                success,
                token: token ? 'PRESENT' : 'MISSING',
                code: code ? 'PRESENT' : 'MISSING'
            });
            
            if (token) {
                console.log("Token value (first 20 chars):", token.substring(0, 20) + "...");
            }
            
            if (error) {
                console.error("❌ OAuth error:", error);
                setError(error);
                setTimeout(() => navigate('/'), 3000);
                return;
            }
            
            try {
                console.log("🔍 Processing OAuth callback...");
                
                                 // Method 1: Check if we have a Bearer token from the callback
                 if (success === 'true' && token) {
                     console.log("✅ Bearer token received from OAuth callback");
                     
                     // Set the token in authService
                     authService.setToken(token);
                     console.log("🔐 Token set in authService:", authService.getToken() ? "SUCCESS" : "FAILED");
                     
                     // Get user data using the token
                     const userData = await authService.checkAuth();
                     
                     if (userData) {
                         console.log("✅ User data received with Bearer token:", userData);
                         
                         // Update auth state
                         login(userData);
                         console.log("👤 User logged in via context");
                         console.log("🔍 User data in context:", userData);
                         console.log("🔍 Token in authService:", authService.getToken() ? "PRESENT" : "MISSING");
                         
                         // Test the token with a simple API call
                         try {
                             console.log("🧪 Testing token with API call...");
                             const testResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/user`, {
                                 method: 'GET',
                                 headers: {
                                     'Authorization': `Bearer ${token}`,
                                     'Accept': 'application/json',
                                 },
                             });
                             console.log("🧪 Test API response status:", testResponse.status);
                             if (testResponse.ok) {
                                 console.log("✅ Token is working correctly");
                             } else {
                                 console.error("❌ Token test failed:", testResponse.status);
                             }
                         } catch (testError) {
                             console.error("❌ Token test error:", testError);
                         }
                         
                         // Get the original URL to redirect back to
                         const redirectUrl = localStorage.getItem('oauth_redirect_url');
                         localStorage.removeItem('oauth_redirect_url');
                         
                         console.log("🔄 Redirecting to:", redirectUrl || '/');
                         
                         // Set redirect flag to prevent multiple executions
                         setHasRedirected(true);
                         
                         // Redirect back to the original page or home
                         if (redirectUrl && redirectUrl !== window.location.href) {
                             window.location.href = redirectUrl;
                         } else {
                             navigate('/');
                         }
                         return;
                     } else {
                         console.error("❌ Failed to get user data with Bearer token");
                         setError("Failed to authenticate with Bearer token");
                         setTimeout(() => navigate('/'), 3000);
                     }
                 }
                
                // Method 2: Check if we have an authorization code (Google OAuth flow)
                if (code) {
                    console.log("🔍 Authorization code received, exchanging for token...");
                    
                    try {
                        // Exchange the authorization code for a Bearer token
                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/google/callback`, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ code }),
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            console.log("✅ Token exchange successful:", data);
                            
                            if (data.token) {
                                // Set the token in authService
                                authService.setToken(data.token);
                                
                                // Get user data using the token
                                const userData = await authService.checkAuth();
                                
                                if (userData) {
                                    console.log("✅ User data received after token exchange:", userData);
                                    
                                    // Update auth state
                                    login(userData);
                                    
                                    // Get the original URL to redirect back to
                                    const redirectUrl = localStorage.getItem('oauth_redirect_url');
                                    localStorage.removeItem('oauth_redirect_url');
                                    
                                    console.log("🔄 Redirecting to:", redirectUrl || '/');
                                    
                                    // Set redirect flag to prevent multiple executions
                                    setHasRedirected(true);
                                    
                                    // Redirect back to the original page or home
                                    if (redirectUrl && redirectUrl !== window.location.href) {
                                        window.location.href = redirectUrl;
                                    } else {
                                        navigate('/');
                                    }
                                    return;
                                }
                            }
                        } else {
                            const errorData = await response.text();
                            console.error("❌ Token exchange failed:", errorData);
                            setError("Failed to exchange authorization code for token");
                            setTimeout(() => navigate('/'), 3000);
                        }
                    } catch (exchangeError) {
                        console.error("❌ Error during token exchange:", exchangeError);
                        setError("Error during token exchange");
                        setTimeout(() => navigate('/'), 3000);
                    }
                }
                
                // Method 3: Fallback - try to get user data from session
                console.log("🔍 Trying session-based authentication as fallback...");
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/user`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                        credentials: 'include',
                    });
                    
                    if (response.ok) {
                        const userData = await response.json();
                        console.log("✅ User data received from session:", userData);
                        
                                                 // Update auth state
                         login(userData);
                         
                         // Get the original URL to redirect back to
                         const redirectUrl = localStorage.getItem('oauth_redirect_url');
                         localStorage.removeItem('oauth_redirect_url');
                         
                         console.log("🔄 Redirecting to:", redirectUrl || '/');
                         
                         // Set redirect flag to prevent multiple executions
                         setHasRedirected(true);
                         
                         // Redirect back to the original page or home
                         if (redirectUrl && redirectUrl !== window.location.href) {
                             window.location.href = redirectUrl;
                         } else {
                             navigate('/');
                         }
                         return;
                    } else {
                        console.error("❌ Session authentication failed");
                    }
                } catch (sessionError) {
                    console.error("❌ Error during session authentication:", sessionError);
                }
                
                // If we get here, all methods failed
                console.error("❌ All authentication methods failed");
                setError("Authentication failed - no valid token or session found");
                setTimeout(() => navigate('/'), 3000);
                
            } catch (err) {
                console.error("❌ Error during OAuth callback:", err);
                setError("Error during authentication");
                setTimeout(() => navigate('/'), 3000);
            }
            
            setIsProcessing(false);
        };

        handleCallback();
    }, [navigate, login, hasRedirected]);

    if (error) {
        return (
            <div className="auth-callback">
                <div className="auth-callback__error">
                    <h2>Authentication Error</h2>
                    <p>{error}</p>
                    <p>Redirecting to home page...</p>
                    <p style={{ fontSize: '12px', marginTop: '10px' }}>
                        Check the browser console for detailed debugging information
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-callback">
            <div className="auth-callback__loading">
                <div className="loading-spinner"></div>
                <h2>Processing Authentication...</h2>
                <p>Please wait while we complete your login.</p>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                    Check the browser console for debugging information
                </p>
            </div>
        </div>
    );
};

export default AuthCallback; 