
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, RotateCcw, CheckCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';

// This is a simplified pose detection simulation
// In a real implementation, you would use TensorFlow.js or MediaPipe
interface PoseData {
  armAngle: number;
  shoulderPosition: number;
  confidence: number;
}

const ExerciseSession = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [targetReps] = useState(10);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [poseData, setPoseData] = useState<PoseData>({ armAngle: 0, shoulderPosition: 0, confidence: 0 });

  // Sample exercise data - in real app this would come from props/params
  const exercise = {
    id: '1',
    title: 'Shoulder Flexion',
    description: 'Raise your arm forward to shoulder height',
    category: 'arm',
    instructions: [
      'Sit up straight in your chair',
      'Keep your affected arm relaxed at your side',
      'Slowly raise your arm forward to shoulder height',
      'Hold for 3 seconds at the top',
      'Lower your arm slowly and repeat'
    ],
    target_reps: 10,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };

  useEffect(() => {
    if (sessionStarted && isRecording) {
      const interval = setInterval(() => {
        // Simulate pose detection
        simulatePoseDetection();
      }, 100);

      return () => clearInterval(interval);
    }
  }, [sessionStarted, isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsRecording(true);
        toast.success('Camera started! Begin your exercise.');
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

  const simulatePoseDetection = () => {
    // Simulate pose detection with random values
    // In real implementation, this would analyze video frames
    const armAngle = Math.random() * 180;
    const shoulderPosition = Math.random() * 100;
    const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence

    setPoseData({ armAngle, shoulderPosition, confidence });

    // Simulate rep counting based on arm angle
    if (armAngle > 120 && currentRep < targetReps) {
      setCurrentRep(prev => {
        const newRep = prev + 1;
        if (newRep === targetReps) {
          completeSession();
        }
        return newRep;
      });
      
      // Calculate accuracy based on form
      const repAccuracy = confidence > 0.8 ? 95 : confidence > 0.6 ? 80 : 65;
      setAccuracy(prev => (prev + repAccuracy) / 2);
      
      // Provide feedback
      if (confidence > 0.8) {
        setFeedback('Great form! Keep it up!');
      } else if (confidence > 0.6) {
        setFeedback('Good! Try to lift a bit higher.');
      } else {
        setFeedback('Focus on your posture and lift slowly.');
      }
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    startCamera();
    toast.info('Exercise session started!');
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
    setFeedback('');
    setSessionCompleted(false);
    toast.info('Session reset');
  };

  const completeSession = async () => {
    setSessionCompleted(true);
    stopCamera();
    
    // Save session to database
    try {
      const { error } = await supabase
        .from('exercise_sessions')
        .insert({
          user_id: user?.id,
          exercise_id: exercise.id,
          reps_completed: currentRep,
          accuracy_score: accuracy / 100,
          feedback_notes: feedback,
          session_duration: 300 // 5 minutes simulation
        });

      if (error) throw error;
      
      toast.success('Exercise session completed and saved!');
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Session completed but failed to save data.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SR</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Exercise Session</span>
            </div>
            <Button variant="outline">
              Exit Session
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video and AI Feedback */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
            </Card>

            {/* Camera Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Camera Feed & AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Mirror the video
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                  
                  {!sessionStarted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="text-center text-white">
                        <Camera className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                        <p className="text-lg mb-4">Ready to start your exercise?</p>
                        <Button onClick={startSession} className="bg-blue-600 hover:bg-blue-700">
                          <Play className="h-4 w-4 mr-2" />
                          Start Exercise
                        </Button>
                      </div>
                    </div>
                  )}
                  
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Feedback */}
            {sessionStarted && (
              <Card>
                <CardHeader>
                  <CardTitle>Real-Time AI Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <span className="text-blue-700 font-medium">
                        Reps: {currentRep}/{targetReps}
                      </span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-green-700 font-medium">
                        Form Accuracy: {Math.round(accuracy)}%
                      </span>
                    </div>
                    {feedback && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <span className="text-orange-700 font-medium">💡 {feedback}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Instructions and Progress */}
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Session Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Repetitions</span>
                      <span className="text-sm text-gray-600">{currentRep}/{targetReps}</span>
                    </div>
                    <Progress value={(currentRep / targetReps) * 100} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Form Accuracy</span>
                      <span className="text-sm text-gray-600">{Math.round(accuracy)}%</span>
                    </div>
                    <Progress value={accuracy} className="h-3" />
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
                      <Badge variant="outline" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Demo Video */}
            <Card>
              <CardHeader>
                <CardTitle>Demo Video</CardTitle>
                <CardDescription>Watch the proper technique</CardDescription>
              </CardHeader>
              <CardContent>
                <video
                  controls
                  className="w-full rounded-lg"
                  poster="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
                >
                  <source src={exercise.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSession;
