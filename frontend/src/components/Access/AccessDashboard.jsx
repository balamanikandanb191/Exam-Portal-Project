import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api'; // Make sure this is correctly configured
import './AccessDashboard.css'; 

// Helper function to format date/time
const formatTestDateTime = (dateString) => {
    // Return "N/A" for null or undefined dates
    if (!dateString) return { date: "N/A", time: "", ampm: "" };
    
    const dateObj = new Date(dateString);
    
    // Check for "Invalid Date"
    if (isNaN(dateObj.getTime())) return { date: "N_A", time: "", ampm: "" };

    const options = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(dateObj);

    // Find parts to avoid locale issues
    const datePart = `${parts.find(p => p.type === 'month')?.value}/${parts.find(p => p.type === 'day')?.value}/${parts.find(p => p.type === 'year')?.value}`;
    const time = (parts.find(p => p.type === 'hour')?.value || '--') + ":" + (parts.find(p => p.type === 'minute')?.value || '--');
    const ampm = parts.find(p => p.type === 'dayperiod')?.value || '';
    
    return { date: datePart, time: time, ampm: ampm };
};

export default function AccessDashboard() {
    
    // --- State for Forms (Resources) ---
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceType, setResourceType] = useState('PDF');
    const [file, setFile] = useState(null);
    const [link, setLink] = useState('');
    const [fileName, setFileName] = useState('No file selected');

    // --- State for Mock Test Forms ---
    const [testTitle, setTestTitle] = useState('');
    const [testCategory, setTestCategory] =useState('');
    const [testDuration, setTestDuration] = useState(60); 
    const [testMarks, setTestMarks] = useState(50);
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    
    // --- Loading States ---
    const [isUploadingResource, setIsUploadingResource] = useState(false);
    const [isResourceLoading, setIsResourceLoading] = useState(true);
    const [isTestCreating, setIsTestCreating] = useState(false);
    const [isTestLoading, setIsTestLoading] = useState(true); 

    // --- ✅ புதிய State (வசதிக்காக) ---
    const [dateError, setDateError] = useState(null);

    const [mockTests, setMockTests] = useState([]); 
    const [resources, setResources] = useState([]);


    // --- Data Fetching Logic ---
    const fetchResources = async () => {
        setIsResourceLoading(true);
        try {
            const response = await api.get('/student/resources'); 
            setResources(response.data);
        } catch (error) {
            console.error("Error fetching resources:", error);
            alert("Could not load resources.");
        } finally {
            setIsResourceLoading(false);
        }
    };
    
    const fetchMockTests = async () => {
        setIsTestLoading(true);
        try {
            const response = await api.get('/access/mock-tests');
            setMockTests(response.data); 
        } catch (error) {
            console.error("Error fetching mock tests:", error);
            alert("Could not load mock tests. Check backend connection.");
            setMockTests([]);
        } finally {
            setIsTestLoading(false);
        }
    };

    // Load data from API when component mounts
    useEffect(() => {
        fetchResources();
        fetchMockTests();
    }, []);

    // --- ✅ புதிய வசதி: Date Validation ---
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) {
                setDateError("End date cannot be before the start date.");
            } else {
                setDateError(null);
            }
        } else {
            setDateError(null);
        }
    }, [startDate, endDate]);

    // --- Handlers ---
    
    // Mock Test Submit Handler
    const handleTestSubmit = async (e) => {
        e.preventDefault();
        if (!testTitle || !testCategory || testDuration <= 0 || testMarks <= 0) {
            alert("Please fill in all required fields (Title, Category, Duration, Marks) correctly.");
            return;
        }

        // ✅ புதிய வசதி: Error Check
        if (dateError) {
            alert(`Please fix the date error: ${dateError}`);
            return;
        }

        setIsTestCreating(true);

        const newTestData = {
            title: testTitle,
            category: testCategory,
            duration: testDuration,
            totalMarks: testMarks,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
        };

        try {
            await api.post('/access/mock-test', newTestData); 
            alert(`Mock Test '${testTitle}' created successfully!`);
            
            // Reset Form State
            setTestTitle('');
            setTestCategory('');
            setTestDuration(60);
            setTestMarks(50);
            setStartDate('');
            setEndDate('');
            
            fetchMockTests(); 
        } catch (error) {
            console.error("Failed to create mock test:", error);
            alert(error.response?.data?.message || "Mock Test creation failed.");
        } finally {
            setIsTestCreating(false); 
        }
    };

    // Mock Test Delete Handler
    const handleDeleteTest = async (id) => {
        console.log("Attempting to delete test with ID:", id); 
        
        if (!window.confirm("Are you sure you want to delete this mock test? All questions will be deleted too.")) return;
        
        try {
            await api.delete(`/access/mock-test/${id}`); 
            fetchMockTests(); 
            alert("Mock Test deleted successfully.");
        } catch (error) {
            console.error("Failed to delete test:", error);
            alert(error.response?.data?.message || "Failed to delete test."); 
        }
    };
    
    // --- Resource Handlers ---
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
            setLink(''); 
        } else {
            setFile(null);
            setFileName('No file selected');
        }
    };

    const handleResourceSubmit = async (e) => {
        e.preventDefault();

        if (!resourceTitle || !resourceType) {
            return alert("Resource Title and Type are required.");
        }
        if (!file && !link) {
            return alert("Please provide either a File or an External Link.");
        }
        if (file && link) {
            return alert("Please provide only ONE of File or Link, not both.");
        }

        setIsUploadingResource(true);
        
        const formData = new FormData();
        formData.append("title", resourceTitle);
        formData.append("type", resourceType);
        
        if (file) {
            formData.append("file", file);
        } else {
            formData.append("link", link);
        }

        try {
            await api.post('/access/add-resource', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Resource added successfully!");
            
            // Form-ஐ காலி செய்யவும்
            setResourceTitle('');
            setResourceType('PDF');
            setFile(null);
            setLink('');
            setFileName('No file selected');
            
            fetchResources(); 

        } catch (error) {
            console.error("Failed to add resource:", error);
            alert(error.response?.data?.message || "Resource upload failed.");
        } finally {
            setIsUploadingResource(false);
        }
    };

    const handleDeleteResource = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        
        try {
            await api.delete(`/access/resource/${id}`);
            alert("Resource deleted successfully.");
            fetchResources(); 
        } catch (error) {
            console.error("Failed to delete resource:", error);
            alert(error.response?.data?.message || "Failed to delete resource.");
        }
    };

    // --- ✅ புதிய வசதி: Clear Dates Handler ---
    const handleClearDates = () => {
        setStartDate('');
        setEndDate('');
        setDateError(null);
    };


    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Content Manager</h1>
                <p className="dashboard-description">Add, view, and delete all student resources and mock tests here.</p>
            </div>

            <div className="dashboard-grid">
                
                <main className="dashboard-main-content">
                    
                    {/* === UPLOAD RESOURCE SECTION === */}
                    <section className="dashboard-section animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                        <div className="upload-resource-card">
                            <h2 className="section-header">Upload New Resource</h2>
                            <form onSubmit={handleResourceSubmit}>
                                <div className="form-group">
                                    <label htmlFor="resourceTitle">Resource Title</label>
                                    <input type="text" id="resourceTitle" placeholder="e.g., TNPSC PYQ 2022 Solved" value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="resourceType">Resource Type</label>
                                    <select id="resourceType" value={resourceType} onChange={e => setResourceType(e.target.value)}>
                                        <option value="PDF">PDF</option>
                                        <option value="Video">Video</option>
                                        <option value="Link">Link</option>
                                        <option value="Image">Image</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fileUpload">Upload File (Optional)</label>
                                    <div className="file-input-wrapper">
                                        <input type="file" id="fileUpload" onChange={handleFileChange} />
                                        <span className="file-input-button">Browse...</span>
                                        <span className="file-input-text">{fileName}</span>
                                    </div>
                                </div>
                                <div className="or-divider"><span className="or-divider-text">OR</span></div>
                                <div className="form-group">
                                    <label htmlFor="externalLink">Add External Link (Optional)</label>
                                    <input type="text" id="externalLink" placeholder="https://youtube.com/..." value={link} onChange={e => { setLink(e.target.value); setFile(null); setFileName('No file selected'); }} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-full-width" disabled={isUploadingResource}>
                                    {isUploadingResource ? 'Uploading...' : 'Add Resource'}
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* === CURRENT RESOURCES SECTION === */}
                    <section className="dashboard-section animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        <h2 className="section-header">Current Resources ({resources.length})</h2>
                        
                        {isResourceLoading ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Loading resources...</p>
                        ) : resources.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No resources uploaded yet.</p>
                        ) : (
                            <div className="resource-list-grid">
                                {resources.map(resource => {
                                    const isUploaded = resource.link.startsWith('/uploads/');
                                    const resourceUrl = isUploaded ? `http://localhost:5000${resource.link}` : resource.link;
                                    
                                    return (
                                        <div className="resource-card" key={resource.id}>
                                            <div className={`resource-icon-wrapper resource-icon-${resource.type.toLowerCase()}`}>
                                                {resource.type.toUpperCase()}
                                            </div>
                                            <div className="resource-content">
                                                <span className="resource-title">{resource.title}</span>
                                                <span className="resource-link-text">{isUploaded ? 'Uploaded File' : 'External Link'}</span>
                                            </div>
                                            <div className="resource-actions">
                                                <a href={resourceUrl} target="_blank" rel="noopener noreferrer" className="resource-action-link">Open &rarr;</a>
                                                <button onClick={() => handleDeleteResource(resource.id)} className="resource-action-delete">Delete</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* === MANAGE MOCK TESTS SECTION === */}
                    <section className="dashboard-section animate-fadeInUp" style={{ animationDelay: '300ms' }}>
                        <h2 className="section-header">Manage Mock Tests</h2>
                        <p className="section-subtitle">Create exams for students. Add questions after creation.</p>
                        
                        {/* --- Create Test Form (Linked to State) --- */}
                        <div className="mock-test-form-card">
                            <h3 className="section-header" style={{ fontSize: '1.5rem', borderBottom: 'none', paddingBottom: '0' }}>Create New Mock Test</h3>
                            <form onSubmit={handleTestSubmit}>
                                <div className="form-group">
                                    <label htmlFor="testTitle">Test Title</label>
                                    <input type="text" id="testTitle" placeholder="e.g., TNPSC Group 4 - General Tamil" value={testTitle} onChange={e => setTestTitle(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Category</label>
                                    <input type="text" id="category" placeholder="e.g., TNPSC, General Aptitude, Infosys" value={testCategory} onChange={e => setTestCategory(e.target.value)} />
                                </div>
                                <div className="date-input-group">
                                    <div className="form-group">
                                        <label htmlFor="duration">Duration (Minutes)</label>
                                        <input type="number" id="duration" placeholder="60" value={testDuration} onChange={e => setTestDuration(Number(e.target.value))} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="totalMarks">Total Marks</label>
                                        <input type="number" id="totalMarks" placeholder="50" value={testMarks} onChange={e => setTestMarks(Number(e.target.value))} />
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

                                {/* --- ✅ புதிய வசதி (Error & Clear Button) --- */}
                                <div className="form-helpers">
                                    {dateError && (
                                        <span className="form-error-text">{dateError}</span>
                                    )}
                                    <button type="button" className="btn-link-secondary" onClick={handleClearDates}>
                                        Clear Dates
                                    </button>
                                </div>
                                {/* --- ✅ முடிந்தது --- */}

                                <button type="submit" className="btn btn-primary btn-full-width" disabled={isTestCreating || dateError}>
                                    {isTestCreating ? 'Creating...' : 'Create Mock Test'}
                                </button>
                            </form>
                        </div>

                        {/* --- Created Tests List (Using REAL Data) --- */}
                        <div className="mock-test-list-container" style={{ marginTop: '2.5rem' }}>
                            <h3 className="section-header" style={{ fontSize: '1.5rem' }}>Your Created Tests ({mockTests.length})</h3>
                            
                            {/* Loading State */ }
                            {isTestLoading && (
                                <p style={{ color: 'var(--text-secondary)' }}>Loading tests...</p>
                            )}

                            {/* Empty State */ }
                            {!isTestLoading && mockTests.length === 0 && (
                          <p style={{ color: 'var(--text-secondary)' }}>No mock tests created yet. Use the form above to add one.</p>
                            )}
                            
                            {/* Data List */ }
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
                                                    <li><span className="info-label">Duration:</span> {test.duration} mins</li>
                                                    <li><span className="info-label">Marks:</span> {test.totalMarks}</li>
                                                    <li><span className="info-label">Starts:</span> <strong>{starts.date}</strong> <br/> {starts.time} {starts.ampm}</li>
                                                    <li><span className="info-label">Ends:</span> <strong>{ends.date}</strong> <br/> {ends.time} {ends.ampm}</li>
                                                </ul>
                                                <div className="mock-test-actions">
                                                    <Link to={`/access/manage-test/${test.id}`} className="btn btn-primary mock-test-action-btn">Manage Questions</Link>
                                                    <button onClick={() => handleDeleteTest(test.id)} className="btn btn-danger mock-test-action-btn">Delete Test</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                  _ </section>
                </main>

                {/* --- Quick Tips Column (Right) --- */}
                <aside className="dashboard-sidebar animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                    <div className="quick-tips-card">
                        <h3 className="section-header">Quick Tips</h3>
                        <ul className="quick-tips-list">
                            <li>Provide either a FILE OR a LINK.</li>
                            <li>For Videos, select 'Video' and paste the link.</li>
                            <li>For PYQs or Resumes, select the type and upload the file.</li>
                            <li>If dates are left blank, the test is always available.</li>
                            <li>Click 'Manage Questions' to add questions.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}