import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import "./CheckInOut.css";

const CheckInOut = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/attendance/today", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAttendance(response.data);
    } catch (error) {
      console.error("Error fetching today's status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/attendance/check-in",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Checked in successfully!");
      fetchTodayStatus();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to check in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/attendance/check-out",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Checked out successfully!");
      fetchTodayStatus();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to check out");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreakStart = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/attendance/break-start",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Break started!");
      fetchTodayStatus();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start break");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreakEnd = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/attendance/break-end",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Break ended!");
      fetchTodayStatus();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to end break");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="checkinout-loading">Loading...</div>;
  }

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="checkinout-container">
      <h3>Today's Attendance</h3>
      <div className="checkinout-card">
        <div className="checkinout-status">
          <div className="status-item">
            <span className="status-label">Check In:</span>
            <span className="status-value">{formatTime(attendance?.checkIn)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Check Out:</span>
            <span className="status-value">{formatTime(attendance?.checkOut)}</span>
          </div>
          {attendance?.totalHours > 0 && (
            <div className="status-item">
              <span className="status-label">Total Hours:</span>
              <span className="status-value">{attendance.totalHours.toFixed(2)} hrs</span>
            </div>
          )}
          {attendance?.overtimeHours > 0 && (
            <div className="status-item">
              <span className="status-label">Overtime:</span>
              <span className="status-value overtime">{attendance.overtimeHours.toFixed(2)} hrs</span>
            </div>
          )}
        </div>

        <div className="checkinout-actions">
          {!attendance?.checkedIn && (
            <button
              className="btn-checkin"
              onClick={handleCheckIn}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Check In"}
            </button>
          )}

          {attendance?.checkedIn && !attendance?.checkedOut && (
            <>
              {!attendance?.onBreak ? (
                <button
                  className="btn-break"
                  onClick={handleBreakStart}
                  disabled={actionLoading}
                >
                  Start Break
                </button>
              ) : (
                <button
                  className="btn-break-end"
                  onClick={handleBreakEnd}
                  disabled={actionLoading}
                >
                  End Break
                </button>
              )}
              <button
                className="btn-checkout"
                onClick={handleCheckOut}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Check Out"}
              </button>
            </>
          )}

          {attendance?.checkedOut && (
            <div className="completed-message">
              ✓ Attendance completed for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInOut;

