import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);

  // --- CRITICAL: THE BACKEND LINK ---
  // We define it here once so all components use the same "source of truth"
  const BACKEND_URL = "https://picpoint-backend.onrender.com";

  useEffect(() => {
    const savedUser = localStorage.getItem('picpoint_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSuccess = () => {
    const savedUser = localStorage.getItem('picpoint_user');
    setUser(JSON.parse(savedUser));
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              !user ? (
                // Pass the URL down as a "prop"
                <Auth onAuthSuccess={handleAuthSuccess} backendUrl={BACKEND_URL} />
              ) : (
                // Pass the URL to the Dashboard so your Profile can use it
                <Dashboard backendUrl={BACKEND_URL} />
              )
            } 
          />
          <Route 
            path="/login" 
            element={<Auth onAuthSuccess={handleAuthSuccess} backendUrl={BACKEND_URL} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;