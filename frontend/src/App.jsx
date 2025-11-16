import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminDashboard from "./components/Admin/AdminDashboard";
import StudentDashboard from "./components/Student/StudentDashboard";
import AccessDashboard from "./components/Access/AccessDashboard";
import TopNav from "./components/UI/TopNav";
import TakeTestPage from "./components/Student/TakeTestPage.jsx";
import ManageQuestions from "./components/Access/ManageQuestions.jsx";
import Footer from "./components/UI/Footer.jsx";
import TestResultPage from "./components/Student/TestResultPage.jsx";

// ✅ Auth Check Components
function RequireAuth({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "access") return <Navigate to="/access" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}

function GuestOnly({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "access") return <Navigate to="/access" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}

// ✅ Main App
export default function App() {
  return (
    <>
      <TopNav />
      <main style={{ minHeight: "calc(100vh - 8rem)" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

          {/* Protected Routes */}
          <Route path="/admin" element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminDashboard />
            </RequireAuth>
          }/>

          <Route path="/access" element={
            <RequireAuth allowedRoles={["access", "admin"]}>
              <AccessDashboard />
            </RequireAuth>
          }/>

          <Route path="/access/manage-test/:testId" element={
            <RequireAuth allowedRoles={["access", "admin"]}>
              <ManageQuestions />
            </RequireAuth>
          }/>

          <Route path="/student" element={
            <RequireAuth allowedRoles={["student", "admin", "access"]}>
              <StudentDashboard />
            </RequireAuth>
          }/>

          <Route path="/student/take-test/:testId" element={
            <RequireAuth allowedRoles={["student", "admin", "access"]}>
              <TakeTestPage />
            </RequireAuth>
          }/>

          <Route path="/student/results/:attemptId" element={
            <RequireAuth allowedRoles={["student", "admin", "access"]}>
              <TestResultPage />
            </RequireAuth>
          }/>

          {/* 404 */}
          <Route path="*" element={
            <div className="animate-fade-in-up"
              style={{ padding: "4rem", textAlign: "center", margin: "2.5rem auto", maxWidth: "42rem" }}>
              <h1 style={{ fontSize: "6rem", fontWeight: 900, color: "#CBD5E1" }}>
                404
              </h1>
              <p style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Oops! Page Not Found
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                The page you are looking for doesn't exist.
              </p>
              <Link to="/" className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
                Go Home
              </Link>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
