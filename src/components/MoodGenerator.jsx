import React, { useState } from 'react';
import './MoodGenerator.css';

const MoodGenerator = () => {
  const [moodInput, setMoodInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const emojiMoods = [
  { emoji: "🌅", label: "Grateful" },   // Will generate golden, warm, morning vibes
  { emoji: "🌊", label: "Refreshing" }, // Will generate cool, aquatic, bright blue vibes
  { emoji: "🌿", label: "Grounded" },   // Will generate earthy, green, forest vibes
  { emoji: "✨", label: "Inspired" },   // Will generate magical, starry, purple/gold vibes
  { emoji: "☁️", label: "Ethereal" }    // Will generate soft, white, airy cloud vibes
];


const getCalm = async (mood) => {
  setLoading(true);
  setResult(null); // Clear previous result to trigger a fresh UI state

  try {
    const response = await fetch(`http://localhost:3002/api/ai/mood-generator?mood=${encodeURIComponent(mood)}`);
    const data = await response.json();

    console.log("Image Data Received:", data);

    if (data.imageUrl) {
      setResult(data);
    } else {
      alert("Server sent data, but no image URL was found.");
    }
  } catch (err) {
    console.error("Connection Error:", err);
  } finally {
    setLoading(false);
  }
};

// --- In your JSX (Return) --
  return (
    <div className="mood-container">
      <h2 className="mood-title">Mood Harmonizer</h2>
      <p className="mood-subtitle">Click an emoji or type your feeling to find instant peace.</p>

      {/* Emoji Selection */}
      <div className="emoji-row">
        {emojiMoods.map((m, i) => (
          <div key={i} className="emoji-card" onClick={() => getCalm(m.label)}>
            <span className="emoji">{m.emoji}</span>
            <span className="label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mood-input-group">
        <input 
          type="text" 
          placeholder="Type how you feel (e.g. Heartbroken, Overwhelmed)..." 
          value={moodInput}
          onChange={(e) => setMoodInput(e.target.value)}
        />
        <button onClick={() => getCalm(moodInput)} disabled={!moodInput}>
          Find Peace
        </button>
      </div>

      {/* Result Section */}
      {/* // inside MoodGenerator.jsx, in the result section: */}
{loading && (
  <div className="zen-loader">
    <div className="harmonizer-spinner"></div>
    <p>Calibrating serenity and generating a unique visualization...</p>
    <p className="loading-sub">This can take up to 10 seconds. Breathe.</p>
  </div>
)}

{result && result.imageUrl && (
  <div className="mood-result-display">
    <h3>Your {result.mood} Zen Visualization</h3>
    
    <img 
  key={result.imageUrl} 
  src={result.imageUrl} 
  alt="Peaceful AI Art" 
  className="peace-image"
  // This is the most important part for 403 errors:
  referrerPolicy="no-referrer" 
  // Keep this to handle cross-origin issues:
  crossOrigin="anonymous" 
  onLoad={() => console.log("✅ Rendered!")}
  onError={(e) => console.log("❌ Failed again:", e)}
/>
    
    <p className="peace-quote">{result.quote}</p>
  </div>
)}
    </div>
  );
};
export default MoodGenerator;