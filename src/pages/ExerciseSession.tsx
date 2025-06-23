
import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { ExerciseSession as ExerciseSessionComponent } from '@/components/ExerciseSession';

const ExerciseSession = () => {
  const [searchParams] = useSearchParams();
  const exerciseId = searchParams.get('exerciseId');

  if (!exerciseId) {
    return <Navigate to="/exercises" replace />;
  }

  return (
    <ExerciseSessionComponent 
      exerciseId={exerciseId}
      onComplete={() => {
        window.location.href = '/exercises';
      }}
    />
  );
};

export default ExerciseSession;
