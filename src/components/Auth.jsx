import React, { useState } from 'react';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    try {
      const response = await fetch(`http://localhost:3002/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('picpoint_user', JSON.stringify(data.user)); //
        onAuthSuccess();
      } else { alert(data.message); }
    } catch (err) { alert("Server is not running!"); }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>PicPoint</h1>
        {!isLogin && <input name="username" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} required />}
        <input name="email" type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input name="password" type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        <p onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Need an account? Sign up" : "Have an account? Login"}</p>
      </form>
    </div>
  );
};

export default Auth;