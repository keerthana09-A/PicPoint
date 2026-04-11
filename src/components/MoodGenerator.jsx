import React, { useState } from 'react';

const MoodGenerator = () => {
  const [img, setImg] = useState(null);
  const [load, setLoad] = useState(false);
  const moods = ["Happy", "Mysterious", "Energetic", "Calm", "Cyberpunk", "Dreamy"];

  const getVibe = async (m) => {
    setLoad(true);
    setImg(null);
    try {
      const res = await fetch('http://localhost:3002/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: m }),
      });
      const data = await res.json();
      setImg(data.imageUrl);
    } catch (e) { console.error(e); }
    finally { setLoad(false); }
  };

  return (
    <div className="mood-box">
      <h2>Mood Vibe Generator</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '20px 0' }}>
        {moods.map(m => (
          <button key={m} onClick={() => getVibe(m)} className="vibe-btn">{m}</button>
        ))}
      </div>
      {load && <p>Generating your mood...</p>}
      {img && <img src={img} alt="result" style={{ width: '100%', borderRadius: '15px', border: '1px solid #00f2ea' }} />}
    </div>
  );
};

export default MoodGenerator;