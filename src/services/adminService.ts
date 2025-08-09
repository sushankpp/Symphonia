import { makeAuthenticatedRequest } from "./apiService";

// Ensure API_BASE_URL always includes /api
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

export interface AdminDashboardStats {
  total_users: number;
  total_artists: number;
  total_admins: number;
  pending_role_requests: number;
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    status: string;
  }>;
  recent_role_requests: Array<{
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
    requested_role: string;
    reason: string;
    status: string;
    created_at: string;
  }>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  profile_picture?: string;
  created_at: string;
  email_verified_at?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  bio?: string;
  address?: string;
  ratings_given?: Array<{
    id: number;
    rating: number;
    comment?: string;
    song: {
      id: number;
      title: string;
      artist: {
        name: string;
      };
    };
    created_at: string;
  }>;
  uploaded_music?: Array<{
    id: number;
    title: string;
    genre: string;
    created_at: string;
    total_plays: number;
    average_rating: number;
  }>;
}

export interface RoleChangeRequest {
  id: number;
  user_id: number;
  requested_role: string;
  current_role: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    profile_picture?: string;
  };
}

export interface UsersResponse {
  data?: User[];
  users?: User[]; // Fallback property in case backend returns 'users' instead of 'data'
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface RoleRequestsResponse {
  data?: RoleChangeRequest[];
  role_requests?: RoleChangeRequest[]; // Fallback property in case backend returns 'role_requests' instead of 'data'
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

class AdminService {
  // Dashboard
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/dashboard`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }

    const result = await response.json();
    console.log("Dashboard stats raw response:", result);
    
    // Handle the response structure based on what the backend actually returns
    if (result.success && result.stats) {
      return result.stats;
    } else if (result.stats) {
      return result.stats;
    } else if (result.data) {
      return result.data;
    }
    
    // If none of the above, return the whole result (fallback)
    return result;
  }

  // User Management
  async getUsers(
    params: {
      page?: number;
      per_page?: number;
      role?: string;
      search?: string;
    } = {}
  ): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params.role) queryParams.append("role", params.role);
    if (params.search) queryParams.append("search", params.search);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const result = await response.json();
    console.log("Admin users raw response:", result);
    
    // Handle different response structures
    if (result.success && result.users) {
      // If the response has { success: true, users: { data: [...], ... } }
      return {
        data: result.users.data || [],
        current_page: result.users.current_page || 1,
        per_page: result.users.per_page || 15,
        total: result.users.total || 0,
        last_page: result.users.last_page || 1,
      };
    }
    
    // If it's already in the expected format, return as is
    return result;
  }

  async getUserById(id: number): Promise<User> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users/${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const result = await response.json();
    console.log("User: " + result.data);
    return result.data;
  }

  async updateUser(
    id: number,
    data: {
      name?: string;
      email?: string;
      role?: string;
      status?: string;
    }
  ): Promise<User> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user");
    }

    const result = await response.json();
    return result.data;
  }

  async deleteUser(id: number): Promise<void> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/users/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }
  }

  // Role Change Requests
  async getRoleRequests(
    params: {
      page?: number;
      per_page?: number;
      status?: string;
    } = {}
  ): Promise<RoleRequestsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params.status) queryParams.append("status", params.status);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/role-requests?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch role requests");
    }

    const result = await response.json();
    console.log("Admin role requests raw response:", result);
    
    // Handle the correct response structure: { success: true, requests: { data: [...], current_page: 1, ... } }
    if (result.success && result.requests) {
      return {
        data: result.requests.data || [],
        current_page: result.requests.current_page || 1,
        per_page: result.requests.per_page || 15,
        total: result.requests.total || 0,
        last_page: result.requests.last_page || 1,
      };
    }
    
    // Fallback for other response structures
    return result;
  }

  async approveRoleRequest(
    id: number,
    adminNotes?: string
  ): Promise<RoleChangeRequest> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/role-requests/${id}/approve`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_notes: adminNotes }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to approve role request");
    }

    const result = await response.json();
    console.log("Approve role request response:", result);
    
    // Handle different response structures
    if (result.success && result.request) {
      return result.request;
    } else if (result.data) {
      return result.data;
    }
    
    return result;
  }

  async rejectRoleRequest(
    id: number,
    adminNotes?: string
  ): Promise<RoleChangeRequest> {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/role-requests/${id}/reject`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_notes: adminNotes }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reject role request");
    }

    const result = await response.json();
    console.log("Reject role request response:", result);
    
    // Handle different response structures
    if (result.success && result.request) {
      return result.request;
    } else if (result.data) {
      return result.data;
    }
    
    return result;
  }
}

export const adminService = new AdminService();
