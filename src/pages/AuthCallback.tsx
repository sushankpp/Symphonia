import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            console.log("=== OAUTH CALLBACK START ===");
            
            // Check for error in URL
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            
            if (error) {
                console.error("❌ OAuth error:", error);
                setError(error);
                setTimeout(() => navigate('/'), 3000);
                return;
            }
            
            // Test session first
            console.log("🔍 Testing session...");
            await authService.testSession();
            
            // Check session authentication
            try {
                console.log("🔍 Checking session auth...");
                const userData = await authService.checkSessionAuth();
                
                if (userData) {
                    console.log("✅ User data received:", userData);
                    
                    // Update auth state
                    login(userData);
                    
                    // Get the original URL to redirect back to
                    const redirectUrl = localStorage.getItem('oauth_redirect_url');
                    localStorage.removeItem('oauth_redirect_url');
                    
                    console.log("🔄 Redirecting to:", redirectUrl || '/');
                    
                    // Redirect back to the original page or home
                    if (redirectUrl && redirectUrl !== window.location.href) {
                        window.location.href = redirectUrl;
                    } else {
                        navigate('/');
                    }
                } else {
                    console.error("❌ No user data received");
                    setError("Failed to authenticate with session");
                    setTimeout(() => navigate('/'), 3000);
                }
            } catch (err) {
                console.error("❌ Error getting user data:", err);
                setError("Error during authentication");
                setTimeout(() => navigate('/'), 3000);
            }
            
            setIsProcessing(false);
        };

        handleCallback();
    }, [navigate, login]);

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