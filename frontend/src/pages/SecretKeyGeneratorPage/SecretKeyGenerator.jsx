import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SecretKeyGenerator.css";

const SecretKeyGenerator = () => {
  const [generatableRoles, setGeneratableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [classroom, setClassroom] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [myKeys, setMyKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keysLoading, setKeysLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserInfo();
    fetchGeneratableRoles();
    fetchMyKeys();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserInfo(response.data);
      if (response.data.classroom && response.data.role !== "super_admin") {
        setClassroom(response.data.classroom);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchGeneratableRoles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/secret-keys/generatable-roles",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setGeneratableRoles(response.data.roles);
      if (response.data.roles.length > 0) {
        setSelectedRole(response.data.roles[0]);
      }
    } catch (error) {
      console.error("Error fetching generatable roles:", error);
    }
  };

  const fetchMyKeys = async () => {
    setKeysLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/secret-keys/my-keys",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMyKeys(response.data);
    } catch (error) {
      console.error("Error fetching keys:", error);
    } finally {
      setKeysLoading(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    // Validate classroom for admin role
    if (selectedRole === "admin" && !classroom && userInfo?.role !== "super_admin") {
      alert("Classroom is required when generating admin key");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/secret-keys/generate",
        {
          role: selectedRole,
          classroom: selectedRole === "admin" ? classroom : (userInfo?.classroom || null),
          expiresInDays: expiresInDays || null,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setGeneratedKey(response.data);
      fetchMyKeys(); // Refresh keys list
      alert("Secret key generated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to generate secret key");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (keyId) => {
    if (!window.confirm("Are you sure you want to deactivate this key?")) return;

    try {
      await axios.put(
        `http://localhost:5000/api/secret-keys/${keyId}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Key deactivated successfully!");
      fetchMyKeys();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to deactivate key");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  if (generatableRoles.length === 0) {
    return (
      <div className="secret-key-generator">
        <div className="no-permission">
          <h3>Access Denied</h3>
          <p>You don't have permission to generate secret keys.</p>
          <p>Only Super Admin, Admin, Manager, and HR can generate keys.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="secret-key-generator">
      <h2>Secret Key Generator</h2>
      <p className="description">
        Generate secret keys for user registration. Each role can generate keys for roles below them in the hierarchy.
      </p>

      <div className="generator-section">
        <h3>Generate New Secret Key</h3>
        <form onSubmit={handleGenerateKey} className="key-generator-form">
          <div className="form-group">
            <label>Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                if (e.target.value !== "admin") {
                  setClassroom(userInfo?.classroom || "");
                }
              }}
              className="form-input"
              required
            >
              <option value="">Select a role</option>
              {generatableRoles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <small>You can generate keys for: {generatableRoles.join(", ")}</small>
          </div>

          {selectedRole === "admin" && userInfo?.role === "super_admin" && (
            <div className="form-group">
              <label>Classroom/Division Name</label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="form-input"
                placeholder="e.g., Classroom-A, Division-1, Office-North"
                required
              />
              <small>Enter the classroom/division name for this admin. This will be the classroom for all users created with this key.</small>
            </div>
          )}

          {selectedRole === "admin" && userInfo?.role !== "super_admin" && (
            <div className="form-group">
              <label>Classroom/Division</label>
              <input
                type="text"
                value={classroom || userInfo?.classroom || ""}
                className="form-input"
                disabled
              />
              <small>Your classroom: {userInfo?.classroom || "Not assigned"}. Users created with this key will be assigned to your classroom.</small>
            </div>
          )}

          <div className="form-group">
            <label>Expires In (Days)</label>
            <input
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="form-input"
              min="1"
              placeholder="Leave empty for no expiration"
            />
            <small>Leave empty for keys that never expire</small>
          </div>

          <button type="submit" className="btn-generate" disabled={loading}>
            {loading ? "Generating..." : "Generate Secret Key"}
          </button>
        </form>

        {generatedKey && (
          <div className="generated-key-display">
            <h4>✅ Secret Key Generated!</h4>
            <div className="key-box">
              <code className="secret-key-text">{generatedKey.secretKey}</code>
              <button
                className="btn-copy"
                onClick={() => copyToClipboard(generatedKey.secretKey)}
              >
                Copy
              </button>
            </div>
            <div className="key-info">
              <p><strong>Role:</strong> {generatedKey.role}</p>
              {generatedKey.classroom && (
                <p><strong>Classroom:</strong> {generatedKey.classroom}</p>
              )}
              <p><strong>Expires:</strong> {formatDate(generatedKey.expiresAt) || "Never"}</p>
            </div>
            <div className="warning-box">
              <p>⚠️ <strong>Important:</strong> Copy this key now. It won't be shown again!</p>
              <p>Share this key securely with the person who needs to register as {generatedKey.role}.</p>
            </div>
          </div>
        )}
      </div>

      <div className="keys-list-section">
        <h3>My Generated Keys</h3>
        {keysLoading ? (
          <div className="loading">Loading keys...</div>
        ) : myKeys.length === 0 ? (
          <div className="no-keys">No keys generated yet.</div>
        ) : (
          <div className="keys-table-container">
            <table className="keys-table">
              <thead>
                <tr>
                  <th>Key (First 16 chars)</th>
                  <th>Role</th>
                  <th>Generated</th>
                  <th>Expires</th>
                  <th>Used By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myKeys.map((key) => (
                  <tr key={key._id}>
                    <td>
                      <code>{key.key.substring(0, 16)}...</code>
                    </td>
                    <td>
                      <span className="role-badge">{key.role}</span>
                    </td>
                    <td>
                      {key.classroom ? (
                        <span className="classroom-badge">{key.classroom}</span>
                      ) : (
                        <span className="no-classroom">N/A</span>
                      )}
                    </td>
                    <td>{formatDate(key.createdAt)}</td>
                    <td>
                      {isExpired(key.expiresAt) ? (
                        <span className="expired">Expired</span>
                      ) : (
                        formatDate(key.expiresAt)
                      )}
                    </td>
                    <td>
                      {key.usedBy ? (
                        <span className="used">
                          {key.usedBy.name} ({key.usedBy.email})
                        </span>
                      ) : (
                        <span className="unused">Not used</span>
                      )}
                    </td>
                    <td>
                      {key.isActive ? (
                        <span className="status-active">Active</span>
                      ) : (
                        <span className="status-inactive">Inactive</span>
                      )}
                    </td>
                    <td>
                      {key.isActive && (
                        <button
                          className="btn-deactivate"
                          onClick={() => handleDeactivate(key._id)}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretKeyGenerator;

