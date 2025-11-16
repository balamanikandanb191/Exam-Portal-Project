import React, { useEffect, useState, useRef } from "react"; // ✅ useRef-ஐ import செய்யவும்
import api from "../../api";
import { Link } from "react-router-dom"; 
import './AdminDashboard.css';

// --- Main Admin Dashboard Component ---
export default function AdminDashboard() {
  // State
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [pendingQueries, setPendingQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(true);
  
  // --- ✅ புதிய State (வசதிக்காக) ---
  const [isResolving, setIsResolving] = useState(null); // query ID-ஐ சேமிக்கும்

  // --- ✅ Scroll செய்வதற்கான Refs ---
  const studentsRef = useRef(null);
  const queriesRef = useRef(null);

  // Fetch all data on mount
  useEffect(() => {
    loadData();
    loadPendingQueries();
  }, []);

  // --- ✅ Scroll Function ---
  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const loadData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([
        loadStats(),
        loadRecentTests(),
        loadStudents(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // --- API Call Functions (Unchanged) ---
  const loadStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
      setStats(null);
    }
  };
  const loadRecentTests = async () => {
    try {
      const res = await api.get("/admin/recent-mock-tests");
      setRecentTests(res.data);
    } catch (err) {
      console.error("Failed to load recent tests:", err);
      setRecentTests([]);
    }
  };
  const loadStudents = async () => {
    try {
      const res = await api.get("/admin/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents([]);
    }
  };
  const loadPendingQueries = async () => {
    setLoadingQueries(true);
    try {
      const res = await api.get("/admin/pending-queries");
      setPendingQueries(res.data);
    } catch (err) {
      console.error("Failed to load pending queries:", err);
      setPendingQueries([]);
    } finally {
      setLoadingQueries(false);
    }
  };

  // --- ✅ சரிசெய்யப்பட்ட Handler Function (Instant Resolve) ---
  const handleResolveQuery = async (queryId) => {
    // Alert-ஐ நீக்கிவிட்டு, எந்த query-ஐ resolve செய்கிறோம் என state-ல் set செய்யவும்
    setIsResolving(queryId); 
    try {
      await api.patch(`/admin/resolve-query/${queryId}`);
      // alert("Query resolved."); // Alert தேவையில்லை
      
      // ✅ Reload செய்வதற்கு பதிலாக, state-லிருந்து நீக்கவும்
      setPendingQueries(prevQueries => 
        prevQueries.filter(query => query.id !== queryId)
      );

    } catch (err) {
      console.error("Failed to resolve query:", err);
      alert(`Error: ${err.response?.data?.message || 'Could not resolve query.'}`);
    } finally {
      // ✅ Spinner-ஐ நீக்கவும்
      setIsResolving(null); 
    }
  };

  // --- Render Loading Spinner ---
  if (loadingData && !stats) {
    return (
      <div className="loading-placeholder">
        <span className="spinner"></span>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="admin-container animate-fadeInUp">
      <h1 className="page-title">Admin Dashboard </h1>

      {/* Top Section: Stats */}
      <section className="dashboard-grid-3col">
        <div className="grid-span-3 card card-body">
          <h2 className="section-title">Quick Stats 📊</h2>
          {stats ? (
            <div className="stats-grid">
              {/* --- ✅ Clickable Stat Card (Students) --- */}
              <div 
                className="stat-card indigo" 
                onClick={() => scrollToRef(studentsRef)} 
                style={{cursor: 'pointer'}}
              >
                <div className="stat-card-label">Total Students</div>
                <div className="stat-card-value">{stats.studentCount} 🎓</div>
              </div>

              <div className="stat-card blue">
                <div className="stat-card-label">Total Mock Tests</div>
                <div className="stat-card-value">{stats.mockTestCount} 📝</div>
              </div>

              <div className="stat-card emerald">
                <div className="stat-card-label">Total Resources</div>
                <div className="stat-card-value">{stats.resourceCount} 📦</div>
              </div>

              {/* --- ✅ Clickable Stat Card (Pending Queries) --- */}
              <div 
                className="stat-card red" 
                onClick={() => scrollToRef(queriesRef)}
                style={{cursor: 'pointer'}}
              >
                <div className="stat-card-label">Pending Queries</div>
                <div className="stat-card-value">{pendingQueries.length} 🚩</div>
              </div>
            </div>
          ) : (
            <p className="loading-text">Loading stats...</p>
          )}
        </div>
      </section>

      {/* Mid Section: Recent Activity & Students */}
      <section className="dashboard-grid-2col">
        <div className="card list-card-wrapper">
          <h3 className="section-title">Recent Activity ⏱️</h3>
          <h4 className="list-card-subtitle">Recently Added Tests</h4>
          <div className="list-scroll-container">
            <ul className="styled-list">
              {recentTests.length > 0 ? (
                recentTests.map((test) => (
                  <li key={test.id} className="styled-list-item">
                    <div className="list-item-info">
                      <p className="list-item-title">{test.title}</p>
                      <p className="list-item-description">
                        Category: {test.category}
                      </p>
                    </div>
                    <p className="list-item-meta">
                      Added: {new Date(test.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))
              ) : (
                <p className="empty-list-text">No recent tests found.</p>
              )}
            </ul>
          </div>
        </div>

        {/* --- ✅ ref={studentsRef} (Students) --- */}
        <div className="card list-card-wrapper" ref={studentsRef}>
          <h3 className="section-title">Registered Students 🎓</h3>
          <div className="list-scroll-container">
            <ul className="styled-list">
              {students.length > 0 ? (
                students.map((student) => (
                  <li key={student.id} className="styled-list-item">
                    <div className="list-item-info">
                      <p className="list-item-title">{student.name}</p>
                      <p className="list-item-description">{student.email}</p>
                    </div>
                    <p className="list-item-meta">
                      Joined: {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))
              ) : (
                <p className="empty-list-text">No students registered yet.</p>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* --- ✅ ref={queriesRef} (Queries) --- */}
      <section className="dashboard-section" ref={queriesRef}>
        <h2 className="section-title">Pending Student Queries ({pendingQueries.length}) 🚩</h2>
        <div className="card list-card-wrapper">
          <div className="list-scroll-container queries">
            {loadingQueries ? (
              <div className="loading-placeholder small">
                <span className="spinner"></span>
                <p>Loading Queries...</p>
              </div>
            ) : pendingQueries.length > 0 ? (
              <ul className="styled-list">
                {pendingQueries.map((query) => (
                  <li key={query.id} className="query-item">
                    <div className="query-item-layout">
                      <div className="query-item-content">
                        <p className="query-text">"{query.queryText}"</p>
                        <p className="query-meta">
                          <strong>Student:</strong> {query.student?.name || 'N/A'} ({query.student?.email || 'N/A'})
                        </p>
                        <p className="query-meta">
                          <strong>Test:</strong> {query.mockTest?.title || 'N/A'}
                        </p>
                        <p className="query-meta">
                          <strong>Question:</strong> {(query.question?.questionText || 'N/A').substring(0, 70)}...
                        </p>
                        <p className="query-timestamp">
                          Reported: {new Date(query.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {/* --- ✅ Spinner Button --- */}
                      <button
                        onClick={() => handleResolveQuery(query.id)}
                        className="btn btn-primary btn-small"
                          disabled={isResolving === query.id} // ✅ Disable when resolving
                      >
                B         {isResolving === query.id ? (
                            <span className="spinner small-btn-spinner"></span>
                          ) : (
                            "Mark as Resolved"
                          )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-list-text">
                No pending queries. Great job!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="dashboard-section">
        <h2 className="section-title">Performance Overview 📊</h2>
        <div className="card card-body">
          <p className="empty-list-text">
            (Performance and student progress details will be shown here. This is a placeholder.)
          </p>
        </div>
      </section>
    </div>
  );
}