import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Albums from './Albums';
import Profile from './Profile';
import PersonalityTest from './PersonalityTest';
import MoodGenerator from './MoodGenerator';
import './Dashboard.css';

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState('albums');
  const user = JSON.parse(localStorage.getItem('picpoint_user')) || { username: 'Guest' };

  const renderComponent = () => {
    switch(activeComponent) {
      case 'albums': return <Albums />;
      case 'profile': return <Profile />;
      case 'personality': return <PersonalityTest />;
      case 'mood': return <MoodGenerator />;
      default: return <Albums />;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar-column">
        <Sidebar setActiveComponent={setActiveComponent} />
      </aside>

      <main className="main-content-column">
        <header className="dashboard-header">
          <div className="header-left">
            <h2>{activeComponent.toUpperCase()}</h2>
          </div>
          <div className="user-nav" onClick={() => setActiveComponent('profile')}>
            <span className="nav-username">{user.username}</span>
            <div className="mini-avatar">{user.username.charAt(0)}</div>
          </div>
        </header>

        <div className="content-area">
          {renderComponent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;