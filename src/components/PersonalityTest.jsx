import React, { useState } from 'react';

const PersonalityTest = () => {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    { 
      q: "Which environment fuels your focus?", 
      options: ["Neon Metropolis", "Ancient Library", "Deep Abyss", "Floating Garden"] 
    },
    { 
      q: "Choose your primary element:", 
      options: ["Electric Pulse", "Solid Granite", "Flowing Ether", "Solar Flare"] 
    }
  ];

  const handleSelection = (option) => {
    const updatedChoices = [...choices, option];
    setChoices(updatedChoices);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      generateAIResponse(updatedChoices);
    }
  };

  const generateAIResponse = async (finalChoices) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:3002/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `A spiritual fusion of ${finalChoices.join(" and ")} digital art style` 
        }),
      });
      const data = await response.json();
      setResult(data.imageUrl);
    } catch (error) {
      alert("Error: Ensure Backend (Port 3002) is running in the terminal!");
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setStep(0);
    setChoices([]);
    setResult(null);
  };

  return (
    <div className="personality-test-wrapper">
      <h2 className="glow-title">AI Personality Synthesis</h2>

      {!loading && !result && (
        <div className="quiz-card">
          <p className="question-text">{questions[step].q}</p>
          <div className="options-grid">
            {questions[step].options.map((opt) => (
              <button key={opt} onClick={() => handleSelection(opt)} className="opt-btn">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Analyzing your digital signature...</p>
        </div>
      )}

      {result && (
        <div className="result-container">
          <h3 className="result-header">Your Visual Archetype:</h3>
          <img src={result} alt="AI Personality Vibe" className="generated-vibe" />
          <button onClick={startOver} className="retry-btn">Retest Personality</button>
        </div>
      )}
    </div>
  );
};

export default PersonalityTest;