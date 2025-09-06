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
            .then(res => res.json())
            .then(data => {
                setLeaders(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching leaderboard:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <Helmet><title>Leaderboard</title></Helmet>
            <h2>🏆 Leaderboard - Best Scores</h2>

            {/* Filter controls */}
            <div style={{ marginBottom: "15px" }}>
                <input
                    type="text"
                    placeholder="Filter by Category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ marginRight: "10px" }}
                />
                <input
                    type="text"
                    placeholder="Filter by Difficulty"
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    style={{ marginRight: "10px" }}
                />
                <button onClick={fetchLeaderboard}>Apply Filters</button>
            </div>

            {loading ? (
                <p>Loading leaderboard...</p>
            ) : leaders.length === 0 ? (
                <p>No leaderboard data found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ width: "100%", textAlign: "center" }}>
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
                        {leaders.map((player, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{player.username}</td>
                                <td>{player.category}</td>
                                <td>{player.difficulty}</td>
                                <td>{player.score}</td>
                                <td>{new Date(player.date).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Leaderboard;
