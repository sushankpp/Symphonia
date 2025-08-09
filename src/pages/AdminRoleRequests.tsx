import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminService, RoleChangeRequest, RoleRequestsResponse } from '../services/adminService';
import SidebarHeader from '../components/ui/headers/SidebarHeader';
import TopHeader from '../components/ui/headers/TopHeader';

const AdminRoleRequests: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RoleChangeRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (statusFilter) params.status = statusFilter;
      
      const response: RoleRequestsResponse = await adminService.getRoleRequests(params);
      console.log("Role requests response:", response);
      console.log("Role requests data:", response.data);
      
      // Handle different response structures
      let requestData = response.data;
      if (!requestData && response.role_requests) {
        requestData = response.role_requests; // Fallback if backend returns 'role_requests' instead of 'data'
      }
      
      setRequests(Array.isArray(requestData) ? requestData : []);
      setCurrentPage(response.current_page || 1);
      setTotalPages(response.last_page || 1);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Error fetching role requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load role requests');
      setRequests([]); // Ensure requests is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleViewRequest = (request: RoleChangeRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setShowRequestModal(true);
  };

  const handleApproveRequest = async (requestId: number, notes?: string) => {
    try {
      setProcessingRequest(requestId);
      const updatedRequest = await adminService.approveRoleRequest(requestId, notes);
      
      setRequests(requests.map(r => r.id === updatedRequest.id ? updatedRequest : r));
      setShowRequestModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: number, notes?: string) => {
    try {
      setProcessingRequest(requestId);
      const updatedRequest = await adminService.rejectRoleRequest(requestId, notes);
      
      setRequests(requests.map(r => r.id === updatedRequest.id ? updatedRequest : r));
      setShowRequestModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'primary';
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
    window.location.href = '/';
    return null;
  }

  // Check if user has admin role
  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="admin-role-requests">
      <div className="page-header">
        <h1>Role Change Requests</h1>
        <p>Review and manage user role change requests</p>
      </div>

      {/* Status Filters */}
      <div className="filters-section">
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('')}
          >
            All Requests
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('approved')}
          >
            Approved
          </button>
          <button
            className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('rejected')}
          >
            Rejected
          </button>
          <button
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('cancelled')}
          >
            Cancelled
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
          <p>Loading role requests...</p>
        </div>
      ) : (
        <>
          <div className="requests-table">
            <div className="table-header">
              <div className="header-cell">User</div>
              <div className="header-cell">Current Role</div>
              <div className="header-cell">Requested Role</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Submitted</div>
              <div className="header-cell">Actions</div>
            </div>

            {requests && requests.length > 0 ? requests.map((request) => (
              <div key={request.id} className="table-row">
                <div className="cell user-cell">
                  <div className="user-avatar">
                    {request.user.profile_picture ? (
                      <img src={request.user.profile_picture} alt={request.user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {request.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <h4>{request.user.name}</h4>
                    <p>{request.user.email}</p>
                  </div>
                </div>
                <div className="cell">
                  <span className={`role-badge ${request.current_role}`}>
                    {request.current_role}
                  </span>
                </div>
                <div className="cell">
                  <span className={`role-badge ${request.requested_role}`}>
                    {request.requested_role}
                  </span>
                </div>
                <div className="cell">
                  <span className={`status-badge ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="cell">
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
                <div className="cell actions-cell">
                  <button
                    onClick={() => handleViewRequest(request)}
                    className="action-btn view-btn"
                  >
                    View Details
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="action-btn approve-btn"
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="action-btn reject-btn"
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )) : null}

            {requests && requests.length === 0 && !loading && (
              <div className="no-data">
                <p>No role requests found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({total} total)
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Role Change Request Details</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="request-details">
                <div className="user-info-section">
                  <h4>User Information</h4>
                  <div className="user-details">
                    <p><strong>Name:</strong> {selectedRequest.user.name}</p>
                    <p><strong>Email:</strong> {selectedRequest.user.email}</p>
                    <p><strong>Current Role:</strong> 
                      <span className={`role-badge ${selectedRequest.current_role}`}>
                        {selectedRequest.current_role}
                      </span>
                    </p>
                    <p><strong>Requested Role:</strong> 
                      <span className={`role-badge ${selectedRequest.requested_role}`}>
                        {selectedRequest.requested_role}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="request-info-section">
                  <h4>Request Information</h4>
                  <div className="request-meta">
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </p>
                    <p><strong>Submitted:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                    {selectedRequest.updated_at !== selectedRequest.created_at && (
                      <p><strong>Last Updated:</strong> {new Date(selectedRequest.updated_at).toLocaleString()}</p>
                    )}
                  </div>

                  <div className="reason-section">
                    <h5>Reason for Role Change:</h5>
                    <div className="reason-text">
                      {selectedRequest.reason}
                    </div>
                  </div>

                  {selectedRequest.admin_notes && (
                    <div className="admin-notes-section">
                      <h5>Admin Notes:</h5>
                      <div className="admin-notes-text">
                        {selectedRequest.admin_notes}
                      </div>
                    </div>
                  )}
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="admin-actions-section">
                    <h4>Admin Actions</h4>
                    <div className="admin-notes-input">
                      <label>Admin Notes (optional):</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        rows={4}
                      />
                    </div>

                    <div className="action-buttons">
                      <button
                        onClick={() => handleApproveRequest(selectedRequest.id, adminNotes)}
                        className="approve-btn"
                        disabled={processingRequest === selectedRequest.id}
                      >
                        {processingRequest === selectedRequest.id ? 'Processing...' : 'Approve Request'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(selectedRequest.id, adminNotes)}
                        className="reject-btn"
                        disabled={processingRequest === selectedRequest.id}
                      >
                        {processingRequest === selectedRequest.id ? 'Processing...' : 'Reject Request'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminRoleRequests;
