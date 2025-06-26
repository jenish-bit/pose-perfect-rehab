import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import TherapistDashboard from '@/pages/TherapistDashboard';
import ExerciseBuilder from '@/pages/ExerciseBuilder';
import ExerciseLibrary from '@/pages/ExerciseLibrary';
import ExerciseSession from '@/pages/ExerciseSession';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AIFeatures from '@/pages/AIFeatures';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/therapist" element={<TherapistDashboard />} />
            <Route path="/exercise-builder" element={<ExerciseBuilder />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/exercise-session" element={<ExerciseSession />} />
            <Route path="/ai-features" element={<AIFeatures />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
