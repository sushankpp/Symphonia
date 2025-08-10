import { makeAuthenticatedRequest } from './apiService';
import { MusicUploadRequest, AdminUploadRequestsResponse } from './artistService';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

class AdminService {
  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/dashboard`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return await response.json();
  }

  // User Management
  async getUsers(params: {
    per_page?: number;
    search?: string;
    role?: string;
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return await response.json();
  }

  async updateUserRole(userId: number, role: string): Promise<any> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users/${userId}/role`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user role');
    }
    
    return await response.json();
  }

  async deleteUser(userId: number): Promise<void> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users/${userId}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  async getUserById(userId: number): Promise<any> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users/${userId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    
    return await response.json();
  }

  async updateUser(userId: number, userData: any): Promise<any> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users/${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }
    
    return await response.json();
  }

  // Role Requests Management
  async getRoleRequests(params: {
    per_page?: number;
    status?: 'pending' | 'approved' | 'rejected';
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.status) queryParams.append('status', params.status);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/role-requests?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch role requests');
    }
    
    return await response.json();
  }

  async approveRoleRequest(requestId: number): Promise<any> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/role-requests/${requestId}/approve`,
      {
        method: 'POST',
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve role request');
    }
    
    return await response.json();
  }

  async rejectRoleRequest(requestId: number, reason?: string): Promise<any> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/role-requests/${requestId}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject role request');
    }
    
    return await response.json();
  }

  // Music Upload Requests Management
  async getUploadRequests(params: {
    per_page?: number;
    status?: 'all' | 'pending' | 'approved' | 'rejected';
    search?: string;
  } = {}): Promise<AdminUploadRequestsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/music-upload-requests?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch upload requests');
    }
    
    return await response.json();
  }

  async approveUploadRequest(requestId: number): Promise<any> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/music-upload-requests/${requestId}/approve`,
      {
        method: 'POST',
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve upload request');
    }
    
    return await response.json();
  }

  async rejectUploadRequest(requestId: number, notes: string): Promise<any> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/music-upload-requests/${requestId}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject upload request');
    }
    
    return await response.json();
  }

  async getUploadRequestDetails(requestId: number): Promise<MusicUploadRequest> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/music-upload-requests/${requestId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch upload request details');
    }
    
    const result = await response.json();
    // Handle different possible response structures
    return result.request || result.data || result;
  }
}

export const adminService = new AdminService();
