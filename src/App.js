import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home.js';
import QuizInstructions from './components/quiz/Quizinstructions.js';
import Play from './components/quiz/Play';
import QuizSummary from './components/quiz/QuizSummary';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/instructions" element={<QuizInstructions />} />
        <Route path="/play/quiz" element={<Play />} />
        <Route path="/play/quizSummary" element={<QuizSummary />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
