import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminService } from "../services/adminService";
import { useSearchParams } from "react-router-dom";
import SidebarHeader from "../components/ui/headers/SidebarHeader";
import TopHeader from "../components/ui/headers/TopHeader";
import { convertProfilePictureUrl } from "../utils/audioDuration";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  profile_picture?: string;
  profile_picture_url?: string;
  bio?: string;
  ratings_given?: any[];
  uploaded_music?: any[];
}

const AdminUsers: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(15);
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (roleFilter) params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await adminService.getUsers(params);
      console.log("Full response:", response);
      
      // Handle the actual API response structure
      if (response.success && response.users) {
        const users = response.users.data || [];
        setUsers(users);
        setCurrentPage(response.users.current_page || 1);
        setTotalPages(response.users.last_page || 1);
        setTotal(response.users.total || 0);
      } else {
        setUsers([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
    if (role) {
      setSearchParams({ role });
    } else {
      setSearchParams({});
    }
  };

  const handleViewUser = async (userId: number) => {
    try {
      const userDetails = await adminService.getUserById(userId);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user details"
      );
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updatedUser = await adminService.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status,
      });

      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setEditingUser(null);
      setSelectedUser(null);
      setShowUserModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await adminService.deleteUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
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
  if (user?.role !== "admin") {
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
          <div className="admin-users">
            <div className="page-header">
              <h1>User Management</h1>
              <p>Manage all users in the system</p>
            </div>

            {/* Filters and Search */}
            <div className="filters-section">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  Search
                </button>
              </form>

              <div className="role-filters">
                <button
                  className={`filter-btn ${roleFilter === "" ? "active" : ""}`}
                  onClick={() => handleRoleFilterChange("")}
                >
                  All Users ({total})
                </button>
                <button
                  className={`filter-btn ${roleFilter === "user" ? "active" : ""}`}
                  onClick={() => handleRoleFilterChange("user")}
                >
                  Users
                </button>
                <button
                  className={`filter-btn ${roleFilter === "artist" ? "active" : ""}`}
                  onClick={() => handleRoleFilterChange("artist")}
                >
                  Artists
                </button>
                <button
                  className={`filter-btn ${roleFilter === "admin" ? "active" : ""}`}
                  onClick={() => handleRoleFilterChange("admin")}
                >
                  Admins
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
                <p>Loading users...</p>
              </div>
            ) : (
              <>
                <div className="users-table">
                  <div className="table-header">
                    <div className="header-cell">User</div>
                    <div className="header-cell">Role</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Joined</div>
                    <div className="header-cell">Actions</div>
                  </div>

                  {users && users.length > 0
                    ? users.map((user) => (
                        <div key={user.id} className="table-row">
                                                     <div className="cell user-cell">
                             <div className="user-avatar">
                               {user.profile_picture ? (
                                 <img
                                   src={convertProfilePictureUrl(user.profile_picture, import.meta.env.VITE_API_URL || 'http://localhost:8000')}
                                   alt={user.name}
                                 />
                               ) : (
                                 <div className="avatar-placeholder">
                                   {user.name.charAt(0).toUpperCase()}
                                 </div>
                               )}
                             </div>
                            <div className="user-info">
                              <h4>{user.name}</h4>
                              <p>{user.email}</p>
                            </div>
                          </div>
                          <div className="cell">
                            <span className={`role-badge ${user.role}`}>
                              {user.role}
                            </span>
                          </div>
                          <div className="cell">
                            <span className={`status-badge ${user.status}`}>
                              {user.status}
                            </span>
                          </div>
                          <div className="cell">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                          <div className="cell actions-cell">
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="action-btn view-btn"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="action-btn edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="action-btn delete-btn"
                              disabled={user.role === "admin"}
                            >
                              Deactivate
                            </button>
                          </div>
                        </div>
                      ))
                    : null}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>

                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
              <div
                className="modal-overlay"
                onClick={() => setShowUserModal(false)}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>User Details</h3>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="close-btn"
                    >
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="user-details">
                      <div className="user-basic-info">
                        <h4>{selectedUser.name}</h4>
                        <p>{selectedUser.email}</p>
                        <div className="badges">
                          <span className={`role-badge ${selectedUser.role}`}>
                            {selectedUser.role}
                          </span>
                          <span
                            className={`status-badge ${selectedUser.status}`}
                          >
                            {selectedUser.status}
                          </span>
                        </div>
                      </div>

                      {selectedUser.bio && (
                        <div className="user-bio">
                          <h5>Bio</h5>
                          <p>{selectedUser.bio}</p>
                        </div>
                      )}

                      {selectedUser.ratings_given &&
                        selectedUser.ratings_given.length > 0 && (
                          <div className="user-ratings">
                            <h5>
                              Recent Ratings (
                              {selectedUser.ratings_given.length})
                            </h5>
                            <div className="ratings-list">
                              {selectedUser.ratings_given
                                .slice(0, 5)
                                .map((rating) => (
                                  <div key={rating.id} className="rating-item">
                                    <div className="rating-info">
                                      <strong>{rating.song.title}</strong>
                                      <span>by {rating.song.artist.name}</span>
                                    </div>
                                    <div className="rating-score">
                                      ⭐ {rating.rating}/5
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {selectedUser.uploaded_music &&
                        selectedUser.uploaded_music.length > 0 && (
                          <div className="user-music">
                            <h5>
                              Uploaded Music (
                              {selectedUser.uploaded_music.length})
                            </h5>
                            <div className="music-list">
                              {selectedUser.uploaded_music
                                .slice(0, 5)
                                .map((song) => (
                                  <div key={song.id} className="music-item">
                                    <div className="music-info">
                                      <strong>{song.title}</strong>
                                      <span>{song.genre}</span>
                                    </div>
                                    <div className="music-stats">
                                      <span>{song.total_plays} plays</span>
                                      <span>⭐ {song.average_rating}/5</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <div
                className="modal-overlay"
                onClick={() => setEditingUser(null)}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Edit User</h3>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="close-btn"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleUpdateUser} className="modal-body">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            role: e.target.value,
                          })
                        }
                      >
                        <option value="user">User</option>
                        <option value="artist">Artist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={editingUser.status}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="save-btn">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminUsers;
