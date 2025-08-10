import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminService } from "../services/adminService";
import { MusicUploadRequest } from "../services/artistService";
import { Link } from "react-router-dom";
import SidebarHeader from "../components/ui/headers/SidebarHeader";
import TopHeader from "../components/ui/headers/TopHeader";
import { convertStorageUrl } from "../utils/audioDuration";

type TabType = "overview" | "upload-requests";

interface DashboardStats {
  total_users: number;
  total_artists: number;
  total_admins: number;
  pending_role_requests: number;
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
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

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Upload requests state
  const [requests, setRequests] = useState<MusicUploadRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<MusicUploadRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  // Pagination and filtering for upload requests
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboardStats();
    } else if (activeTab === "upload-requests") {
      fetchRequests();
    }
  }, [activeTab, currentPage, statusFilter, searchQuery]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both dashboard stats and role requests
      const [dashboardResponse, roleRequestsResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRoleRequests(),
      ]);

      console.log("Dashboard response:", dashboardResponse);
      console.log("Role requests response:", roleRequestsResponse);

      // Handle the correct API response structure
      if (dashboardResponse.success && dashboardResponse.stats) {
        const stats = dashboardResponse.stats;

        // Handle role requests data
        let pending_role_requests = 0;
        let recent_role_requests: any[] = [];

                 if (roleRequestsResponse.success && roleRequestsResponse.requests) {
           const requests = roleRequestsResponse.requests.data || [];
           pending_role_requests = requests.filter(
             (req: any) => req.status === "pending"
           ).length;

                     // Get recent role requests (first 5)
           recent_role_requests = requests.slice(0, 5).map((request: any) => ({
            id: request.id,
            user: {
              id: request.user.id,
              name: request.user.name,
              email: request.user.email,
            },
            requested_role: request.requested_role,
            reason: request.reason,
            status: request.status,
            created_at: request.created_at,
          }));
        }

        setStats({
          total_users: stats.total_users || 0,
          total_artists: stats.total_artists || 0,
          total_admins: stats.total_admins || 0,
          pending_role_requests,
          recent_users: stats.recent_users || [],
          recent_role_requests,
        });
      } else {
        // Fallback to default stats
        setStats({
          total_users: 0,
          total_artists: 0,
          total_admins: 0,
          pending_role_requests: 0,
          recent_users: [],
          recent_role_requests: [],
        });
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard stats"
      );
      // Set default stats if API fails
      setStats({
        total_users: 0,
        total_artists: 0,
        total_admins: 0,
        pending_role_requests: 0,
        recent_users: [],
        recent_role_requests: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching upload requests with params:", {
        per_page: perPage,
        status: statusFilter,
        search: searchQuery,
      });

      const response = await adminService.getUploadRequests({
        per_page: perPage,
        status: statusFilter,
        search: searchQuery,
      });

      console.log("Upload requests response:", response);

      if (response.success && response.requests) {
        const requests = response.requests.data || [];
        console.log('AdminDashboard - Requests data:', requests);
        
        // Debug: Check the structure of the first request
        if (requests.length > 0) {
          const firstRequest = requests[0];
          console.log('AdminDashboard - First request structure:', firstRequest);
          console.log('AdminDashboard - Available fields:', Object.keys(firstRequest));
          console.log('AdminDashboard - Cover path field:', firstRequest.song_cover_path);
          console.log('AdminDashboard - All cover-related fields:', {
            song_cover_path: firstRequest.song_cover_path,
            song_cover_url: (firstRequest as any).song_cover_url,
            cover_path: (firstRequest as any).cover_path,
            cover_url: (firstRequest as any).cover_url
          });
        }
        
        setRequests(requests);
        setTotal(response.requests.total || 0);
        setTotalPages(response.requests.last_page || 1);
        setCurrentPage(response.requests.current_page || 1);
      } else {
        setRequests([]);
        setTotal(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Upload requests error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load upload requests"
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    if (!confirm("Are you sure you want to approve this upload request?")) {
      return;
    }

    try {
      await adminService.approveUploadRequest(requestId);
             setRequests(
         requests.map((req) =>
           req.id === requestId
             ? {
                 ...req,
                 status: "approved" as const,
                 upload_status: "approved" as const,
               } as MusicUploadRequest
             : req
         )
       );
      // Also update selectedRequest if it's the same one
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({
          ...selectedRequest,
          status: "approved",
          upload_status: "approved",
        });
      }
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve request"
      );
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!rejectNotes.trim()) {
      setError("Please provide rejection notes");
      return;
    }

    try {
      await adminService.rejectUploadRequest(requestId, rejectNotes);
             setRequests(
         requests.map((req) =>
           req.id === requestId
             ? {
                 ...req,
                 status: "rejected" as const,
                 upload_status: "rejected" as const,
                 admin_notes: rejectNotes,
               } as MusicUploadRequest
             : req
         )
       );
      // Also update selectedRequest if it's the same one
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({
          ...selectedRequest,
          status: "rejected",
          upload_status: "rejected",
          admin_notes: rejectNotes,
        });
      }
      setRejectNotes("");
      setShowRejectModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
    }
  };

  const handleViewDetails = async (requestId: number) => {
    try {
      console.log("Fetching details for request ID:", requestId);
      const details = await adminService.getUploadRequestDetails(requestId);
      console.log("Received details:", details);

      // More detailed validation
      if (!details) {
        console.error("No details received");
        setError("No request details received from server");
        return;
      }

      console.log("Details validation:", {
        hasTitle: !!details.title,
        hasArtist: !!details.artist,
        title: details.title,
        artist: details.artist,
        fullDetails: details,
      });

      // Use fallback data if API doesn't return complete data
      const fallbackRequest = requests.find((req) => req.id === requestId);
      if (fallbackRequest && (!details.title || !details.artist)) {
        console.log(
          "Using fallback request data due to incomplete API response:",
          fallbackRequest
        );
        setSelectedRequest(fallbackRequest);
        setShowDetailsModal(true);
        setError(null);
        return;
      }

      setSelectedRequest(details);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching request details:", err);

      // Fallback: try to find the request in the current list
      const fallbackRequest = requests.find((req) => req.id === requestId);
      if (fallbackRequest) {
        console.log(
          "Using fallback request data due to API error:",
          fallbackRequest
        );
        setSelectedRequest(fallbackRequest);
        setShowDetailsModal(true);
        setError(null);
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load request details"
        );
      }
    }
  };

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  // Check if user has admin role
  if (user?.role !== "admin") {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.total_users}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">🎵</div>
              <div className="stat-content">
                <h3>{stats.total_artists}</h3>
                <p>Artists</p>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <h3>{stats.total_admins}</h3>
                <p>Admins</p>
              </div>
            </div>

            <div className="stat-card pending-requests">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.pending_role_requests}</h3>
                <p>Pending Role Requests</p>
              </div>
              <Link to="/admin/role-requests" className="view-all-link">
                View All
              </Link>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="recent-section">
              <div className="recent-users">
                <div className="section-header">
                  <h3>Recent Users</h3>
                  <Link to="/admin/users" className="view-all-btn">
                    View All Users
                  </Link>
                </div>
                <div className="users-list">
                  {(stats.recent_users || []).map((user) => (
                    <div key={user.id} className="user-item">
                      <div className="user-info">
                        <h4>{user.name}</h4>
                        <p>{user.email}</p>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="user-meta">
                        <span className={`status ${user.status}`}>
                          {user.status}
                        </span>
                        <small>
                          {new Date(user.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recent-requests">
                <div className="section-header">
                  <h3>Recent Role Requests</h3>
                  <Link to="/admin/role-requests" className="view-all-btn">
                    View All Requests
                  </Link>
                </div>
                <div className="requests-list">
                  {(stats.recent_role_requests || []).map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-info">
                        <h4>{request.user.name}</h4>
                        <p>{request.user.email}</p>
                        <div className="request-details">
                          <span className="role-change">
                            Requesting:{" "}
                            <strong>{request.requested_role}</strong>
                          </span>
                          <p className="reason">{request.reason}</p>
                        </div>
                      </div>
                      <div className="request-meta">
                        <span className={`status ${request.status}`}>
                          {request.status}
                        </span>
                        <small>
                          {new Date(request.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/admin/users" className="action-card">
                <div className="action-icon">👥</div>
                <h4>Manage Users</h4>
                <p>View, edit, and manage user accounts</p>
              </Link>

              <Link to="/admin/role-requests" className="action-card">
                <div className="action-icon">📝</div>
                <h4>Role Requests</h4>
                <p>Review and approve role change requests</p>
              </Link>

              <div
                className="action-card"
                onClick={() => setActiveTab("upload-requests")}
              >
                <div className="action-icon">🎵</div>
                <h4>Upload Requests</h4>
                <p>Review and manage music upload requests</p>
              </div>

              <Link to="/admin/users?role=artist" className="action-card">
                <div className="action-icon">🎤</div>
                <h4>Manage Artists</h4>
                <p>View and manage artist accounts</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUploadRequestsTab = () => (
    <div className="upload-requests-tab">
      <div className="page-header">
        <h1>Music Upload Requests</h1>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{total}</span>
            <span className="stat-label">Total Requests</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {
                                 requests.filter(
                   (r) => (r.status === "pending" || r.upload_status === "pending")
                 ).length
              }
            </span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search by title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <span>Filter by status:</span>
          <button
            className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === "approved" ? "active" : ""}`}
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </button>
          <button
            className={`filter-btn ${statusFilter === "rejected" ? "active" : ""}`}
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading upload requests...</p>
        </div>
      ) : (
        <>
          <div className="requests-grid">
            {requests && requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-cover">
                    {(() => {
                      console.log("AdminDashboard - Request cover fields:", {
                        id: request.id,
                        song_cover_path: request.song_cover_path,
                        song_cover_url: (request as any).song_cover_url,
                        cover_path: (request as any).cover_path,
                        cover_url: (request as any).cover_url,
                      });
                      return null;
                    })()}

                    {request.song_cover_path ||
                    (request as any).song_cover_url ||
                    (request as any).cover_path ||
                    (request as any).cover_url ? (
                      <img
                        src={convertStorageUrl(
                          request.song_cover_path ||
                            (request as any).song_cover_url ||
                            (request as any).cover_path ||
                            (request as any).cover_url,
                          import.meta.env.VITE_API_URL
                        )}
                        alt={request.song_title || request.title}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          marginRight: 12,
                        }}
                        onError={(e) => {
                          console.error(
                            "AdminDashboard - Image failed to load:",
                            e.currentTarget.src
                          );
                          e.currentTarget.src = "/uploads/pig.png";
                        }}
                      />
                    ) : (
                      <div className="placeholder-cover">🎵</div>
                    )}
                  </div>

                  <div className="request-info">
                                         <h3>{(request as any).song_title || request.title}</h3>
                                         <p className="artist">
                       by{" "}
                       {request.artist?.artist_name ||
                         (request as any).song_artist?.artist_name}
                     </p>
                    <p className="genre">{request.genre}</p>

                    {request.description && (
                      <p className="description">{request.description}</p>
                    )}

                    <div className="request-meta">
                      <span className="request-date">
                        Requested:{" "}
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="request-actions">
                      <button
                        onClick={() => handleViewDetails(request.id)}
                        className="action-btn details-btn"
                      >
                        View Details
                      </button>

                                             {((request as any).status === "pending" ||
                         request.upload_status === "pending") && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="action-btn approve-btn"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                            className="action-btn reject-btn"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-requests">
                <div className="no-requests-icon">📭</div>
                <h3>No Upload Requests Found</h3>
                <p>There are currently no music upload requests to review.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="admin-dashboard">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${activeTab === "upload-requests" ? "active" : ""}`}
                onClick={() => setActiveTab("upload-requests")}
              >
                Upload Requests
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "overview" && renderOverviewTab()}
              {activeTab === "upload-requests" && renderUploadRequestsTab()}
            </div>
          </div>
        </div>
      </main>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Request Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="request-details">
                <div className="detail-row">
                  <strong>Title:</strong>{" "}
                  <span style={{ color: "#1f2937" }}>
                    {selectedRequest.song_title ||
                      selectedRequest.title ||
                      "No title available"}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Artist:</strong>{" "}
                  <span style={{ color: "#1f2937" }}>
                    {selectedRequest.artist?.artist_name ||
                      selectedRequest.song_artist?.artist_name ||
                      "No artist available"}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Genre:</strong>{" "}
                  <span style={{ color: "#1f2937" }}>
                    {selectedRequest.genre || "No genre available"}
                  </span>
                </div>
                {selectedRequest.description && (
                  <div className="detail-row">
                    <strong>Description:</strong>{" "}
                    <span style={{ color: "#1f2937" }}>
                      {selectedRequest.description}
                    </span>
                  </div>
                )}
                {selectedRequest.release_date && (
                  <div className="detail-row">
                    <strong>Release Date:</strong>{" "}
                    <span style={{ color: "#1f2937" }}>
                      {selectedRequest.release_date}
                    </span>
                  </div>
                )}
                {selectedRequest.lyrics && (
                  <div className="detail-row">
                    <strong>Lyrics:</strong>
                    <div
                      className="lyrics-content"
                      style={{ color: "#1f2937" }}
                    >
                      {selectedRequest.lyrics}
                    </div>
                  </div>
                )}
                <div className="detail-row">
                  <strong>Status:</strong>{" "}
                  <span style={{ color: "#1f2937" }}>
                    {selectedRequest.status ||
                      selectedRequest.upload_status ||
                      "Unknown"}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Requested:</strong>{" "}
                  <span style={{ color: "#1f2937" }}>
                    {selectedRequest.created_at
                      ? new Date(selectedRequest.created_at).toLocaleString()
                      : "Unknown date"}
                  </span>
                </div>
                {selectedRequest.status === "rejected" &&
                  selectedRequest.admin_notes && (
                    <div className="detail-row">
                      <strong>Rejection Notes:</strong>{" "}
                      <span style={{ color: "#1f2937" }}>
                        {selectedRequest.admin_notes}
                      </span>
                    </div>
                  )}
              </div>

              {/* Action buttons for pending requests */}
              {(selectedRequest.status === "pending" ||
                selectedRequest.upload_status === "pending") && (
                <div className="modal-actions">
                  <button
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                    className="action-btn approve-btn"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRejectModal(true);
                    }}
                    className="action-btn reject-btn"
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reject Upload Request</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Please provide a reason for rejecting "
                {selectedRequest.song_title || selectedRequest.title}":
              </p>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Enter rejection reason..."
                className="reject-notes-input"
                rows={4}
              />
              <div className="modal-actions">
                <button
                  onClick={() => handleRejectRequest(selectedRequest.id)}
                  className="action-btn reject-btn"
                  disabled={!rejectNotes.trim()}
                >
                  Reject Request
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="action-btn cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
