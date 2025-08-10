import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { artistService, MusicUploadRequest } from "../services/artistService";
import { Link } from "react-router-dom";
import SidebarHeader from "../components/ui/headers/SidebarHeader";
import TopHeader from "../components/ui/headers/TopHeader";
import { convertStorageUrl } from "../utils/audioDuration";

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const ArtistUploadRequests: React.FC = () => {
  const { user } = useAuth();
  const [uploadRequests, setUploadRequests] = useState<MusicUploadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(10);

  useEffect(() => {
    fetchUploadRequests();
  }, [statusFilter, currentPage]);

  const fetchUploadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await artistService.getUploadRequests({
        per_page: perPage,
        status: statusFilter,
      });
      
      console.log('Upload requests response:', response);
      
      if (response.success && response.requests) {
        const requests = response.requests.data || [];
        console.log('Upload requests data:', requests);
        
                 // Debug: Check the structure of the first request
         if (requests.length > 0) {
           const firstRequest = requests[0];
           console.log('First request structure:', firstRequest);
           console.log('Available fields:', Object.keys(firstRequest));
           console.log('Status field:', firstRequest.upload_status);
           console.log('Cover path field:', firstRequest.song_cover_path);
         }
        
        setUploadRequests(requests);
        setTotal(response.requests.total || 0);
        setTotalPages(response.requests.last_page || 1);
        setCurrentPage(response.requests.current_page || 1);
      } else {
        setUploadRequests([]);
        setTotal(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error fetching upload requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load upload requests');
      setUploadRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to cancel this upload request? This action cannot be undone.')) {
      return;
    }

    try {
      await artistService.cancelUploadRequest(requestId);
      // Remove the cancelled request from the list
      setUploadRequests(prev => prev.filter(req => req.id !== requestId));
      setTotal(prev => prev - 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    // Handle undefined or null status
    if (!status) {
      return (
        <span className="status-badge pending">
          Pending
        </span>
      );
    }

    const statusClasses = {
      pending: 'status-badge pending',
      approved: 'status-badge approved',
      rejected: 'status-badge rejected',
    };
    
    return (
      <span className={statusClasses[status as keyof typeof statusClasses] || 'status-badge pending'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (user?.role !== "artist") {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You need to be an artist to access this page.</p>
      </div>
    );
  }

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="main-content">
        <div className="container">
          <TopHeader />
          
          <div className="artist-upload-requests">
            <div className="page-header">
              <h1>My Upload Requests</h1>
              <p>Track the status of your music upload requests</p>
            </div>

            {/* Stats Summary */}
            <div className="requests-stats">
              <div className="stat-item">
                <span className="stat-number">
                  {uploadRequests.filter(r => (r.upload_status || r.status) === 'pending').length}
                </span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {uploadRequests.filter(r => (r.upload_status || r.status) === 'approved').length}
                </span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {uploadRequests.filter(r => (r.upload_status || r.status) === 'rejected').length}
                </span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="filter-controls">
              <span>Filter by status:</span>
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setStatusFilter('approved')}
              >
                Approved
              </button>
              <button
                className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected
              </button>
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
                <p>Loading your upload requests...</p>
              </div>
            ) : (
              <>
                <div className="requests-grid">
                  {uploadRequests.length > 0 ? (
                    uploadRequests.map((request) => (
                      <div key={request.id} className="request-card">
                                                                          <div className="request-cover">
                           {request.song_cover_path ? (
                             <img
                               src={convertStorageUrl(
                                 request.song_cover_path,
                                 import.meta.env.VITE_API_URL
                               )}
                               alt={request.title}
                               onError={(e) => {
                                 e.currentTarget.src = "/uploads/pig.png";
                               }}
                             />
                           ) : (
                             <div className="placeholder-cover">
                               🎵
                             </div>
                           )}
                         </div>

                        <div className="request-info">
                          <h3>{request.title}</h3>
                          <p className="genre">{request.genre}</p>
                          
                          {request.description && (
                            <p className="description">{request.description}</p>
                          )}

                          <div className="request-meta">
                            <span className="request-date">
                              Submitted: {formatDate(request.created_at)}
                            </span>
                            {request.updated_at !== request.created_at && (
                              <span className="update-date">
                                Updated: {formatDate(request.updated_at)}
                              </span>
                            )}
                          </div>

                          <div className="request-status">
                            {getStatusBadge(request.upload_status || request.status)}
                          </div>

                          {(request.upload_status || request.status) === 'rejected' && request.admin_notes && (
                            <div className="rejection-notes">
                              <strong>Rejection Reason:</strong>
                              <p>{request.admin_notes}</p>
                            </div>
                          )}

                          <div className="request-actions">
                            {(request.upload_status || request.status) === 'pending' && (
                              <button
                                onClick={() => handleCancelRequest(request.id)}
                                className="action-btn cancel-btn"
                              >
                                Cancel Request
                              </button>
                            )}
                            
                            {(request.upload_status || request.status) === 'approved' && (
                              <Link
                                to="/artist/music"
                                className="action-btn view-btn"
                              >
                                View in Music
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-requests">
                      <div className="no-requests-icon">📭</div>
                      <h3>No Upload Requests Found</h3>
                      <p>
                        {statusFilter === 'all' 
                          ? "You haven't submitted any upload requests yet."
                          : `No ${statusFilter} upload requests found.`
                        }
                      </p>
                      {statusFilter === 'all' && (
                        <Link to="/upload" className="upload-btn">
                          Upload New Music
                        </Link>
                      )}
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

            {/* Quick Actions */}
            <div className="quick-actions">
              <Link to="/upload" className="action-card">
                <div className="action-icon">⬆️</div>
                <h4>Upload New Music</h4>
                <p>Submit a new music upload request</p>
              </Link>

              <Link to="/artist/music" className="action-card">
                <div className="action-icon">🎵</div>
                <h4>My Music</h4>
                <p>View your approved and published music</p>
              </Link>

              <Link to="/artist/dashboard" className="action-card">
                <div className="action-icon">📊</div>
                <h4>Dashboard</h4>
                <p>View your artist dashboard and analytics</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ArtistUploadRequests;
