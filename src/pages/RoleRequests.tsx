import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  roleRequestService,
  RoleRequest,
} from "../services/roleRequestService";
import SidebarHeader from "../components/ui/headers/SidebarHeader";
import TopHeader from "../components/ui/headers/TopHeader";

const RoleRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [requestedRole, setRequestedRole] = useState<"artist" | "admin">(
    "artist"
  );
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  const fetchRoleRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleRequestService.getRoleRequests();
      const validRequests = Array.isArray(data)
        ? data.filter((req) => req && typeof req === "object")
        : [];
      setRequests(validRequests);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load role requests"
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const newRequest = await roleRequestService.submitRoleRequest({
        requested_role: requestedRole,
        reason: reason.trim(),
      });

      if (newRequest && typeof newRequest === "object") {
        setRequests([newRequest, ...(Array.isArray(requests) ? requests : [])]);
      }
      setShowRequestForm(false);
      setReason("");
      setRequestedRole("artist");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit role request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm("Are you sure you want to cancel this request?")) {
      return;
    }

    try {
      const updatedRequest =
        await roleRequestService.cancelRoleRequest(requestId);
      if (updatedRequest && typeof updatedRequest === "object") {
        setRequests(
          (Array.isArray(requests) ? requests : [])
            .filter((req) => req && typeof req === "object")
            .map((req) => (req.id === updatedRequest.id ? updatedRequest : req))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "cancelled":
        return "secondary";
      default:
        return "primary";
    }
  };

  const canSubmitNewRequest = () => {
    // Return false if still loading or if requests is undefined/null
    if (loading || !requests || !Array.isArray(requests)) {
      return false;
    }

    // Check if user already has a pending request
    // Filter out any null/undefined items and then check for pending status
    const hasPendingRequest = requests.some(
      (req) => req && req.status === "pending"
    );
    return !hasPendingRequest;
  };

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="role-requests">
            <div className="page-header">
              <h1>Role Change Requests</h1>
              <p>Request a role change and track your submissions</p>
            </div>

            {user && (
              <div className="current-role-info">
                <div className="role-card">
                  <h3>Current Role</h3>
                  <span className={`role-badge ${user.role}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <p>
                    {user.role === "user" &&
                      "You can request to become an Artist or Admin"}
                    {user.role === "artist" &&
                      "You can request to become an Admin"}
                    {user.role === "admin" &&
                      "You have the highest level access"}
                  </p>
                </div>
              </div>
            )}

            {/* Submit New Request */}
            {user?.role !== "admin" && canSubmitNewRequest() && (
              <div className="submit-request-section">
                {!showRequestForm ? (
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="submit-request-btn"
                  >
                    Submit New Role Request
                  </button>
                ) : (
                  <div className="request-form-container">
                    <div className="form-header">
                      <h3>Submit Role Change Request</h3>
                      <button
                        onClick={() => setShowRequestForm(false)}
                        className="close-btn"
                      >
                        ×
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmitRequest}
                      className="request-form"
                    >
                      <div className="form-group">
                        <label>Requested Role</label>
                        <select
                          value={requestedRole}
                          onChange={(e) =>
                            setRequestedRole(
                              e.target.value as "artist" | "admin"
                            )
                          }
                          required
                        >
                          {user?.role === "user" && (
                            <>
                              <option value="artist">Artist</option>
                              <option value="admin">Admin</option>
                            </>
                          )}
                          {user?.role === "artist" && (
                            <option value="admin">Admin</option>
                          )}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Reason for Role Change</label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Please explain why you're requesting this role change. Include relevant experience, qualifications, or reasons..."
                          rows={6}
                          required
                          minLength={50}
                        />
                        <div className="character-count">
                          {reason.length} characters (minimum 50)
                        </div>
                      </div>

                      <div className="role-requirements">
                        <h4>Requirements for {requestedRole} role:</h4>
                        {requestedRole === "artist" ? (
                          <ul>
                            <li>
                              Must be a genuine music creator or performer
                            </li>
                            <li>Should have music content to share</li>
                            <li>Committed to engaging with the community</li>
                          </ul>
                        ) : (
                          <ul>
                            <li>
                              Must have relevant experience in music or
                              administration
                            </li>
                            <li>Should demonstrate leadership qualities</li>
                            <li>
                              Committed to helping moderate and manage the
                              platform
                            </li>
                          </ul>
                        )}
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={() => setShowRequestForm(false)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="submit-btn"
                          disabled={submitting || reason.length < 50}
                        >
                          {submitting ? "Submitting..." : "Submit Request"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Pending Request Notice */}
            {!canSubmitNewRequest() && (
              <div className="pending-request-notice">
                <div className="notice-content">
                  <h3>⏳ Pending Request</h3>
                  <p>
                    You have a pending role request. Please wait for admin
                    review before submitting a new request.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {/* Request History */}
            <div className="requests-history">
              <h3>Your Request History</h3>

              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading your requests...</p>
                </div>
              ) : !requests || requests.length === 0 ? (
                <div className="no-requests">
                  <div className="no-requests-icon">📝</div>
                  <h4>No requests submitted yet</h4>
                  <p>You haven't submitted any role change requests.</p>
                </div>
              ) : (
                <div className="requests-list">
                  {(requests || [])
                    .filter((req) => req && typeof req === "object")
                    .map((request) => (
                      <div key={request.id} className="request-item">
                        <div className="request-header">
                          <div className="request-title">
                            <h4>
                              {request.current_role} → {request.requested_role}
                            </h4>
                            <span
                              className={`status-badge ${getStatusColor(request.status)}`}
                            >
                              {request.status}
                            </span>
                          </div>
                          <div className="request-date">
                            Submitted:{" "}
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="request-body">
                          <div className="request-reason">
                            <h5>Reason:</h5>
                            <p>{request.reason}</p>
                          </div>

                          {request.admin_notes && (
                            <div className="admin-response">
                              <h5>Admin Response:</h5>
                              <p>{request.admin_notes}</p>
                              <small>
                                Updated:{" "}
                                {new Date(request.updated_at).toLocaleString()}
                              </small>
                            </div>
                          )}
                        </div>

                        {request.status === "pending" && (
                          <div className="request-actions">
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              className="cancel-request-btn"
                            >
                              Cancel Request
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="help-section">
              <h3>Need Help?</h3>
              <div className="help-content">
                <div className="help-item">
                  <h4>How long does review take?</h4>
                  <p>
                    Role requests are typically reviewed within 1-3 business
                    days by our admin team.
                  </p>
                </div>
                <div className="help-item">
                  <h4>What happens after approval?</h4>
                  <p>
                    Once approved, your role will be automatically updated and
                    you'll have access to new features.
                  </p>
                </div>
                <div className="help-item">
                  <h4>Can I resubmit after rejection?</h4>
                  <p>
                    Yes, you can submit a new request after addressing the
                    feedback provided by admins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default RoleRequests;
