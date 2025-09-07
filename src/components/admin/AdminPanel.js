import React, { useState } from "react";
import { Helmet } from "react-helmet";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    category: "",
    difficulty: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in as admin.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/questions/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Question added!");
        setFormData({
          category: "",
          difficulty: "",
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          answer: ""
        });
      } else {
        alert(data.error || "Failed to add question");
      }
    } catch (err) {
      console.error("Error adding question:", err);
      alert("Error adding question");
    }
  };

  return (
    <div className="admin-panel-container">
      <Helmet>
        <title>Admin Panel</title>
      </Helmet>
      <h2 className="admin-panel-title">Admin Panel - Add Question</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="admin-input"
        />

        <label htmlFor="difficulty">Difficulty</label>
        <input
          type="text"
          id="difficulty"
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          required
          className="admin-input"
        />

        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          name="question"
          value={formData.question}
          onChange={handleChange}
          required
          className="admin-input"
        />

        <label htmlFor="optionA">Option A</label>
        <input
          type="text"
          id="optionA"
          name="optionA"
          value={formData.optionA}
          onChange={handleChange}
          required
          className="admin-input"
        />

        <label htmlFor="optionB">Option B</label>
        <input
          type="text"
          id="optionB"
          name="optionB"
          value={formData.optionB}
          onChange={handleChange}
          required
          className="admin-input"
        />

        <label htmlFor="optionC">Option C</label>
        <input
          type="text"
          id="optionC"
          name="optionC"
          value={formData.optionC}
          onChange={handleChange}
          required
          className="admin-input"
        />

        <label htmlFor="optionD">Option D</label>
        <input
          type="text"
          id="optionD"
          name="optionD"
          value={formData.optionD}
          onChange={handleChange}
          required
          className="admin-input"
        />

        <label htmlFor="answer">Correct Answer (A/B/C/D)</label>
        <input
          type="text"
          id="answer"
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          required
          className="admin-input"
        />

        <button type="submit" className="admin-submit-btn">
          Add Question
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;
