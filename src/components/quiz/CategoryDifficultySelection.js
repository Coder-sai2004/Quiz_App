import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CategoryDifficultySelection = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/meta`)
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setDifficulties(data.difficulties || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching metadata:', err);
        setLoading(false);
      });
  }, []);

  const handleStart = () => {
    if (!category || !difficulty) {
      alert('Please select both category and difficulty.');
      return;
    }
    navigate('/play/instructions', { state: { category, difficulty } });
  };

  if (loading) {
    return <p>Loading categories & difficulties...</p>;
  }

  return (
    <div className="category-container">
      <Helmet>
        <title>Select Category & Difficulty - Quiz App</title>
      </Helmet>

      <h2 className="category-heading">Select your Quiz Preferences</h2>

      <div className="input-field">
        <p className="select-label">Category:</p><br></br><br></br>
        <div className="button-group">
          {categories.map(cat => (
            <button
              key={cat}
              className={`option-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="input-field">
        <p className="select-label">Difficulty:</p><br></br><br></br>
        <div className="button-group">
          {difficulties.map(diff => (
            <button
              key={diff}
              className={`option-btn ${difficulty === diff ? 'active' : ''}`}
              onClick={() => setDifficulty(diff)}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button className="next-btn" onClick={handleStart}>
        Next: Instructions
      </button>
    </div>
  );
};

export default CategoryDifficultySelection;
