
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedPoseDetection } from '@/hooks/useAdvancedPoseDetection';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { 
  Camera, 
  CameraOff, 
  RotateCcw, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Brain,
  Eye,
  Mic,
  Target
} from 'lucide-react';

interface AdvancedWebcamPoseDetectionProps {
  exerciseTitle: string;
  exerciseId: string;
  onRepCompleted: (repData: { 
    accuracy: number; 
    feedback: string; 
    movementAnalysis: any;
  }) => void;
  onSessionComplete: (sessionData: any) => void;
  isActive: boolean;
}

export const AdvancedWebcamPoseDetection: React.FC<AdvancedWebcamPoseDetectionProps> = ({
  exerciseTitle,
  exerciseId,
  onRepCompleted,
  onSessionComplete,
  isActive
}) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const { poseData, isInitialized } = useAdvancedPoseDetection(
    videoRef, 
    canvasRef, 
    exerciseTitle.toLowerCase().replace(/\s+/g, '_')
  );

  // Gait analysis state
  const [gaitData, setGaitData] = useState({
    stepLength: 0,
    stepWidth: 0,
    walkingSpeed: 0,
    symmetryScore: 0,
    balanceScore: 0
  });

  // Speech analysis state
  const [speechAnalysis, setSpeechAnalysis] = useState({
    isRecording: false,
    transcription: '',
    clarityScore: 0,
    pronunciationScore: 0,
    fluencyScore: 0
  });

  // Eye tracking simulation (placeholder for actual implementation)
  const [eyeTrackingData, setEyeTrackingData] = useState({
    fixationPoints: [] as Array<{x: number, y: number, duration: number}>,
    saccadeCount: 0,
    blinkRate: 0,
    attentionScore: 0
  });

  useEffect(() => {
    if (isActive && !isWebcamActive) {
      startWebcam();
    } else if (!isActive && isWebcamActive) {
      stopWebcam();
    }
  }, [isActive]);

  useEffect(() => {
    // Create exercise session when starting
    if (isWebcamActive && !sessionId && user) {
      createExerciseSession();
    }
  }, [isWebcamActive, user]);

  useEffect(() => {
    // Track reps and store movement analysis
    if (poseData.isCorrectForm && isWebcamActive && sessionId) {
      const newRep = repCount + 1;
      setRepCount(newRep);
      
      // Store movement analysis in database
      storeMovementAnalysis();
      
      onRepCompleted({
        accuracy: poseData.confidence,
        feedback: poseData.feedback,
        movementAnalysis: poseData.movements
      });
    }
  }, [poseData.isCorrectForm, isWebcamActive, sessionId]);

  const createExerciseSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercise_sessions')
        .insert({
          user_id: user.id,
          exercise_id: exerciseId,
          reps_completed: 0,
          accuracy_score: 0,
          session_duration: 0
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
      setSessionStartTime(new Date());
    } catch (error) {
      console.error('Error creating exercise session:', error);
    }
  };

  const storeMovementAnalysis = async () => {
    if (!user || !sessionId) return;

    try {
      const { error } = await supabase
        .from('movement_analysis')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          joint_angles: poseData.movements.jointAngles,
          range_of_motion: poseData.movements.rangeOfMotion,
          movement_quality_score: poseData.movements.movementQuality / 100,
          fatigue_level: poseData.movements.fatigueLevel,
          pain_indicators: poseData.movements.painIndicators,
          balance_metrics: {
            balance_score: poseData.movements.balanceScore,
            symmetry_score: poseData.movements.symmetryScore
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing movement analysis:', error);
    }
  };

  const storeAIAssessment = async (assessmentType: string, results: any) => {
    if (!user || !sessionId) return;

    try {
      const { error } = await supabase
        .from('ai_assessments')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          assessment_type: assessmentType,
          results,
          confidence_score: poseData.confidence,
          recommendations: poseData.feedback
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing AI assessment:', error);
    }
  };

  const storeGaitAnalysis = async () => {
    if (!user || !sessionId) return;

    try {
      const { error } = await supabase
        .from('gait_analysis')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          step_length: gaitData.stepLength,
          step_width: gaitData.stepWidth,
          walking_speed: gaitData.walkingSpeed,
          symmetry_score: gaitData.symmetryScore / 100,
          balance_score: gaitData.balanceScore / 100,
          analysis_data: {
            exercise_type: exerciseTitle,
            movement_patterns: poseData.movements
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing gait analysis:', error);
    }
  };

  const startSpeechAnalysis = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Speech recognition not supported');
      return;
    }

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setSpeechAnalysis(prev => ({ ...prev, isRecording: true }));
      
      // Simulate speech analysis (in real implementation, use Web Speech API or external service)
      setTimeout(() => {
        setSpeechAnalysis({
          isRecording: false,
          transcription: 'Exercise completed successfully',
          clarityScore: 85,
          pronunciationScore: 78,
          fluencyScore: 82
        });
        
        // Store speech session
        storeSpeechSession();
      }, 3000);
    } catch (error) {
      console.error('Error starting speech analysis:', error);
    }
  };

  const storeSpeechSession = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('speech_sessions')
        .insert({
          user_id: user.id,
          session_type: 'exercise_feedback',
          transcription: speechAnalysis.transcription,
          speech_clarity_score: speechAnalysis.clarityScore / 100,
          pronunciation_score: speechAnalysis.pronunciationScore / 100,
          fluency_score: speechAnalysis.fluencyScore / 100,
          analysis_results: {
            exercise_context: exerciseTitle,
            session_id: sessionId
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing speech session:', error);
    }
  };

  const simulateEyeTracking = () => {
    // Simulate eye tracking data (in real implementation, use eye tracking hardware/software)
    const newFixation = {
      x: Math.random() * 640,
      y: Math.random() * 480,
      duration: Math.random() * 1000 + 200
    };
    
    setEyeTrackingData(prev => ({
      ...prev,
      fixationPoints: [...prev.fixationPoints.slice(-10), newFixation],
      saccadeCount: prev.saccadeCount + 1,
      blinkRate: Math.random() * 20 + 10,
      attentionScore: Math.random() * 40 + 60
    }));
  };

  const startWebcam = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setIsWebcamActive(true);
        
        // Start eye tracking simulation
        const eyeInterval = setInterval(simulateEyeTracking, 1000);
        return () => clearInterval(eyeInterval);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Unable to access webcam. Please check permissions.');
    }
  };

  const stopWebcam = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    
    // Complete session
    if (sessionId && sessionStartTime) {
      await completeSession();
    }
  };

  const completeSession = async () => {
    if (!sessionId || !sessionStartTime || !user) return;

    const sessionDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
    const avgAccuracy = poseData.confidence;

    try {
      // Update exercise session
      const { error } = await supabase
        .from('exercise_sessions')
        .update({
          reps_completed: repCount,
          accuracy_score: avgAccuracy,
          session_duration: sessionDuration,
          feedback_notes: poseData.feedback
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Store final AI assessment
      await storeAIAssessment('session_complete', {
        total_reps: repCount,
        avg_accuracy: avgAccuracy,
        session_duration: sessionDuration,
        movement_quality: poseData.movements.movementQuality,
        fatigue_level: poseData.movements.fatigueLevel,
        pain_indicators: poseData.movements.painIndicators
      });

      // Store gait analysis if applicable
      if (exerciseTitle.toLowerCase().includes('walk') || exerciseTitle.toLowerCase().includes('gait')) {
        await storeGaitAnalysis();
      }

      onSessionComplete({
        sessionId,
        repCount,
        avgAccuracy,
        sessionDuration,
        movementAnalysis: poseData.movements
      });

    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const resetSession = () => {
    setRepCount(0);
    setSessionId(null);
    setSessionStartTime(null);
    setGaitData({
      stepLength: 0,
      stepWidth: 0,
      walkingSpeed: 0,
      symmetryScore: 0,
      balanceScore: 0
    });
    setSpeechAnalysis({
      isRecording: false,
      transcription: '',
      clarityScore: 0,
      pronunciationScore: 0,
      fluencyScore: 0
    });
    setEyeTrackingData({
      fixationPoints: [],
      saccadeCount: 0,
      blinkRate: 0,
      attentionScore: 0
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Camera Feed */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Advanced AI Coach - {exerciseTitle}</span>
            <div className="flex gap-2">
              <Badge variant={isWebcamActive ? 'default' : 'secondary'}>
                {isWebcamActive ? 'Camera On' : 'Camera Off'}
              </Badge>
              <Badge variant={isInitialized ? 'default' : 'outline'}>
                {isInitialized ? 'AI Ready' : 'Loading AI...'}
              </Badge>
              <Badge variant={poseData.exercisePhase === 'execution' ? 'default' : 'secondary'}>
                {poseData.exercisePhase}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Webcam Feed */}
            <div className="relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover mirror"
                autoPlay
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                width={640}
                height={480}
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Overlay UI */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                  Reps: {repCount}
                </div>
                {poseData.confidence > 0 && (
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    poseData.isCorrectForm 
                      ? 'bg-green-500 bg-opacity-75 text-white' 
                      : 'bg-orange-500 bg-opacity-75 text-white'
                  }`}>
                    Accuracy: {Math.round(poseData.confidence * 100)}%
                  </div>
                )}
                {poseData.movements.fatigueLevel > 5 && (
                  <div className="bg-yellow-500 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                    Fatigue: {poseData.movements.fatigueLevel}/10
                  </div>
                )}
              </div>

              {/* Pain Indicators */}
              {poseData.movements.painIndicators.length > 0 && (
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Pain Detected
                  </div>
                </div>
              )}

              {/* Feedback Display */}
              {poseData.feedback && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className={`px-4 py-2 rounded-lg text-center text-white ${
                    poseData.isCorrectForm 
                      ? 'bg-green-600 bg-opacity-90' 
                      : 'bg-blue-600 bg-opacity-90'
                  }`}>
                    {poseData.feedback}
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                  <div className="text-red-600 text-center p-4">
                    <p className="font-semibold">Camera Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={isWebcamActive ? stopWebcam : startWebcam}
                variant={isWebcamActive ? 'destructive' : 'default'}
                className="flex items-center gap-2"
              >
                {isWebcamActive ? (
                  <>
                    <CameraOff className="h-4 w-4" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Start Camera
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetSession}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>

              <Button
                onClick={startSpeechAnalysis}
                variant="outline"
                className="flex items-center gap-2"
                disabled={speechAnalysis.isRecording}
              >
                <Mic className="h-4 w-4" />
                {speechAnalysis.isRecording ? 'Recording...' : 'Voice Analysis'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="movement" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="movement">Movement</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="speech">Speech</TabsTrigger>
          <TabsTrigger value="eye">Eye Tracking</TabsTrigger>
          <TabsTrigger value="ai">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="movement" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Movement Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(poseData.movements.movementQuality)}%
                </div>
                <Progress value={poseData.movements.movementQuality} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Fatigue Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {poseData.movements.fatigueLevel}/10
                </div>
                <Progress value={poseData.movements.fatigueLevel * 10} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Symmetry Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(poseData.movements.symmetryScore)}%
                </div>
                <Progress value={poseData.movements.symmetryScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Joint Angles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {poseData.movements.jointAngles.length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Active Joints</div>
              </CardContent>
            </Card>
          </div>

          {/* Joint Angle Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Joint Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(poseData.movements.rangeOfMotion).map(([joint, rom]) => (
                  <div key={joint} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm capitalize">
                      {joint.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Range: {Math.round(rom.min)}° - {Math.round(rom.max)}°
                    </div>
                    <div className="text-sm font-semibold">
                      Current: {Math.round(rom.current)}°
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Balance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Balance Score</span>
                    <span className="text-sm text-gray-600">
                      {Math.round(poseData.movements.balanceScore)}%
                    </span>
                  </div>
                  <Progress value={poseData.movements.balanceScore} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Symmetry</span>
                    <span className="text-sm text-gray-600">
                      {Math.round(poseData.movements.symmetryScore)}%
                    </span>
                  </div>
                  <Progress value={poseData.movements.symmetryScore} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gait Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Step Length:</span>
                  <span className="text-sm font-medium">{gaitData.stepLength.toFixed(1)} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Step Width:</span>
                  <span className="text-sm font-medium">{gaitData.stepWidth.toFixed(1)} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Walking Speed:</span>
                  <span className="text-sm font-medium">{gaitData.walkingSpeed.toFixed(1)} m/s</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="speech" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Speech Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {speechAnalysis.transcription && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Transcription:</div>
                  <div className="text-sm">{speechAnalysis.transcription}</div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Clarity</span>
                    <span className="text-sm text-gray-600">{speechAnalysis.clarityScore}%</span>
                  </div>
                  <Progress value={speechAnalysis.clarityScore} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pronunciation</span>
                    <span className="text-sm text-gray-600">{speechAnalysis.pronunciationScore}%</span>
                  </div>
                  <Progress value={speechAnalysis.pronunciationScore} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Fluency</span>
                    <span className="text-sm text-gray-600">{speechAnalysis.fluencyScore}%</span>
                  </div>
                  <Progress value={speechAnalysis.fluencyScore} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eye" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Eye Tracking & Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {eyeTrackingData.fixationPoints.length}
                  </div>
                  <div className="text-sm text-gray-600">Fixation Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {eyeTrackingData.saccadeCount}
                  </div>
                  <div className="text-sm text-gray-600">Saccades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {eyeTrackingData.blinkRate.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Blinks/min</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {eyeTrackingData.attentionScore.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Attention</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-1">Overall Confidence</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(poseData.confidence * 100)}%
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-1">Exercise Phase</div>
                  <div className="text-lg font-semibold text-green-600 capitalize">
                    {poseData.exercisePhase}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-sm font-medium text-purple-800 mb-1">Form Status</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {poseData.isCorrectForm ? 'Correct' : 'Needs Adjustment'}
                  </div>
                </div>
              </div>

              {/* Pain Indicators */}
              {poseData.movements.painIndicators.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Pain Indicators Detected
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {poseData.movements.painIndicators.map((indicator, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {indicator.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  AI Recommendations
                </div>
                <div className="text-sm text-blue-700">
                  {poseData.feedback}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
