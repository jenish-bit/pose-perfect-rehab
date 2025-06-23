
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WebcamPoseDetection } from './WebcamPoseDetection';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth/AuthProvider';
import { Play, Pause, RotateCcw, CheckCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  position_type: string;
  video_url: string;
  thumbnail_url: string;
  instructions: string[];
  target_reps: number;
  duration_seconds: number;
}

interface ExerciseSessionProps {
  exerciseId: string;
  onComplete?: () => void;
}

export const ExerciseSession: React.FC<ExerciseSessionProps> = ({ exerciseId, onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState({
    repsCompleted: 0,
    accuracyScores: [] as number[],
    feedbackHistory: [] as string[],
    startTime: null as Date | null,
    duration: 0
  });
  const [showDemo, setShowDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercise();
  }, [exerciseId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && sessionData.startTime) {
      interval = setInterval(() => {
        setSessionData(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - prev.startTime!.getTime()) / 1000)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionData.startTime]);

  const fetchExercise = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (error) throw error;
      setExercise(data);
      console.log('Loaded exercise:', data.title);
    } catch (error) {
      console.error('Error fetching exercise:', error);
      toast({
        title: "Error",
        description: "Failed to load exercise details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setIsSessionActive(true);
    setShowDemo(false);
    setSessionData(prev => ({
      ...prev,
      startTime: new Date(),
      repsCompleted: 0,
      accuracyScores: [],
      feedbackHistory: []
    }));
    
    toast({
      title: "Exercise Session Started",
      description: "AI coach is now monitoring your form! Position yourself in front of the camera.",
    });
  };

  const pauseSession = () => {
    setIsSessionActive(false);
    toast({
      title: "Session Paused",
      description: "Click Start to resume your exercise.",
    });
  };

  const handleRepCompleted = (repData: { accuracy: number; feedback: string }) => {
    console.log('Rep completed:', repData);
    setSessionData(prev => ({
      ...prev,
      repsCompleted: prev.repsCompleted + 1,
      accuracyScores: [...prev.accuracyScores, repData.accuracy],
      feedbackHistory: [...prev.feedbackHistory, repData.feedback]
    }));

    toast({
      title: "Rep Completed!",
      description: `Great job! Accuracy: ${Math.round(repData.accuracy * 100)}%`,
    });

    // Check if target reps reached
    if (exercise && sessionData.repsCompleted + 1 >= exercise.target_reps) {
      setTimeout(() => completeSession(), 1000);
    }
  };

  const completeSession = async () => {
    if (!user || !exercise) return;

    setIsSessionActive(false);
    
    const avgAccuracy = sessionData.accuracyScores.length > 0 
      ? sessionData.accuracyScores.reduce((a, b) => a + b, 0) / sessionData.accuracyScores.length 
      : 0;

    try {
      const { error } = await supabase
        .from('exercise_sessions')
        .insert({
          user_id: user.id,
          exercise_id: exercise.id,
          reps_completed: sessionData.repsCompleted,
          accuracy_score: avgAccuracy,
          session_duration: sessionData.duration,
          feedback_notes: sessionData.feedbackHistory.join('; ')
        });

      if (error) throw error;

      toast({
        title: "Session Complete! 🎉",
        description: `Excellent work! You completed ${sessionData.repsCompleted} reps with ${Math.round(avgAccuracy * 100)}% accuracy.`,
      });

      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save your session data, but great job on the workout!",
        variant: "destructive",
      });
    }
  };

  const resetSession = () => {
    setIsSessionActive(false);
    setSessionData({
      repsCompleted: 0,
      accuracyScores: [],
      feedbackHistory: [],
      startTime: null,
      duration: 0
    });
    setShowDemo(true);
    
    toast({
      title: "Session Reset",
      description: "Ready to start fresh!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your exercise...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Exercise not found</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const avgAccuracy = sessionData.accuracyScores.length > 0 
    ? sessionData.accuracyScores.reduce((a, b) => a + b, 0) / sessionData.accuracyScores.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with exercise info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{exercise.title}</CardTitle>
                <p className="text-gray-600 mt-2">{exercise.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{exercise.category}</Badge>
                <Badge variant="outline">{exercise.difficulty_level}</Badge>
                <Badge variant="outline">{exercise.position_type}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {sessionData.repsCompleted}/{exercise.target_reps}
                </div>
                <div className="text-sm text-gray-600">Reps</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(avgAccuracy * 100)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(sessionData.duration)}
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatTime(exercise.duration_seconds)}
                </div>
                <div className="text-sm text-gray-600">Target Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center gap-4 flex-wrap">
              {!isSessionActive ? (
                <Button 
                  onClick={startSession} 
                  size="lg"
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {sessionData.repsCompleted > 0 ? 'Resume Session' : 'Start AI Exercise'}
                </Button>
              ) : (
                <Button 
                  onClick={pauseSession} 
                  variant="outline" 
                  size="lg"
                  className="px-8"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause Session
                </Button>
              )}
              
              <Button 
                onClick={resetSession} 
                variant="outline" 
                size="lg"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>

              <Button 
                onClick={() => setShowDemo(!showDemo)} 
                variant="outline" 
                size="lg"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                {showDemo ? 'Hide Tutorial' : 'Show Tutorial'}
              </Button>

              {sessionData.repsCompleted >= exercise.target_reps && (
                <Button 
                  onClick={completeSession} 
                  variant="default" 
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete Session
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Demo Video */}
          {showDemo && (
            <ExerciseVideoPlayer 
              exercise={exercise}
              onStartPractice={startSession}
            />
          )}
          
          {/* AI Webcam Analysis */}
          <WebcamPoseDetection
            exerciseTitle={exercise.title}
            onRepCompleted={handleRepCompleted}
            isActive={isSessionActive}
          />
        </div>

        {/* Exercise Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
