import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
  });

  useEffect(() => {
    fetchDepartmentUsers();
    fetchTodayStats();
  }, []);

  const fetchDepartmentUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { department: user?.department },
      });
      setDepartmentUsers(response.data);
      setStats((prev) => ({ ...prev, totalEmployees: response.data.length }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get("http://localhost:5000/api/admin/attendance", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { date: today },
      });
      const todayAttendance = response.data;
      setStats((prev) => ({
        ...prev,
        presentToday: todayAttendance.filter((a) => a.status === "Present").length,
        onLeave: todayAttendance.filter((a) => a.status === "Leave").length,
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUserAttendance = async () => {
    if (!selectedUser) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/attendance/all`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { userId: selectedUser },
        }
      );
      setAttendance(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchUserAttendance();
    }
  }, [selectedUser]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-dashboard">
      <h2>Manager Dashboard - {user?.classroom || user?.department || "Department"}</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p className="stat-value">{stats.totalEmployees}</p>
        </div>
        <div className="stat-card">
          <h3>Present Today</h3>
          <p className="stat-value">{stats.presentToday}</p>
        </div>
        <div className="stat-card">
          <h3>On Leave</h3>
          <p className="stat-value">{stats.onLeave}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Department Employees</h3>
        <div className="users-list">
          {departmentUsers.map((emp) => (
            <div key={emp._id} className="user-card">
              <div>
                <strong>{emp.name}</strong>
                <p>{emp.email}</p>
                <span className="role-badge">{emp.role}</span>
              </div>
              <button
                className="btn-view"
                onClick={() => setSelectedUser(emp._id)}
              >
                View Attendance
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="dashboard-section">
          <h3>Attendance Records</h3>
          <div className="attendance-list">
            {attendance.length === 0 ? (
              <p>No attendance records found</p>
            ) : (
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td>{record.date}</td>
                      <td>{record.status}</td>
                      <td>
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString()
                          : "N/A"}
                      </td>
                      <td>
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString()
                          : "N/A"}
                      </td>
                      <td>{record.totalHours || 0} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;

