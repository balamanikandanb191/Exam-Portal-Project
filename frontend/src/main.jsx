// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Unga ThemeProvider (idhula problem illa)
import { ThemeProvider } from './context/ThemeContext.jsx'; 

// ✅ ITHA ADD PANNUNGA
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ✅ IPPADI RENDAYUM WRAP PANNUNGA */}
      {/* Order mukkiyam illa, aana rendum irukkanum */}
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)