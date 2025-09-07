import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';

const QuizSummary = () => {
  const location = useLocation();
  const [state, setState] = useState({
    score: 0,
    numberOfQuestions: 0,
    numberOfAnsweredQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    skippedQuestions: 0,
    hintsUsed: 0,
    fiftyFiftyUsed: 0,
    remark: ''
  });

  useEffect(() => {
    if (location.state) {
      const score = (location.state.score / location.state.numberOfQuestions) * 100;
      let remark;
      if (score <= 30) {
        remark = 'You need more practice!';
      } else if (score > 30 && score <= 50) {
        remark = 'Better luck next time!';
      } else if (score <= 70 && score > 50) {
        remark = 'You can do better!';
      } else if (score >= 71 && score <= 84) {
        remark = 'You did great!';
      } else {
        remark = 'You\'re an absolute genius!';
      }
      setState({
        score: score,
        numberOfQuestions: location.state.numberOfQuestions,
        numberOfAnsweredQuestions: location.state.numberOfAnsweredQuestions,
        correctAnswers: location.state.correctAnswers,
        wrongAnswers: location.state.wrongAnswers,
        skippedQuestions: location.state.skippedQuestions,
        hintsUsed: location.state.hintsUsed,
        fiftyFiftyUsed: location.state.fiftyFiftyUsed,
        remark: remark
      });
    }
  }, [location]);

  let stats;
  if (location.state) {
    stats = (
      <div>
        <div style={{ textAlign: 'center' }}>
          <span className="mdi mdi-check-circle-outline success-icon"></span>
        </div>
        <h1>Quiz has ended</h1>
        <div className="container stats">
          <h4>{state.remark}</h4>
          <h2>Your Score: {state.score.toFixed(0)}&#37;</h2>

          <span className="stat left">Total number of questions: </span>
          <span className="right">{state.numberOfQuestions}</span><br />

          <span className="stat left">Number of attempted questions: </span>
          <span className="right">{state.numberOfAnsweredQuestions}</span><br />

          <span className="stat left">Number of Correct Answers: </span>
          <span className="right">{state.correctAnswers}</span><br />

          <span className="stat left">Number of Wrong Answers: </span>
          <span className="right">{state.wrongAnswers}</span><br />

          <span className="stat left">Number of Skipped Questions: </span>
          <span className="right">{state.skippedQuestions}</span><br />

          <span className="stat left">Hints Used: </span>
          <span className="right">{state.hintsUsed}</span><br />

          <span className="stat left">50-50 Used: </span>
          <span className="right">{state.fiftyFiftyUsed}</span>
        </div>
        <section>
          <ul>
            <li>
              <Link to="/play/CategoryDifficultySelection">Play Again</Link>
            </li>
            <li>
              <Link to="/">Back to Home</Link>
            </li>
          </ul>
        </section>
      </div>
    );
  } else {
    stats = (
      <section>
        <h1 className="no-stats">No Statistics Available</h1>
        <ul>
          <li>
            <Link to="/play/quiz">Take a Quiz</Link>
          </li>
          <li>
            <Link to="/">Back to Home</Link>
          </li>
        </ul>
      </section>
    );
  }

  return (
    <div>
      <Helmet><title>Quiz App - Summary</title></Helmet>
      <div className="quiz-summary">
        {stats}
      </div>
    </div>
  );
};

export default QuizSummary;
