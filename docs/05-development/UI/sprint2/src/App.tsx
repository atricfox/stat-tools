import React from 'react';
import Header from './components/Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MeanCalculator from './pages/MeanCalculator';
import ResearchMeanCalculator from './pages/ResearchMeanCalculator';
import TeacherMeanCalculator from './pages/TeacherMeanCalculator';
import WeightedGPACalculator from './pages/WeightedGPACalculator';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/mean-calculator" element={<MeanCalculator />} />
            <Route path="/research-mean-calculator" element={<ResearchMeanCalculator />} />
            <Route path="/teacher-mean-calculator" element={<TeacherMeanCalculator />} />
            <Route path="/weighted-gpa-calculator" element={<WeightedGPACalculator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;