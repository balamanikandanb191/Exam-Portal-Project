// src/pages/LandingPage.jsx
// ✅✅✅ SARI PANNAPATTA MOTTHA FILE ✅✅✅

import React, { useState, useContext } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Make sure this path is correct

// (Indha path ah mattum check pannikonga)
import { AuthContext } from '../context/AuthContext'; 
import LoginPromptModal from '../components/UI/LoginPromptModal'; 

// This is the blob animation
const Blob = ({ className }) => (
  <div className={`blob ${className}`} />
);

// This is the "Why Choose EduPro" item
const FeatureItem = ({ imageSrc, title, description, delay = 0 }) => (
  <div 
    className="feature-item animate-fadeInUp"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="feature-image-wrapper"> 
      <img src={imageSrc} alt={title} className="feature-image-icon" /> 
    </div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

// PUTHU "HOW IT WORKS" ITEM
const StepperItem = ({ imageSrc, step, title, description, delay = 0 }) => (
  <div 
    className="stepper-item animate-fadeInUp"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="stepper-marker">
      <img src={imageSrc} alt={title} className="stepper-image-icon" /> 
    </div>
    <div className="stepper-content">
      <span className="stepper-step-title">{step}</span>
      <h3 className="stepper-title">{title}</h3>
      <p className="stepper-description">
        {description}
      </p>
    </div>
  </div>
);


const EXAMS = ["TNPSC","GATE","Railways","TCS","Accenture","NEET","UPSC","Bank PO", "SSC"];

export default function LandingPage() {
  
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ✅✅✅ PUTHU FUNCTION ✅✅✅
  // Oru common function, ella card kum use pannikalam
  // 'path' parameter eduthukkum (e.g., '/student/resumes')
  const handleProtectedFeatureClick = (path) => {
    if (user) {
      // User login pannirundha, antha path ku po
      navigate(path); 
    } else {
      // Illana, popup ah kaatu
      setIsLoginModalOpen(true);
    }
  };
  
  return (
    <main className="landing-main">
      
      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        
        <Blob className="blob-1" />
        <Blob className="blob-2" />

        <div className="hero-grid">
          <div className="hero-text-content animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h1 className="hero-title">
              Prepare Smarter, <br />
              <span className="hero-gradient-text">Achieve More</span>
            </h1>
            <p className="hero-description">
              Your ultimate hub for competitive exam preparation. Access previous year papers, video tutorials, resume templates, and mock tests – all in one place.
            </p>
            <div className="hero-buttons">
              <Link 
                to="/register" 
                className="btn btn-primary btn-hero"
              >
                Get Started for Free &rarr;
              </Link>
              <Link 
                to="/login" 
                className="btn btn-secondary btn-hero"
              >
                Login
              </Link>
            </div>
          </div>
          
          <div className="hero-image-container animate-fadeInUp" style={{animationDelay: '300ms'}}> 
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&q=80" 
              alt="Students studying together"
              className="hero-image"
             />
          </div>
        </div>
      </section>

      {/* --- EXAMS SECTION (MARQUEE) --- */}
      <section className="exams-section animate-fadeInUp" style={{ animationDelay: '400ms' }}>
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">
              Covering All Major Exams
            </h2>
            <p className="section-subtitle">
              From civil services to tech placements, we have the resources you need.
            </p>
          </div>
          
          <div className="exams-marquee-container">
            <div className="exams-marquee-track">
              {EXAMS.map(x => (
                <span key={x} className="exam-pill">
                  {x}
                </span>
              ))}
              {EXAMS.map(x => (
                <span key={`${x}-clone`} className="exam-pill" aria-hidden="true">
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="features-section"> 
        <div className="landing-container">
          <h2 className="section-title text-center animate-fadeInUp" style={{ animationDelay: '500ms' }}>
            Why Choose EduPro?
          </h2>
          
          {/* ✅✅✅ ELLA CARD KUM ONCLICK ADD PANNIYACHU ✅✅✅ */}
          <div className="features-grid"> 

            {/* Note: Unga correct path ah '()' kulla kudunga */}

            <div onClick={() => handleProtectedFeatureClick('/student/resumes')} style={{ cursor: 'pointer' }}>
              <FeatureItem
                imageSrc="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1"
                title="Resume Templates"
                description="Craft the perfect resume with 50+ professional templates. Download instantly."
                delay={600}
              />
            </div>
            
            <div onClick={() => handleProtectedFeatureClick('/student/videos')} style={{ cursor: 'pointer' }}>
              <FeatureItem
                imageSrc="https://images.pexels.com/photos/109275/pexels-photo-109275.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1"
                title="Videos & Tutorials"
                description="Learn effectively with high-quality video lessons tailored for each exam."
                delay={700}
              />
            </div>

            <div onClick={() => handleProtectedFeatureClick('/student/resources')} style={{ cursor: 'pointer' }}>
              <FeatureItem
                imageSrc="https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1"
                title="Previous Year Papers"
                description="Practice makes perfect! Access past papers with solutions & answer keys."
                delay={800}
              />
            </div>
            
            <div onClick={() => handleProtectedFeatureClick('/student/mock-tests')} style={{ cursor: 'pointer' }}>
              <FeatureItem
                imageSrc="https://images.pexels.com/photos/4050319/pexels-photo-4050319.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1"
                title="Mock Tests"
                description="Evaluate your preparation with realistic mock tests designed by experts."
                delay={900}
              />
            </div>
            
            <div onClick={() => handleProtectedFeatureClick('/student/analysis')} style={{ cursor: 'pointer' }}>
              <FeatureItem
                imageSrc="https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1" 
                title="Performance Analysis"
                description="Track your progress and identify weak areas with detailed test analysis."
                delay={1000}
              />
            </div>

            {/* Idhu "Role-Based Access" card, idha click panna dashboard ku pogattum */}
            <div onClick={() => handleProtectedFeatureClick('/student')} style={{ cursor: 'pointer' }}>
              <FeatureItem
                imageSrc="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1" 
                title="Role-Based Access"
                description="Separate dashboards for Students, Admins, and Resource Managers."
                delay={1100}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================
       MODERN "HOW IT WORKS" SECTION
       ==================================
      */}
      <section className="how-it-works-section">
        <div className="landing-container">
          <h2 className="section-title text-center animate-fadeInUp" style={{ animationDelay: '1150ms' }}>
            Get Started in 3 Easy Steps
          </h2>
          <p className="section-subtitle text-center animate-fadeInUp" style={{ animationDelay: '1200ms', maxWidth: '42rem', margin: '0 auto 3rem auto' }}>
            Learning on EduPro is simple. Follow these steps to begin your journey.
          </p>

          {/* --- PUTHU VERTICAL STEPPER --- */}
          <div className="stepper-container animate-fadeInUp" style={{ animationDelay: '1250ms' }}>
            
            <StepperItem
              imageSrc="https://images.pexels.com/photos/5082576/pexels-photo-5082576.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1"
              step="Step 1"
              title="Create Your Account"
              description="Sign up for free, set up your profile, and tell us your learning goals."
            />
            <StepperItem
              imageSrc="https://images.pexels.com/photos/270632/pexels-photo-270632.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1"
              step="Step 2"
              title="Choose Your Exam"
              description="Browse our vast library and select the exams you want to prepare for."
            />
            <StepperItem
              imageSrc="https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1"
              step="Step 3"
              title="Start Learning"
              description="Access all resources, take mock tests, and track your progress instantly."
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="cta-section animate-fadeInUp" style={{ animationDelay: '1500ms' }}>
         <div className="landing-container">
           <div className="cta-content">
             <h2 className="cta-title">
               Ready to Start Learning?
             </h2>
             <p className="cta-description">
               Join thousands of students preparing smarter with EduPro.
             </p>
             <Link 
               to="/register" 
               className="btn btn-white"
             >
               Sign Up Now
             </Link>
           </div>
         </div>
       </section>
       
      {/* Modal (Idhu default ah hide la thaan irukkum) */}
      <LoginPromptModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

    </main>
  );
}