import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to see your history.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/quiz/history`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          console.error("Unexpected history payload:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="loading-text">Loading history...</p>;
  }

  if (!history.length) {
    return <p className="no-history-text">No past quiz attempts found.</p>;
  }

  return (
    <div className="history-container">
      <Helmet>
        <title>Quiz History</title>
      </Helmet>
      <h2>Your Quiz History</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Difficulty</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {history.map((attempt, index) => (
            <tr key={index}>
              <td>{new Date(attempt.date).toLocaleString()}</td>
              <td>{attempt.category}</td>
              <td>{attempt.difficulty}</td>
              <td>{attempt.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
