import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./HRDashboard.css";

const HRDashboard = () => {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [status, setStatus] = useState("Present");
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchAttendance();
    }
  }, [selectedUser, selectedDate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/attendance", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: {
          userId: selectedUser,
          date: selectedDate.toISOString().split("T")[0],
        },
      });
      setAttendance(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/admin/attendance",
        {
          userId: selectedUser,
          date: selectedDate.toISOString().split("T")[0],
          status,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Attendance saved successfully!");
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save attendance");
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="hr-dashboard">
      <h2>HR Dashboard{userInfo?.classroom ? ` - ${userInfo.classroom}` : ""}</h2>

      <div className="dashboard-section">
        <h3>Manage Attendance</h3>
        <div className="attendance-form">
          <div className="form-group">
            <label>Select Employee</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="form-input"
            >
              <option value="">Select Employee</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-input"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Half Day">Half Day</option>
              <option value="Work From Home">Work From Home</option>
            </select>
          </div>

          <button className="btn-save" onClick={handleSaveAttendance}>
            Save Attendance
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="dashboard-section">
          <h3>Attendance History</h3>
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
                    <th>Total Hours</th>
                    <th>Approved By</th>
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
                      <td>
                        {record.approvedBy?.name || "N/A"}
                      </td>
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

export default HRDashboard;

