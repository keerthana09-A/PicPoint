import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);

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
        {/* This main route handles your existing Auth/Dashboard toggle */}
        <Route 
          path="/" 
          element={
            !user ? (
              <Auth onAuthSuccess={handleAuthSuccess} />
            ) : (
              <Dashboard />
            )
          } 
        />
        
        {/* We add this "ghost" route. It won't be visible, but it 
            provides the 'context' needed so Profile doesn't crash. */}
        <Route path="/login" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
      </Routes>
    </div>
  </Router>
);
}

export default App;