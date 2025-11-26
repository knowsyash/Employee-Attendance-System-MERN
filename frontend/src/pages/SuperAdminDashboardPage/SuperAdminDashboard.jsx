import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAttendance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    classroom: "",
    department: "",
    position: "",
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
      setStats((prev) => ({
        ...prev,
        totalUsers: response.data.length,
        activeUsers: response.data.filter((u) => u.isActive).length,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/attendance", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats((prev) => ({
        ...prev,
        totalAttendance: response.data.length,
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      classroom: user.classroom || "",
      department: user.department || "",
      position: user.position || "",
      isActive: user.isActive,
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${selectedUser._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("User updated successfully!");
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("User deactivated successfully!");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to deactivate user");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Role updated successfully!");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update role");
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="super-admin-dashboard">
      <h2>Super Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p className="stat-value">{stats.activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Attendance Records</h3>
          <p className="stat-value">{stats.totalAttendance}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>User Management</h3>
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td>
                    {user.classroom ? (
                      <span className="classroom-badge">{user.classroom}</span>
                    ) : (
                      <span className="no-classroom">N/A</span>
                    )}
                  </td>
                  <td>{user.department || "N/A"}</td>
                  <td>
                    <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      {user.role !== "super_admin" && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user._id)}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Classroom/Division</label>
                <input
                  type="text"
                  value={editForm.classroom}
                  onChange={(e) =>
                    setEditForm({ ...editForm, classroom: e.target.value })
                  }
                  placeholder="e.g., Classroom-A, Division-1"
                />
                <small>Classroom/Division identifier for this user</small>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={editForm.position}
                  onChange={(e) =>
                    setEditForm({ ...editForm, position: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isActive: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleUpdate}>
                  Save
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;

