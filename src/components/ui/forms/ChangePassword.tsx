import React, { useState } from 'react';
import { authService } from '../../../services/authService';
import './ChangePassword.scss';

interface ChangePasswordProps {
  email?: string; // For login form (email-based change)
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  title?: string;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  email,
  onSuccess,
  onCancel,
  showCancelButton = true,
  title = "Change Password"
}) => {
  const [formData, setFormData] = useState({
    email: email || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await authService.changePasswordByEmail(formData.email, formData.newPassword);
      setMessage('Password changed successfully! You can now login with your new password.');

      // Clear form
      setFormData({
        email: email || '',
        newPassword: '',
        confirmPassword: ''
      });

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);

    } catch (error) {
      console.error('Change password error:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password">
      <div className="change-password__header">
        <h3>{title}</h3>
        {showCancelButton && onCancel && (
          <button 
            type="button" 
            className="change-password__close"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="change-password__form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="Enter your new password"
            className={errors.newPassword ? 'error' : ''}
          />
          {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
          <small className="form-help">Password must be at least 8 characters long</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your new password"
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="form-actions">
          {showCancelButton && onCancel && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
