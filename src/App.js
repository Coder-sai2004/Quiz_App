import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home.js';
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AdminPanel from "./components/admin/AdminPanel";
import CategoryDifficultySelection from './components/quiz/CategoryDifficultySelection.js';
import QuizInstructions from './components/quiz/Quizinstructions.js';
import Play from './components/quiz/Play';
import QuizSummary from './components/quiz/QuizSummary';
import History from "./components/quiz/History";
import Leaderboard from "./components/quiz/Leaderboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/play/CategoryDifficultySelection" element={<CategoryDifficultySelection />} />
        <Route path="/play/instructions" element={<QuizInstructions />} />
        <Route path="/play/quiz" element={<Play />} />
        <Route path="/play/quizSummary" element={<QuizSummary />} />
        <Route path="/history" element={<History />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
