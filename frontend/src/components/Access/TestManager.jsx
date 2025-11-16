// src/components/Access/TestManager.jsx
// THIS IS A BRAND NEW FILE

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api'; // Make sure this is correctly configured

// Helper function (Copied from AccessDashboard)
const formatTestDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "", ampm: "" };
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return { date: "N/A", time: "", ampm: "" };
    const options = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(dateObj);
    const datePart = `${parts.find(p => p.type === 'month')?.value}/${parts.find(p => p.type === 'day')?.value}/${parts.find(p => p.type === 'year')?.value}`;
    const time = (parts.find(p => p.type === 'hour')?.value || '--') + ":" + (parts.find(p => p.type === 'minute')?.value || '--');
    const ampm = parts.find(p => p.type === 'dayperiod')?.value || '';
    return { date: datePart, time: time, ampm: ampm };
};

// This component ONLY handles Mock Tests. No demo data.
export default function TestManager() {

    // --- State for Mock Test Forms ---
    const [testTitle, setTestTitle] = useState('');
    const [testCategory, setTestCategory] = useState('');
    const [testDuration, setTestDuration] = useState(60); 
    const [testMarks, setTestMarks] = useState(50);
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    
    // Loading states
    const [isTestCreating, setIsTestCreating] = useState(false);
    const [isTestLoading, setIsTestLoading] = useState(true); 

    // --- State for Data ---
    const [mockTests, setMockTests] = useState([]); // Starts EMPTY

    // --- Data Fetching Logic ---
    const fetchMockTests = async () => {
        setIsTestLoading(true); 
        try {
            const response = await api.get('/access/mock-tests');
            setMockTests(response.data); // Load REAL data
        } catch (error) {
            console.error("Error fetching mock tests:", error);
            alert("Could not load mock tests. Check backend connection.");
            setMockTests([]); // Set to empty on error
        } finally {
            setIsTestLoading(false); 
        }
    };

    // Load data when component mounts
    useEffect(() => {
        fetchMockTests();
    }, []);

    // --- Handlers ---
    
    const handleTestSubmit = async (e) => {
        e.preventDefault();
        if (!testTitle || !testCategory || testDuration <= 0 || testMarks <= 0) {
            alert("Please fill in all required fields.");
            return;
        }
        setIsTestCreating(true); 
        const newTestData = {
            title: testTitle, category: testCategory, duration: testDuration,
            totalMarks: testMarks,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
        };
        try {
            await api.post('/access/mock-test', newTestData); 
            alert(`Mock Test '${testTitle}' created!`);
            setTestTitle(''); setTestCategory(''); setStartDate(''); setEndDate('');
            fetchMockTests(); // Reload list
        } catch (error) {
            alert(error.response?.data?.message || "Mock Test creation failed.");
        } finally {
            setIsTestCreating(false); 
        }
    };

    const handleDeleteTest = async (id) => {
        // This ID will be a REAL MongoDB ID (e.g., 65f...)
        console.log("Attempting to delete REAL test with ID:", id); 
        
        if (!window.confirm("Are you sure? All questions will be deleted too.")) return;
        
        try {
            await api.delete(`/access/mock-test/${id}`); 
            fetchMockTests(); // Reload the list
            alert("Mock Test deleted successfully.");
        } catch (error) {
            // This alert will NOT show "Invalid ID"
            alert(error.response?.data?.message || "Failed to delete test."); 
        }
    };

    return (
        <section className="dashboard-section animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <h2 className="section-header">Manage Mock Tests</h2>
            <p className="section-subtitle">Create exams for students. Add questions after creation.</p>
            
            {/* --- Create Test Form --- */}
            <div className="mock-test-form-card">
                <h3 className="section-header" style={{ fontSize: '1.5rem', borderBottom: 'none', paddingBottom: '0' }}>Create New Mock Test</h3>
                <form onSubmit={handleTestSubmit}>
                    <div className="form-group">
                        <label htmlFor="testTitle">Test Title</label>
                        <input type="text" id="testTitle" placeholder="e.g., TNPSC Group 4" value={testTitle} onChange={e => setTestTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <input type="text" id="category" placeholder="e.g., TNPSC, Aptitude" value={testCategory} onChange={e => setTestCategory(e.target.value)} />
                    </div>
                    <div className="date-input-group">
                        <div className="form-group">
                            <label htmlFor="duration">Duration (Minutes)</label>
                            <input type="number" id="duration" value={testDuration} onChange={e => setTestDuration(Number(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="totalMarks">Total Marks</label>
                            <input type="number" id="totalMarks" value={testMarks} onChange={e => setTestMarks(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="date-input-group">
                        <div className="form-group">
                            <label htmlFor="startDate">Start Date (Optional)</label>
                            <input type="datetime-local" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">End Date (Optional)</label>
                            <input type="datetime-local" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full-width" disabled={isTestCreating}>
                        {isTestCreating ? 'Creating...' : 'Create Mock Test'}
                    </button>
                </form>
            </div>

            {/* --- Created Tests List --- */}
            <div className="mock-test-list-container" style={{ marginTop: '2.5rem' }}>
                <h3 className="section-header" style={{ fontSize: '1.5rem' }}>Your Created Tests ({mockTests.length})</h3>
                
                {isTestLoading && (
                    <p style={{ color: 'var(--text-secondary)' }}>Loading tests...</p>
                )}

                {!isTestLoading && mockTests.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)' }}>No mock tests created yet. Use the form above to add one.</p>
                )}
                
                {!isTestLoading && mockTests.length > 0 && (
                    <div className="mock-test-list-grid">
                        {mockTests.map(test => {
                            const starts = formatTestDateTime(test.startDate);
                            const ends = formatTestDateTime(test.endDate);
                            return (
                                <div className="mock-test-card" key={test.id}>
                                    <div className="mock-test-card-header">
                                        <span className="mock-test-category">{test.category}</span>
                                        <h4 className="mock-test-title">{test.title}</h4>
                                    </div>
                                    <ul className="mock-test-info-list">
                                        <li>• Duration: {test.duration} mins</li>
                                        <li>• Marks: {test.totalMarks}</li>
                                        <li>• Starts: {starts.date} <br/> {starts.time} {starts.ampm}</li>
                                        <li>• Ends: {ends.date} <br/> {ends.time} {ends.ampm}</li>
                                    </ul>
                                    <div className="mock-test-actions">
                                        <Link to={`/manage-questions/${test.id}`} className="btn btn-primary mock-test-action-btn">Manage Questions</Link>
                                        <button onClick={() => handleDeleteTest(test.id)} className="btn btn-danger mock-test-action-btn">Delete Test</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}