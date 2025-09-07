import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import M from 'materialize-css';
import classnames from 'classnames';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// shuffle fallback
const shuffleArray = (array) => {
  let newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Play = () => {
  const location = useLocation();
  const { category, difficulty } = location.state || {};

  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [hints, setHints] = useState(5);
  const [fiftyFifty, setFiftyFifty] = useState(2);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [previousRandomNumbers, setPreviousRandomNumbers] = useState([]);
  const [time, setTime] = useState({ minutes: 0, seconds: 15, distance: 15000 });
  const [answeredQuestionIndices, setAnsweredQuestionIndices] = useState(new Set());
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  const [previousButtonDisabled, setPreviousButtonDisabled] = useState(true);

  const navigate = useNavigate();
  const intervalRef = useRef(null);

  // Build fetch URL
  const buildUrl = () => {
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
    params.push(`limit=15`);
    return `${API_BASE}/api/questions${params.length ? `?${params.join('&')}` : ''}`;
  };

  // Fetch questions
  useEffect(() => {
    const url = buildUrl();
    console.log('Fetching questions from:', url);
    let didCancel = false;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (didCancel) return;

        if (!Array.isArray(data)) {
          console.warn('Unexpected questions payload:', data);
          setQuestionsList([]);
          setLoading(false);
          return;
        }

        const randomQuestions = shuffleArray(data).slice(0, 15);

        setQuestionsList(randomQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setCorrectAnswers(0);
        setWrongAnswers(0);
        setHints(5);
        setFiftyFifty(2);
        setUsedFiftyFifty(false);
        setPreviousRandomNumbers([]);
        setAnsweredQuestionIndices(new Set());
        setNextButtonDisabled(false);
        setPreviousButtonDisabled(true);

        if (randomQuestions.length > 0) startQuestionTimer();
        setLoading(false);

        if (randomQuestions.length === 0) {
          M.toast({ html: 'No questions found for your selection.', classes: 'toast-invalid', displayLength: 2000 });
        }
      })
      .catch(err => {
        console.error('Error fetching questions:', err);
        setLoading(false);
        M.toast({ html: 'Failed to load questions.', classes: 'toast-invalid', displayLength: 2000 });
      });

    return () => {
      didCancel = true;
      clearInterval(intervalRef.current);
    };
  }, [category, difficulty]);

  useEffect(() => {
    setPreviousButtonDisabled(currentQuestionIndex === 0);
    setNextButtonDisabled(currentQuestionIndex === questionsList.length - 1);
  }, [currentQuestionIndex, questionsList.length]);

  // Per-question 15-second timer
  const startQuestionTimer = () => {
    clearInterval(intervalRef.current);
    let secondsLeft = 15;

    setTime({ minutes: 0, seconds: secondsLeft, distance: secondsLeft * 1000 });

    intervalRef.current = setInterval(() => {
      secondsLeft--;
      setTime({ minutes: 0, seconds: secondsLeft, distance: secondsLeft * 1000 });

      if (secondsLeft <= 0) {
        clearInterval(intervalRef.current);
        handleTimeUp();
      }
    }, 1000);
  };

  const handleTimeUp = () => {
    const updatedAnsweredQuestionIndices = new Set(answeredQuestionIndices);
    updatedAnsweredQuestionIndices.add(currentQuestionIndex);
    setAnsweredQuestionIndices(updatedAnsweredQuestionIndices);

    if (currentQuestionIndex === questionsList.length - 1) {
      endGame(score, correctAnswers, wrongAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      resetOptionsVisibility();
    }
  };

  useEffect(() => {
    if (questionsList.length > 0) {
      startQuestionTimer();
    }
    return () => clearInterval(intervalRef.current);
  }, [currentQuestionIndex, questionsList]);

  const handleOptionClick = (e) => {
    clearInterval(intervalRef.current);

    const selectedAnswer = e.target.innerHTML.toLowerCase();
    const correctAnswer = questionsList[currentQuestionIndex].answer.toLowerCase();

    let newScore = score;
    let newCorrectAnswers = correctAnswers;
    let newWrongAnswers = wrongAnswers;

    if (selectedAnswer === correctAnswer) {
      newScore++;
      newCorrectAnswers++;
    } else {
      newWrongAnswers++;
    }

    const updatedAnsweredQuestionIndices = new Set(answeredQuestionIndices);
    updatedAnsweredQuestionIndices.add(currentQuestionIndex);

    setScore(newScore);
    setCorrectAnswers(newCorrectAnswers);
    setWrongAnswers(newWrongAnswers);
    setAnsweredQuestionIndices(updatedAnsweredQuestionIndices);

    if (currentQuestionIndex === questionsList.length - 1) {
      endGame(newScore, newCorrectAnswers, newWrongAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      resetOptionsVisibility();
    }
  };

  const resetOptionsVisibility = () => {
    const options = document.querySelectorAll('.option');
    options.forEach(option => (option.style.visibility = 'visible'));
    setUsedFiftyFifty(false);
    setPreviousRandomNumbers([]);
  };

  const handleNextButtonClick = () => {
    if (currentQuestionIndex < questionsList.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetOptionsVisibility();
    }
  };

  const handlePreviousButtonClick = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      resetOptionsVisibility();
    }
  };

  const handleQuitButtonClick = () => {
    clearInterval(intervalRef.current);
    navigate('/');
  };

  const handleHints = () => {
    if (hints <= 0) {
      M.toast({ html: 'No hints left!', classes: 'toast-invalid', displayLength: 1500 });
      return;
    }

    const options = Array.from(document.querySelectorAll('.option'));
    const correctAnswer = questionsList[currentQuestionIndex].answer.toLowerCase();

    let indexOfAnswer;
    options.forEach((option, index) => {
      if (option.innerHTML.toLowerCase() === correctAnswer) indexOfAnswer = index;
    });

    while (true) {
      const randomNumber = Math.floor(Math.random() * 4);
      if (randomNumber !== indexOfAnswer && !previousRandomNumbers.includes(randomNumber)) {
        options[randomNumber].style.visibility = 'hidden';
        setPreviousRandomNumbers(prev => [...prev, randomNumber]);
        setHints(prev => prev - 1);
        break;
      }
      if (previousRandomNumbers.length >= 3) break;
    }
  };

  const handleFiftyFifty = () => {
    if (fiftyFifty <= 0) {
      M.toast({ html: 'No 50/50 lifelines left!', classes: 'toast-invalid', displayLength: 1500 });
      return;
    }
    if (usedFiftyFifty) return;

    const options = document.querySelectorAll('.option');
    const correctAnswer = questionsList[currentQuestionIndex].answer.toLowerCase();

    let indexOfAnswer;
    options.forEach((option, index) => {
      if (option.innerHTML.toLowerCase() === correctAnswer) indexOfAnswer = index;
    });

    const hiddenIndices = [];
    while (hiddenIndices.length < 2) {
      const randomNumber = Math.floor(Math.random() * 4);
      if (randomNumber !== indexOfAnswer && !hiddenIndices.includes(randomNumber)) {
        options[randomNumber].style.visibility = 'hidden';
        hiddenIndices.push(randomNumber);
      }
    }

    setFiftyFifty(prev => prev - 1);
    setUsedFiftyFifty(true);
  };

  // Updated endGame to handle skipped questions
  const endGame = (finalScore, finalCorrectAnswers, finalWrongAnswers) => {
    clearInterval(intervalRef.current);
    M.toast({ html: 'Quiz ended!', classes: 'toast-info', displayLength: 2000 });

    const totalQuestions = questionsList.length;
    const finalNumberOfAnsweredQuestions = finalCorrectAnswers + finalWrongAnswers;
    const skippedQuestions = totalQuestions - finalNumberOfAnsweredQuestions;

    const playerStats = {
      score: finalScore,
      numberOfQuestions: totalQuestions,
      numberOfAnsweredQuestions: finalNumberOfAnsweredQuestions,
      correctAnswers: finalCorrectAnswers,
      wrongAnswers: finalWrongAnswers,
      skippedQuestions: skippedQuestions,
      fiftyFiftyUsed: 2 - fiftyFifty,
      hintsUsed: 5 - hints,
      category,
      difficulty
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/quiz/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          category,
          difficulty,
          score: finalScore
        })
      })
        .then(res => res.json())
        .then(data => console.log("Quiz saved:", data))
        .catch(err => console.error("Save quiz error:", err));
    }

    navigate('/play/quizSummary', { state: playerStats });
  };

  if (loading) return <p>Loading questions...</p>;
  if (questionsList.length === 0) return <p>No questions available.</p>;

  const currentQuestion = questionsList[currentQuestionIndex];

  return (
    <div>
      <Helmet><title>Quiz Page</title></Helmet>

      <div className="questions">
        <h2>Quiz Mode</h2>
        <div className="lifeline-container">
          <p>
            <span onClick={handleFiftyFifty} className="mdi mdi-set-center mdi-24px lifeline-icon" role="button">
              <span className="lifeline">{fiftyFifty}</span>
            </span>
          </p>
          <p>
            <span onClick={handleHints} className="mdi mdi-lightbulb-on-outline mdi-24px lifeline-icon" role="button">
              <span className="lifeline">{hints}</span>
            </span>
          </p>
        </div>

        <div className="timer-container">
          <p>
            <span className="left" style={{ float: 'left' }}>
              {currentQuestionIndex + 1} of {questionsList.length}
            </span>
            <span
              className={classnames('right valid', {
                warning: time.seconds <= 10,
                invalid: time.seconds <= 5,
              })}
            >
              {time.minutes}:{time.seconds < 10 ? `0${time.seconds}` : time.seconds}
              <span className="mdi mdi-clock-outline mdi-24px"></span>
            </span>
          </p>
        </div>

        <h5>{currentQuestion.question}</h5>

        <div className="options-container">
          <p onClick={handleOptionClick} className="option">{currentQuestion.optionA}</p>
          <p onClick={handleOptionClick} className="option">{currentQuestion.optionB}</p>
        </div>

        <div className="options-container">
          <p onClick={handleOptionClick} className="option">{currentQuestion.optionC}</p>
          <p onClick={handleOptionClick} className="option">{currentQuestion.optionD}</p>
        </div>

        <div className="button-container">

          <button
            id="quit-button"
            onClick={handleQuitButtonClick}
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Play;
