
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, RotateCcw, CheckCircle, Camera, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { ExerciseVideoPlayer } from '@/components/ExerciseVideoPlayer';

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  instructions: string[];
  target_reps: number;
  video_url: string;
  thumbnail_url: string;
}

const ExerciseSession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exerciseId = searchParams.get('exerciseId');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [showDemo, setShowDemo] = useState(true);
  const [repDetectionCooldown, setRepDetectionCooldown] = useState(false);

  const { poseData, isInitialized } = usePoseDetection(videoRef, canvasRef, exercise?.title || '');

  useEffect(() => {
    if (exerciseId) {
      fetchExercise(exerciseId);
    }
  }, [exerciseId]);

  useEffect(() => {
    // Rep detection logic based on pose analysis
    if (sessionStarted && isRecording && poseData.isCorrectForm && !repDetectionCooldown) {
      detectRep();
    }
  }, [poseData, sessionStarted, isRecording, repDetectionCooldown]);

  const fetchExercise = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setExercise(data);
    } catch (error) {
      console.error('Error fetching exercise:', error);
      toast.error('Failed to load exercise');
      navigate('/exercises');
    }
  };

  const detectRep = () => {
    if (currentRep >= (exercise?.target_reps || 10)) return;

    setRepDetectionCooldown(true);
    setCurrentRep(prev => {
      const newRep = prev + 1;
      if (newRep === (exercise?.target_reps || 10)) {
        completeSession();
      }
      return newRep;
    });

    // Update accuracy based on form quality
    const repAccuracy = poseData.confidence * 100;
    setAccuracy(prev => prev === 0 ? repAccuracy : (prev + repAccuracy) / 2);

    // Reset cooldown after 2 seconds
    setTimeout(() => {
      setRepDetectionCooldown(false);
    }, 2000);

    toast.success(`Rep ${currentRep + 1} completed!`);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsRecording(true);
        toast.success('Camera started! AI Coach is now watching your form.');
      }
    } catch (error) {
      toast.error('Unable to access camera. Please check permissions.');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsRecording(false);
    }
  };

  const startSession = () => {
    setShowDemo(false);
    setSessionStarted(true);
    startCamera();
    toast.info('Exercise session started! Follow the AI guidance.');
  };

  const pauseSession = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      toast.info('Session paused');
    } else {
      toast.info('Session resumed');
    }
  };

  const resetSession = () => {
    setCurrentRep(0);
    setAccuracy(0);
    setSessionCompleted(false);
    setRepDetectionCooldown(false);
    toast.info('Session reset');
  };

  const completeSession = async () => {
    setSessionCompleted(true);
    stopCamera();
    
    if (!exercise) return;

    try {
      const { error } = await supabase
        .from('exercise_sessions')
        .insert({
          user_id: user?.id,
          exercise_id: exercise.id,
          reps_completed: currentRep,
          accuracy_score: accuracy / 100,
          feedback_notes: poseData.feedback,
          session_duration: 300
        });

      if (error) throw error;
      
      toast.success(`Great job! You completed ${currentRep} reps with ${Math.round(accuracy)}% accuracy!`);
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Session completed but failed to save data.');
    }
  };

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/exercises')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Exercises
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SR</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{exercise.title}</span>
              </div>
            </div>
            {sessionStarted && (
              <Badge variant={sessionCompleted ? 'default' : 'secondary'}>
                {sessionCompleted ? 'Completed' : 'In Progress'}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Demo or AI Camera Feed */}
          <div className="space-y-6">
            {showDemo ? (
              <ExerciseVideoPlayer 
                exercise={exercise} 
                onStartPractice={startSession}
              />
            ) : (
              <>
                {/* AI Camera Feed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      AI Coach - Live Analysis
                    </CardTitle>
                    <CardDescription>
                      Your AI coach is analyzing your form in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                        width={640}
                        height={480}
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      
                      {sessionCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-600 bg-opacity-90">
                          <div className="text-center text-white">
                            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                            <p className="text-xl font-semibold mb-2">Exercise Completed!</p>
                            <p>Accuracy: {Math.round(accuracy)}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {sessionStarted && !sessionCompleted && (
                      <div className="flex justify-center gap-4 mt-4">
                        <Button onClick={pauseSession} variant="outline">
                          {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button onClick={resetSession} variant="outline">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setShowDemo(true)} variant="outline">
                          View Demo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Real-Time AI Feedback */}
                {sessionStarted && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Coach Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <span className="text-blue-700 font-medium">
                            Reps: {currentRep}/{exercise.target_reps}
                          </span>
                        </div>
                        <div className={`border rounded-lg p-3 ${
                          poseData.isCorrectForm 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-orange-50 border-orange-200'
                        }`}>
                          <span className={`font-medium ${
                            poseData.isCorrectForm ? 'text-green-700' : 'text-orange-700'
                          }`}>
                            Form: {poseData.isCorrectForm ? 'Excellent ✓' : 'Needs Adjustment'}
                          </span>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <span className="text-purple-700 font-medium">
                            💡 {poseData.feedback}
                          </span>
                        </div>
                        {accuracy > 0 && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <span className="text-gray-700 font-medium">
                              Session Accuracy: {Math.round(accuracy)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Progress and Instructions */}
          <div className="space-y-6">
            {/* Progress */}
            {sessionStarted && (
              <Card>
                <CardHeader>
                  <CardTitle>Session Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Repetitions</span>
                        <span className="text-sm text-gray-600">{currentRep}/{exercise.target_reps}</span>
                      </div>
                      <Progress value={(currentRep / exercise.target_reps) * 100} className="h-3" />
                    </div>
                    
                    {accuracy > 0 && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Form Accuracy</span>
                          <span className="text-sm text-gray-600">{Math.round(accuracy)}%</span>
                        </div>
                        <Progress value={accuracy} className="h-3" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exercise Info */}
            <Card>
              <CardHeader>
                <CardTitle>Exercise Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">{exercise.description}</p>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline">{exercise.category}</Badge>
                    <Badge variant="outline">{exercise.target_reps} reps</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Exercise Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSession;
