import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import moment from "moment";
import "./ReportsPage.css";

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
  const [selectedMonth, setSelectedMonth] = useState(moment().format("MM"));
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [selectedYear, selectedMonth]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const userId = user?._id || user?.id;
      const response = await axios.get(
        `http://localhost:5000/api/attendance/summary/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { year: selectedYear, month: selectedMonth },
        }
      );
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="reports-loading">Loading reports...</div>;
  }

  return (
    <div className="reports-page">
      <h2>Attendance Reports</h2>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="filter-select"
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-select"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index} value={String(index + 1).padStart(2, "0")}>
                {moment().month(index).format("MMMM")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {summary && (
        <div className="reports-summary">
          <div className="summary-card">
            <h3>Employee Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{summary.userName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{summary.userEmail}</span>
              </div>
              {summary.employeeId && (
                <div className="info-item">
                  <span className="info-label">Employee ID:</span>
                  <span className="info-value">{summary.employeeId}</span>
                </div>
              )}
              {summary.department && (
                <div className="info-item">
                  <span className="info-label">Department:</span>
                  <span className="info-value">{summary.department}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-card">
            <h3>Attendance Summary</h3>
            <div className="stats-grid">
              <div className="stat-item present">
                <span className="stat-label">Present Days</span>
                <span className="stat-number">{summary.presentDays || 0}</span>
              </div>
              <div className="stat-item absent">
                <span className="stat-label">Absent Days</span>
                <span className="stat-number">{summary.absentDays || 0}</span>
              </div>
              <div className="stat-item leave">
                <span className="stat-label">Leave Days</span>
                <span className="stat-number">{summary.leaveDays || 0}</span>
              </div>
              {summary.halfDays !== undefined && (
                <div className="stat-item half-day">
                  <span className="stat-label">Half Days</span>
                  <span className="stat-number">{summary.halfDays || 0}</span>
                </div>
              )}
              {summary.wfhDays !== undefined && (
                <div className="stat-item wfh">
                  <span className="stat-label">Work From Home</span>
                  <span className="stat-number">{summary.wfhDays || 0}</span>
                </div>
              )}
            </div>
          </div>

          {(summary.totalHours > 0 || summary.totalOvertime > 0) && (
            <div className="summary-card">
              <h3>Hours Summary</h3>
              <div className="hours-grid">
                <div className="hours-item">
                  <span className="hours-label">Total Hours</span>
                  <span className="hours-value">{summary.totalHours?.toFixed(2) || 0} hrs</span>
                </div>
                {summary.totalOvertime > 0 && (
                  <div className="hours-item overtime">
                    <span className="hours-label">Overtime Hours</span>
                    <span className="hours-value">{summary.totalOvertime?.toFixed(2) || 0} hrs</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!summary && (
        <div className="no-data">
          <p>No attendance data available for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

