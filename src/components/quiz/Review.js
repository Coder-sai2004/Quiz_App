import React from "react";
import { useLocation, useNavigate } from "react-router-dom";


const ReviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { answers = [] } = location.state || {};

    return (
        <div className="review-container">
            <h2 className="review-title">Answer Review</h2>

            {answers.length === 0 && <p>No answers to review.</p>}

            <div className="review-list">
                {answers.map((ans, index) => (
                    <div
                        key={index}
                        className={`review-card ${ans.selected && ans.selected.toLowerCase() === ans.correct.toLowerCase()
                                ? "correct"
                                : "wrong"
                            }`}
                    >
                        <p className="question-text">{index + 1}. {ans.question}</p>

                        <p>
                            <strong>Your Answer:</strong>{" "}
                            {ans.selected ? (
                                <span
                                    className={`user-answer ${ans.selected.toLowerCase() === ans.correct.toLowerCase()
                                            ? "correct-text"
                                            : "wrong-text"
                                        }`}
                                >
                                    {ans.selected}
                                </span>
                            ) : (
                                <span className="skipped">Skipped</span>
                            )}
                        </p>

                        <p>
                            <strong>Correct Answer:</strong>{" "}
                            <span className="correct-text">{ans.correct}</span>
                        </p>
                    </div>
                ))}
            </div>

            <button className="back-btn" onClick={() => navigate("/")}>Back to Home</button>
        </div>
    );
};

export default ReviewPage;