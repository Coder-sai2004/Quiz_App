import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AiGeneratePage() {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGenerate = async () => {
        try {
            setLoading(true);
            let extractedText = text;

            // If PDF uploaded, extract text
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await axios.post("https://quiz-backend-oe1c.onrender.com/api/extract-text", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                extractedText = res.data.text;
            }

            // Call AI quiz generation
            const quizRes = await axios.post("https://quiz-backend-oe1c.onrender.com/api/generate-quiz", {
                text: extractedText,
            });

            const questions = quizRes.data;

            // Redirect to Play.js with generated questions
            navigate("/play/quiz", { state: { questions, isAiQuiz: true } });

        } catch (err) {
            console.error("Error generating quiz:", err);
            alert("Failed to generate quiz. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-container">
            <h2 className="ai-heading">AI-Powered Quiz Generator</h2>

            <label className="ai-label">Paste Study Material</label>
            <textarea
                className="ai-textarea"
                placeholder="Paste study material here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
            />

            <label className="ai-label">Or Upload PDF</label>
            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="ai-file-input"
            />

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="ai-generate-btn"
            >
                {loading ? "Generating..." : "Generate Quiz"}
            </button>
        </div>
    );
}
