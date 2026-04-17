import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
        {/* 2. Background is placed here so it is visible on ALL routes */}

        <Routes>
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
          <Route path="/login" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;