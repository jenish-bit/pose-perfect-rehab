
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import AIFeatures from '@/pages/AIFeatures';
import ExerciseBuilder from '@/pages/ExerciseBuilder';
import ExerciseLibrary from '@/pages/ExerciseLibrary';
import ExerciseSession from '@/pages/ExerciseSession';
import TherapistDashboard from '@/pages/TherapistDashboard';
import NotFound from '@/pages/NotFound';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Public Route Component (redirects authenticated users to dashboard for auth page)
const PublicRoute: React.FC<{ children: React.ReactNode; redirectToDashboard?: boolean }> = ({ 
  children, 
  redirectToDashboard = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user && redirectToDashboard ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Landing page - accessible to everyone */}
            <Route path="/" element={
              <PublicRoute>
                <Index />
              </PublicRoute>
            } />
            
            {/* Auth page - only accessible when not authenticated */}
            <Route path="/auth" element={
              <PublicRoute redirectToDashboard={true}>
                <Auth />
              </PublicRoute>
            } />
            
            {/* Protected routes - only accessible when authenticated */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/ai-features" element={
              <ProtectedRoute>
                <AIFeatures />
              </ProtectedRoute>
            } />
            
            <Route path="/exercise-builder" element={
              <ProtectedRoute>
                <ExerciseBuilder />
              </ProtectedRoute>
            } />
            
            <Route path="/exercises" element={
              <ProtectedRoute>
                <ExerciseLibrary />
              </ProtectedRoute>
            } />
            
            <Route path="/exercise-session" element={
              <ProtectedRoute>
                <ExerciseSession />
              </ProtectedRoute>
            } />
            
            <Route path="/therapist" element={
              <ProtectedRoute>
                <TherapistDashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
