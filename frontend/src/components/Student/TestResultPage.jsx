import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './TestResultPage.css';

const AnimatedCounter = ({ targetValue }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); 
      const nextValue = Math.floor(easedProgress * targetValue);
      
      setCurrentValue(nextValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue]);

  return <span className="score-value">{currentValue}</span>;
};

const Confetti = () => (
  <div className="confetti-container" aria-hidden="true">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="confetti"></div>
    ))}
  </div>
);

export default function TestResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userName = localStorage.getItem("name") || "Student";

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/student/my-attempt/${attemptId}`);
        setResult(res.data);
      } catch (err) {
        console.error("Failed to fetch result:", err);
        setError(err.response?.data?.message || "Could not load test results.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  const handleDownload = () => {
    if (!result) return;
    const { score, totalMarks, mockTest, submittedAt } = result;
    const percentage = totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(0) : 0;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor("#4f46e5");
    doc.text("EduPro Score Report", 105, 20, { align: "center" });
    autoTable(doc, {
      startY: 30,
      head: [[{ content: 'Exam Details', styles: { fillColor: [79, 70, 229] } }]],
      body: [
        ['Student Name', userName],
        ['Exam Title', mockTest.title],
        ['Date Submitted', new Date(submittedAt).toLocaleString()],
        ['Test Validity', `${mockTest.startDate ? new Date(mockTest.startDate).toLocaleDateString() : 'N/A'} - ${mockTest.endDate ? new Date(mockTest.endDate).toLocaleDateString() : 'N/A'}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { font: 'helvetica', fontSize: 12 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [241, 245, 249] } }
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#1e293b");
    doc.text("Final Result", 105, (doc).lastAutoTable.finalY + 15, { align: "center" });
    autoTable(doc, {
      startY: (doc).lastAutoTable.finalY + 20,
      head: [['Score', 'Total Marks', 'Percentage']],
      body: [[
        { content: score, styles: { fontSize: 16, fontStyle: 'bold' } },
        { content: totalMarks, styles: { fontSize: 16 } },
        { content: `${percentage}%`, styles: { fontSize: 16, fontStyle: 'bold', textColor: [79, 70, 229] } }
      ]],
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], fontStyle: 'bold' },
      bodyStyles: { halign: 'center' }
    });
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Report generated on ${new Date().toLocaleString()}.`, 105, doc.internal.pageSize.height - 10, { align: "center" });
    doc.save(`EduPro_Report_${mockTest.title.replace(" ", "_")}.pdf`);
  };

  if (loading) {
    return (
      <div className="loading-placeholder">
        <span className="spinner"></span>
        <p>Calculating Your Score...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-container">
        <div className="card alert alert-danger">
          <h2 className="alert-title">Error Loading Result</h2>
          <p>{error}</p>
          <Link to="/student" className="btn btn-danger">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { score, totalMarks, mockTest } = result;
  const percentage = totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(0) : 0;
  let message = "Good effort!";
  if (percentage >= 90) message = "Outstanding! Congratulations!";
  else if (percentage >= 75) message = "Great Job! Well done!";
  else if (percentage >= 50) message = "Good job! Keep practicing!";

  return (
    <div className="result-container animate-fadeInUp">
      <div className="result-card">
        <div className="result-grid">
          
          <div className="result-main-content">
            {percentage >= 75 && <Confetti />}
            
            <h1 className="result-message">
              {message}
            </h1>
            <p className="result-subtitle">
              You have successfully completed the test.
            </p>

            <div className="score-container">
              <p className="score-label">Your Score</p>
              <div className="score-display">
                <AnimatedCounter targetValue={score} />
                <span className="score-total">
                  / {totalMarks}
                </span>
              </div>
              <p className="score-percentage">
                ({percentage}%)
              </p>
            </div>

            <div className="result-actions">
              <Link to="/student" className="btn btn-primary">
                Back to Dashboard
              </Link>
              <Link to="/student" className="btn btn-secondary">
                View All My Attempts
              </Link>
            </div>
          </div>
          
          <div className="result-side-panel">
            <h3 className="side-panel-title">Score Report</h3>
            <div className="side-panel-details">
              <div>
                <label className="form-label">Student</label>
                <p className="detail-value">{userName}</p>
              </div>
              <div>
                <label className="form-label">Exam</label>
                <p className="detail-value">{mockTest.title}</p>
              </div>
              <div>
                <label className="form-label">Date Submitted</label>
                <p className="detail-value small">{new Date(result.submittedAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="form-label">Test Validity</label>
                <p className="detail-value small">
                  {mockTest.startDate ? new Date(mockTest.startDate).toLocaleDateString() : "N/A"}
                  {" - "}
                  {mockTest.endDate ? new Date(mockTest.endDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              className="btn btn-accent btn-full-width"
            >
              Download Report (A4)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}