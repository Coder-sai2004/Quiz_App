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
                    "Authorization": "Bearer " + token
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
        <div style={{ padding: "20px" }}>
            <Helmet><title>Admin Panel</title></Helmet>
            <h2>Admin Panel - Add Question</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
                <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
                <input type="text" name="difficulty" placeholder="Difficulty" value={formData.difficulty} onChange={handleChange} required />
                <textarea name="question" placeholder="Question" value={formData.question} onChange={handleChange} required />
                <input type="text" name="optionA" placeholder="Option A" value={formData.optionA} onChange={handleChange} required />
                <input type="text" name="optionB" placeholder="Option B" value={formData.optionB} onChange={handleChange} required />
                <input type="text" name="optionC" placeholder="Option C" value={formData.optionC} onChange={handleChange} required />
                <input type="text" name="optionD" placeholder="Option D" value={formData.optionD} onChange={handleChange} required />
                <input type="text" name="answer" placeholder="Correct Answer (A/B/C/D)" value={formData.answer} onChange={handleChange} required />
                <button type="submit">Add Question</button>
            </form>
        </div>
    );
};

export default AdminPanel;
