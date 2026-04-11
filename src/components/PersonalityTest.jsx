import React, { useState, useEffect } from 'react';
import './PersonalityTest.css';

const PersonalityTest = () => {
  const [displayImages, setDisplayImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [personality, setPersonality] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAIImages = async () => {
    setLoading(true);
    setErrorMsg("");
    setPersonality(null);
    setSelectedIds([]);
    try {
      const res = await fetch('http://localhost:3002/api/ai/test-images');
      if (!res.ok) throw new Error(`Server Status: ${res.status}`);
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setDisplayImages(data);
      } else {
        setErrorMsg("Backend returned zero images.");
      }
    } catch (err) {
      setErrorMsg(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIImages();
  }, []);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const analyzePersonality = () => {
    const chosenOnes = displayImages.filter(img => selectedIds.includes(img._id));
    const traits = chosenOnes.map(c => c.trait).join(' and ');
    setPersonality(`PicPoint Analysis: You have a ${traits} vibe.`);
  };

  return (
    <div className="personality-test-wrapper">
      <h2 className="glow-title">AI Personality Synthesis</h2>

      {errorMsg && <p className="error-banner">{errorMsg}</p>}

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Generating your unique visual profile...</p>
        </div>
      ) : (
        <>
          {!personality ? (
            <div className="selection-area">
              <p className="subtitle">Select 2-3 images that resonate with you</p>
              
              {/* Grid with side-by-side images */}
              <div className="options-grid">
                {displayImages.map((img) => (
                  <div 
                    key={img._id} 
                    className={`img-card ${selectedIds.includes(img._id) ? 'selected' : ''}`}
                    onClick={() => toggleSelect(img._id)}
                  >
                    <img src={img.url} alt="AI Choice" />
                    {selectedIds.includes(img._id) && <div className="badge">✓</div>}
                  </div>
                ))}
              </div>

              {/* Centered Analyze Button */}
              <div className="btn-wrapper">
                <button 
                  className="analyze-btn" 
                  disabled={selectedIds.length < 2}
                  onClick={analyzePersonality}
                >
                  Analyze My Personality
                </button>
              </div>
            </div>
          ) : (
            <div className="result-container">
              <div className="result-card">
                <h3>Your Aesthetic Identity</h3>
                <p className="personality-text">{personality}</p>
                <button onClick={fetchAIImages} className="retake-btn">
                  Retake the Test
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PersonalityTest;