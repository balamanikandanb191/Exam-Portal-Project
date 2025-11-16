// src/components/UI/Spinner.jsx
import React from 'react';
import './Spinner.css'; // Dedicated CSS for Spinner

export default function Spinner({ small = false }) {
  return (
    <div className={`spinner ${small ? 'spinner-small' : ''}`}></div>
  );
}