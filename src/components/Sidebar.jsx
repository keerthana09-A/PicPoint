import React from 'react';

const Sidebar = ({ setActiveComponent }) => {
  return (
    <div style={{ padding: '40px 20px' }}>
      <h1 style={{ color: '#00f2ff', fontSize: '2rem', marginBottom: '50px' }}>PicPoint</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li className="nav-item" onClick={() => setActiveComponent('albums')} style={liStyle}>📁 Albums</li>
        <li className="nav-item" onClick={() => setActiveComponent('personality')} style={liStyle}>🧠 Personality Test</li>
        <li className="nav-item" onClick={() => setActiveComponent('mood')} style={liStyle}>🎨 Mood Generator</li>
      </ul>
    </div>
  );
};

const liStyle = {
  padding: '15px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  color: '#ccc'
};

export default Sidebar;