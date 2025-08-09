import { makeAuthenticatedRequest } from './apiService';

// Ensure API_BASE_URL always includes /api
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

export interface RoleRequest {
  id: number;
  user_id: number;
  requested_role: string;
  current_role: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RoleRequestsResponse {
  data: RoleRequest[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

class RoleRequestService {
  // Submit new role request
  async submitRoleRequest(data: {
    requested_role: string;
    reason: string;
  }): Promise<RoleRequest> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/role-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit role request');
    }
    
    const result = await response.json();
    return result.data;
  }

  // Get all user's role requests
  async getRoleRequests(): Promise<RoleRequest[]> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/role-requests`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch role requests');
    }
    
    const result = await response.json();
    console.log("User role requests raw response:", result);
    
    // Handle different response structures
    if (result.success && result.requests) {
      // If response has { success: true, requests: [...] }
      return Array.isArray(result.requests) ? result.requests : result.requests.data || [];
    } else if (result.data) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  }

  // Get specific role request
  async getRoleRequest(id: number): Promise<RoleRequest> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/role-requests/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch role request');
    }
    
    const result = await response.json();
    return result.data;
  }

  // Cancel pending role request
  async cancelRoleRequest(id: number): Promise<RoleRequest> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/role-requests/${id}/cancel`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel role request');
    }
    
    const result = await response.json();
    return result.data;
  }
}

export const roleRequestService = new RoleRequestService();
