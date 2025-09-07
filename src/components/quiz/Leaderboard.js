import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const fetchLeaderboard = () => {
    setLoading(true);
    let url = `${API_BASE}/quiz/leaderboard`;
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
    if (params.length) url += "?" + params.join("&");

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLeaders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // 🏅 Helper to show medal for top 3
  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <div className="leaderboard-wrapper">
      <Helmet>
        <title>Leaderboard</title>
      </Helmet>

      {/* Header with filter */}
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard - Top 10</h2>
        <div>
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="leaderboard-filter"
          />
          <input
            type="text"
            placeholder="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="leaderboard-filter"
          />
          <button onClick={fetchLeaderboard} className="leaderboard-filter">
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-message">Loading leaderboard...</p>
      ) : leaders.length === 0 ? (
        <p className="empty-message">No leaderboard data found.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {leaders.slice(0, 10).map((player, index) => {
              const rank = index + 1;
              return (
                <tr key={index}>
                  <td>{rank}</td>
                  <td>
                    {getMedal(rank)} {player.username}
                  </td>
                  <td>{player.category}</td>
                  <td>{player.difficulty}</td>
                  <td>{player.score}</td>
                  <td>{new Date(player.date).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
