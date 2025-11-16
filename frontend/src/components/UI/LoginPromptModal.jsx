// src/components/UI/LoginPromptModal.jsx
// ✅✅✅ SERI PANNAPATTA FILE ✅✅✅

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPromptModal.css'; // Idhu mattum podhum

export default function LoginPromptModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  // isOpen false na, onnum kaatadhu
  if (!isOpen) return null;

  const handleLoginClick = () => {
    onClose(); // Modal ah close pannu
    navigate('/login'); // Login page ku po
  };

  return (
    // Velila irukura dark background
    <div className="modal-backdrop" onClick={onClose}>
      {/* Popup Box */}
      {/* onClick vechu, box kulla click panna close aagadhu */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Login Required</h3>
        <p className="modal-body">
          Please login first to access this feature.
        </p>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleLoginClick} className="btn btn-primary">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}