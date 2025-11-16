import React, { useEffect, useState } from "react";
import api from "../../api"; 
import { useNavigate, Link } from "react-router-dom"; 
import './StudentDashboard.css';

function Card({ children, className = "" }) {
  return <div className={`card card-hover animate-fadeInUp ${className}`}>{children}</div>;
}

function MockTestCard({ test, onStartTest }) {
  return (
    <Card className="test-card">
      <div className="card-content-row">
        <div>
          <div className="test-category">{test.category}</div>
          <h3 className="card-title">{test.title}</h3>
          <p className="card-description">Duration: {test.duration} mins</p>
          <p className="card-description">Marks: {test.totalMarks}</p>
        </div>
        <button onClick={() => onStartTest(test.id)} className="btn btn-primary btn-start-test">
          Start Test
        </button>
      </div>
    </Card>
  );
}


export default function StudentDashboard() {
  const [resources, setResources] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate(); 

  // --- "Profile" பகுதிக்குத் தேவையான State ---
  const [name, setName] = useState('Student');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  
  // --- "Edit Bio" வசதிக்கான State ---
  const [bio, setBio] = useState(localStorage.getItem("bio") || "Click your logo to add a bio!"); // ✅ Text மாத்தியாச்சு
  const [tempBio, setTempBio] = useState("");
  const [editMode, setEditMode] = useState(false);

  // --- ✅ புதிய வசதி: Bio Open/Close State ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // ----------------------------------------

  useEffect(() => {
    const storedName = localStorage.getItem("name") || "Student";
    const storedEmail = localStorage.getItem("email") || "No email found"; 
    const storedRole = localStorage.getItem("role") || "student"; 

    setName(storedName);
    setEmail(storedEmail);
    setRole(storedRole);

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMockTests(), loadResources()]);
    } catch (error) {
      console.error("Error loading student dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMockTests = async () => {
    try {
      const res = await api.get("/student/mock-tests");
      setMockTests(res.data);
    } catch (err) { console.error("Failed to load mock tests:", err); setMockTests([]); }
  };

  const loadResources = async () => {
    try {
      const res = await api.get("/student/resources");
      setResources(res.data);
    } catch (err) { console.error("Failed to load resources:", err); setResources([]); }
  };

  const handleStartTest = (testId) => {
    console.log("Attempting to start test:", testId);
    navigate(`/student/take-test/${testId}`); 
  };

  // --- "Edit Bio" Handlers ---
  const handleEditBio = () => {
    setTempBio(bio === "Click your logo to add a bio!" ? "" : bio); 
    setEditMode(true);
  };

  const handleSaveBio = () => {
    const newBio = tempBio.trim() || "Click your logo to add a bio!";
    setBio(newBio);
    localStorage.setItem("bio", newBio); 
    setEditMode(false);
  };

  const handleCancelBio = () => {
    setEditMode(false);
    setTempBio(bio);
  };
  // ----------------------------------------


  const getYoutubeThumbnail = (link) => {
    try {
      if (!link || (!link.includes('youtube.com') && !link.includes('youtu.be'))) { return null; }
      let videoId;
      if (link.includes('youtu.be')) { videoId = link.split('/').pop().split('?')[0]; }
      else { const urlParams = new URLSearchParams(new URL(link).search); videoId = urlParams.get('v'); }
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    } catch (e) { console.error("Error parsing YouTube URL:", link, e); return null; }
  }

  const videoResources = resources.filter(r => r.type && r.type.toLowerCase() === "video");
  const studyMaterials = resources.filter(r => r.type && r.type.toLowerCase() !== "video");

  if (loading) {
    return (
      <div className="loading-placeholder">
        <span className="spinner"></span>
        <p>Loading Your Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-container animate-fadeInUp">
      <div className="student-header">
        <div>
          <h1 className="page-title">Hello, {name}</h1>
          <p className="page-subtitle">Ready to test your skills and learn something new?</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h2 className="section-title">My Profile</h2>
        <div className="profile-card-wrapper">
          <div className="profile-card">
            <div className="profile-header">
              {/* --- ✅ Avatar (Logo) இப்போது Clickable --- */}
              <img 
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=8B5CF6&radius=50&size=96`} 
                className="profile-avatar clickable" 
                alt="avatar" 
                onClick={() => setIsProfileOpen(!isProfileOpen)} // ✅ Click செய்தால் Bio open/close ஆகும்
                title="Click to expand bio"
              />
              <div className="profile-info">
                <h3 className="profile-name">{name}</h3>
                <p className="profile-email">{email}</p>
              </div>
              <span className="profile-role-tag">{role}</span>
            </div>
            
            {/* --- ✅ Bio பகுதி இப்போது isProfileOpen-ஐ பொறுத்து காட்டும் --- */}
            {isProfileOpen && (
              <div className="profile-bio-section animate-fadeInUp">
                <h4 className="bio-title">About Me</h4>
                {editMode ? (
                  <div className="bio-edit-container">
                    <textarea 
                      className="profile-bio-edit"
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows="4"
                    />
                    <div className="profile-actions">
                      <button onClick={handleCancelBio} className="btn btn-secondary btn-small">Cancel</button>
                      <button onClick={handleSaveBio} className="btn btn-primary btn-small">Save Bio</button>
                    </div>
                  </div>
                ) : (
                  <div className="bio-view-container">
                    <p className="profile-bio">{bio}</p>
                    <div className="profile-actions">
                      <button onClick={handleEditBio} className="btn btn-secondary btn-small btn-bio-edit">
                        Edit Bio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Available Mock Tests</h2>
        <div className="grid-container"> 
          {mockTests.length > 0 ? (
            mockTests.map(test => (
              <MockTestCard key={test.id} test={test} onStartTest={handleStartTest} />
            ))
          ) : (
            <div className="card empty-placeholder full-span">
              <p>No mock tests available currently. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Featured Videos</h2>
        <div className="grid-container">
          {videoResources.length > 0 ? (
            videoResources.slice(0, 3).map(r => {
              const thumbnail = getYoutubeThumbnail(r.link);
              return (
              <div key={r.id} className="card card-hover video-card">
                <a href={r.link} target="_blank" rel="noreferrer" className="video-thumbnail-link">
                  <img
                    src={thumbnail || "https://placehold.co/600x400/1F2937/9CA3AF?text=Video"} 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1F2937/9CA3AF?text=Video+Unavailable" }}
                    className="video-thumbnail-img" 
                    alt="video thumbnail"
                  />
                </a>
                <div className="card-body"> 
                  <h4 className="card-title">{r.title}</h4>
                  <span className="card-tag">{r.type}</span>
                  <a href={r.link} target="_blank" rel="noreferrer" className="btn-link"> 
                    Watch Video <span>→</span>
                  </a>
                </div>
              </div>
            )})
          ) : (
            <div className="card empty-placeholder full-span">
              <p>No videos found currently.</p>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Study Materials & Papers</h2>
        <div className="grid-container-2col">
          {studyMaterials.length > 0 ? (
            studyMaterials.map(r => (
              <Card key={r.id} className="resource-card">
                <div className="card-content-row">
                  <div className="resource-info-group">
                    <div className={`resource-icon-wrapper resource-icon-${r.type.toLowerCase()}`}>
                      {r.type.toUpperCase()}
                    </div>
                    <div className="card-info">
                      <h4 className="card-title-small">{r.title}</h4>
                      <p className="card-description">{r.link.startsWith('/uploads') ? 'Uploaded File' : 'External Link'}</p>
                    </div>
                  </div>
                  <a 
                    className="btn btn-secondary btn-small resource-link" 
                    href={r.link.startsWith('http') ? r.link : `http://localhost:5000${r.link}`} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    Open <span>→</span>
                  </a>
                </div>
              </Card> 
            ))
          ) : (
            <div className="card empty-placeholder full-span">
              <p>No study materials or papers found currently.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}