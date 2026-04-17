import React, { useState } from 'react';
import './Auth.css';

const Auth = ({ onLogin }) => { // 1. Accept onLogin prop
  const [isSignup, setIsSignup] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // 2. Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(); 
  };

  return (
    <div className={`auth-container ${isFocused ? 'active-focus' : ''}`}>
      <div className="hex-grid"></div>

      <div className="auth-card">
        <div className="highlighter"></div>
        
        <div className="auth-header">
          <div className="logo-icon">
            <div className="icon-inner"></div>
          </div>
          <h1 className="brand-name">PicPoint</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required 
          />
          
          {isSignup && (
            <input 
              type="password" 
              placeholder="Confirm Password" 
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required 
            />
          )}
          
          <button type="submit" className="main-action-btn">
            {isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p onClick={() => setIsSignup(!isSignup)} className="toggle-text">
            {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </p>
          
          <div className="divider"><span>OR</span></div>
          
          {/* 3. Added onClick here for Guest Mode */}
          <button className="guest-btn" onClick={onLogin}>
            Continue in Guest Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;