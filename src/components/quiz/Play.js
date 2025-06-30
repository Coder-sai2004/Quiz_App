import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import M from 'materialize-css';
import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';

import questions from '../../questions.json';
import isEmpty from '../../utils/is-empty'; // Assuming this utility is still needed

import correctNotification from '../../assets/audio/correct-answer.mp3';
import wrongNotification from '../../assets/audio/wrong-answer.mp3';
import buttonSound from '../../assets/audio/button-sound.mp3';

// Helper function to shuffle an array (immutable)
const shuffleArray = (array) => {
  let newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Play = () => {
  // State variables for quiz logic
  const [questionsList, setQuestionsList] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [hints, setHints] = useState(5);
  const [fiftyFifty, setFiftyFifty] = useState(2);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [previousRandomNumbers, setPreviousRandomNumbers] = useState([]);
  const [time, setTime] = useState({ minutes: 0, seconds: 0, distance: 0 });
  // Removed numberOfAnsweredQuestions from here as it will be derived directly
  // Set to keep track of answered question indices to prevent double counting
  const [answeredQuestionIndices, setAnsweredQuestionIndices] = useState(new Set());
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  // Fix: Initialize previousButtonDisabled with useState
  const [previousButtonDisabled, setPreviousButtonDisabled] = useState(true); 

  const navigate = useNavigate(); // For navigation
  const correctSound = useRef(null); // Ref for correct answer sound
  const wrongSound = useRef(null); // Ref for wrong answer sound
  const buttonSoundRef = useRef(null); // Ref for button click sound
  const intervalRef = useRef(null); // Ref for timer interval

  // Function to initialize or reset the quiz state
  const initializeQuiz = () => {
    // Shuffle questions and select the first 15 for the quiz
    const randomQuestions = shuffleArray(questions).slice(0, 15);
    setQuestionsList(randomQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setHints(5);
    setFiftyFifty(2);
    setUsedFiftyFifty(false);
    setPreviousRandomNumbers([]);
    setAnsweredQuestionIndices(new Set()); // Reset answered questions set
    // setNumberOfAnsweredQuestions(0); // This state is now removed
    setNextButtonDisabled(false);
    setPreviousButtonDisabled(true);
    startTimer(); // Start the quiz timer
  };

  // Effect hook to initialize the quiz on component mount
  useEffect(() => {
    initializeQuiz();

    // Cleanup function to clear the timer when the component unmounts
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Effect hook to update button disabled states based on current question index
  useEffect(() => {
    setPreviousButtonDisabled(currentQuestionIndex === 0);
    setNextButtonDisabled(currentQuestionIndex === questionsList.length - 1);
  }, [currentQuestionIndex, questionsList.length]);

  // Removed this useEffect as numberOfAnsweredQuestions will be derived directly
  // useEffect(() => {
  //   setNumberOfAnsweredQuestions(answeredQuestionIndices.size);
  // }, [answeredQuestionIndices]);

  // Function to start the countdown timer
  const startTimer = () => {
    clearInterval(intervalRef.current); // Clear any existing timer
    const countDownTime = Date.now() + 180000; // 3 minutes from now (180000 milliseconds)
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const distance = countDownTime - now; // Time remaining

      // Calculate minutes and seconds
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        // If time runs out, clear interval and end the game
        clearInterval(intervalRef.current);
        setTime({ minutes: 0, seconds: 0, distance: 0 });
        endGame(); // Call endGame without specific counts (will use current state of relevant data)
      } else {
        // Update time state
        setTime({ minutes, seconds, distance });
      }
    }, 1000); // Update every second
  };

  // Function to play the button sound
  const playButtonSound = () => {
    if (buttonSoundRef.current) buttonSoundRef.current.play();
  };

  // Handler for when a user clicks on an answer option
  const handleOptionClick = (e) => {
    const selectedAnswer = e.target.innerHTML.toLowerCase();
    const correctAnswer = questionsList[currentQuestionIndex].answer.toLowerCase();

    let newScore = score;
    let newCorrectAnswers = correctAnswers;
    let newWrongAnswers = wrongAnswers;

    // Play sound and show toast based on correctness
    if (selectedAnswer === correctAnswer) {
      correctSound.current.play();
      M.toast({ html: 'Correct Answer!', classes: 'toast-valid', displayLength: 1500 });
      newScore++;
      newCorrectAnswers++;
    } else {
      wrongSound.current.play();
      M.toast({ html: 'Wrong Answer!', classes: 'toast-invalid', displayLength: 1500 });
      newWrongAnswers++;
      navigator.vibrate(1000); // Vibrate for wrong answer
    }
    
    // Create a new set to include the current question index
    const updatedAnsweredQuestionIndices = new Set(answeredQuestionIndices);
    updatedAnsweredQuestionIndices.add(currentQuestionIndex);

    // Update the state immediately for score, correctAnswers, wrongAnswers, and answeredQuestionIndices
    setScore(newScore);
    setCorrectAnswers(newCorrectAnswers);
    setWrongAnswers(newWrongAnswers);
    setAnsweredQuestionIndices(updatedAnsweredQuestionIndices); // Update the set state

    // Check if it's the last question
    if (currentQuestionIndex === questionsList.length - 1) { 
      // End the game, passing the immediately available correct counts
      endGame(newScore, updatedAnsweredQuestionIndices.size, newCorrectAnswers, newWrongAnswers);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetOptionsVisibility(); // Reset lifeline effects for the next question
    }
  };

  // Function to reset the visibility of options (after 50/50 or hint)
  const resetOptionsVisibility = () => {
    const options = document.querySelectorAll('.option');
    options.forEach((option) => (option.style.visibility = 'visible'));
    setUsedFiftyFifty(false); // Reset 50/50 usage flag
    setPreviousRandomNumbers([]); // Clear previous random numbers for hints
  };

  // Handler for the "Next" button click
  const handleNextButtonClick = () => {
    playButtonSound();
    if (currentQuestionIndex < questionsList.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetOptionsVisibility();
    }
  };

  // Handler for the "Previous" button click
  const handlePreviousButtonClick = () => {
    playButtonSound();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      resetOptionsVisibility();
    }
  };

  // Handler for the "Quit" button click
  const handleQuitButtonClick = () => {
    playButtonSound();
    // Removed window.confirm and alert as per instructions, directly navigate.
    clearInterval(intervalRef.current);
    navigate('/');
  };

  // Handler for using a hint
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

    // Hide one wrong option
    while (true) {
      const randomNumber = Math.floor(Math.random() * 4);
      if (randomNumber !== indexOfAnswer && !previousRandomNumbers.includes(randomNumber)) {
        options[randomNumber].style.visibility = 'hidden';
        setPreviousRandomNumbers((prev) => [...prev, randomNumber]);
        setHints((prev) => prev - 1);
        break;
      }
      if (previousRandomNumbers.length >= 3) break; // Safety break if all wrong options are hidden
    }
  };

  // Handler for using the 50/50 lifeline
  const handleFiftyFifty = () => {
    if (fiftyFifty <= 0) {
      M.toast({ html: 'No 50/50 lifelines left!', classes: 'toast-invalid', displayLength: 1500 });
      return;
    }
    if (usedFiftyFifty) return; // Prevent using 50/50 multiple times on the same question

    const options = document.querySelectorAll('.option');
    const correctAnswer = questionsList[currentQuestionIndex].answer.toLowerCase();

    let indexOfAnswer;
    options.forEach((option, index) => {
      if (option.innerHTML.toLowerCase() === correctAnswer) indexOfAnswer = index;
    });

    const hiddenIndices = [];
    while (hiddenIndices.length < 2) { // Hide two wrong options
      const randomNumber = Math.floor(Math.random() * 4);
      if (randomNumber !== indexOfAnswer && !hiddenIndices.includes(randomNumber)) {
        options[randomNumber].style.visibility = 'hidden';
        hiddenIndices.push(randomNumber);
      }
    }

    setFiftyFifty((prev) => prev - 1); // Decrement 50/50 count
    setUsedFiftyFifty(true); // Mark 50/50 as used for this question
  };

  // Function to end the game and navigate to summary
  // These parameters are optional, used when ending from last question click to ensure latest counts
  const endGame = (finalScore, finalAttemptedCount, finalCorrectAnswers, finalWrongAnswers) => {
    clearInterval(intervalRef.current); // Stop the timer
    M.toast({ html: 'Quiz ended!', classes: 'toast-info', displayLength: 2000 }); // User feedback

    // Determine the correct number of answered questions to pass to summary
    // If finalAttemptedCount is passed (from handleOptionClick), use it.
    // Otherwise, calculate from the current answeredQuestionIndices.
    const finalNumberOfAnsweredQuestions = finalAttemptedCount !== undefined
      ? finalAttemptedCount 
      : answeredQuestionIndices.size; // Fallback to current state for timer expiry etc.

    const finalCalculatedScore = finalScore !== undefined ? finalScore : score;
    const finalCalculatedCorrectAnswers = finalCorrectAnswers !== undefined ? finalCorrectAnswers : correctAnswers;
    const finalCalculatedWrongAnswers = finalWrongAnswers !== undefined ? finalWrongAnswers : wrongAnswers;


    // Prepare player statistics
    const playerStats = {
      score: finalCalculatedScore,
      numberOfQuestions: questionsList.length,
      numberOfAnsweredQuestions: finalNumberOfAnsweredQuestions, // Use the determined value
      correctAnswers: finalCalculatedCorrectAnswers,
      wrongAnswers: finalCalculatedWrongAnswers,
      fiftyFiftyUsed: 2 - fiftyFifty, // Calculate used lifelines
      hintsUsed: 5 - hints
    };
    // Navigate to the quiz summary page, passing player stats via state
    navigate('/play/quizSummary', { state: playerStats });
  };

  // Show loading message if questions are not yet loaded
  if (questionsList.length === 0) return <p>Loading questions...</p>;

  // Get the current question object
  const currentQuestion = questionsList[currentQuestionIndex];

  return (
    <div>
      <Helmet><title>Quiz Page</title></Helmet>
      {/* Audio elements for sound effects */}
      <audio ref={correctSound} src={correctNotification}></audio>
      <audio ref={wrongSound} src={wrongNotification}></audio>
      <audio ref={buttonSoundRef} src={buttonSound}></audio>

      <div className="questions">
        <h2>Quiz Mode</h2>
        {/* Lifeline section */}
        <div className="lifeline-container">
          <p>
            <span onClick={handleFiftyFifty} className="mdi mdi-set-center mdi-24px lifeline-icon" role="button" tabIndex={0}>
              <span className="lifeline">{fiftyFifty}</span>
            </span>
          </p>
          <p>
            <span onClick={handleHints} className="mdi mdi-lightbulb-on-outline mdi-24px lifeline-icon" role="button" tabIndex={0}>
              <span className="lifeline">{hints}</span>
            </span>
          </p>
        </div>

        {/* Timer and question progress section */}
        <div className="timer-container">
          <p>
            <span className="left" style={{ float: 'left' }}>
              {currentQuestionIndex + 1} of {questionsList.length}
            </span>
            <span
              className={classnames('right valid', {
                warning: time.distance <= 120000, // Warning if 2 minutes or less
                invalid: time.distance < 30000, // Invalid if 30 seconds or less
              })}
            >
              {time.minutes}:{time.seconds < 10 ? `0${time.seconds}` : time.seconds}
              <span className="mdi mdi-clock-outline mdi-24px"></span>
            </span>
          </p>
        </div>

        {/* Current question text */}
        <h5>{currentQuestion.question}</h5>

        {/* Options container */}
        <div className="options-container">
          <p onClick={handleOptionClick} className="option">{currentQuestion.optionA}</p>
          <p onClick={handleOptionClick} className="option">{currentQuestion.optionB}</p>
        </div>

        <div className="options-container">
          <p onClick={handleOptionClick} className="option">{currentQuestion.optionC}</p>
          <p onClick={handleOptionClick} className="option">{currentQuestion.optionD}</p>
        </div>

        {/* Navigation buttons */}
        <div className="button-container">
          <button
            className={classnames('', { disable: previousButtonDisabled })}
            id="previous-button"
            onClick={() => { playButtonSound(); handlePreviousButtonClick(); }}
            disabled={previousButtonDisabled}
          >
            Previous
          </button>

          <button
            className={classnames('', { disable: nextButtonDisabled })}
            id="next-button"
            onClick={() => { playButtonSound(); handleNextButtonClick(); }}
            disabled={nextButtonDisabled}
          >
            Next
          </button>

          <button
            id="quit-button"
            onClick={() => { playButtonSound(); handleQuitButtonClick(); }}
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Play;
