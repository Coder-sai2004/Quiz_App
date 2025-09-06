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

  // Fetch categories & difficulties from backend
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
    <div className="category-container" style={{ padding: '20px' }}>
      <Helmet>
        <title>Select Category & Difficulty - Quiz App</title>
      </Helmet>

      <h2>Select your Quiz Preferences</h2>

      <div className="input-field" style={{ marginBottom: '20px' }}>
        <label htmlFor="category">Category:</label><br /><br />
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '8px' }}
        >
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="input-field" style={{ marginBottom: '20px' }}>
        <label htmlFor="difficulty">Difficulty:</label><br /><br />
        <select
          id="difficulty"
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '8px' }}
        >
          <option value="">-- Select Difficulty --</option>
          {difficulties.map(diff => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button
        className="next-btn"
        onClick={handleStart}
        style={{ padding: '10px 20px', cursor: 'pointer' }}
      >
        Next: Instructions
      </button>
    </div>
  );
};

export default CategoryDifficultySelection;
