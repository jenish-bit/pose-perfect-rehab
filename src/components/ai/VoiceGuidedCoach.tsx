
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedPoseDetection } from '@/hooks/useAdvancedPoseDetection';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Bot,
  Settings,
  Camera,
  CameraOff,
  Play,
  Pause
} from 'lucide-react';

interface VoiceCoachProps {
  isActive: boolean;
}

interface VoiceSettings {
  voice: string;
  speed: number;
  volume: number;
  encouragementLevel: 'minimal' | 'moderate' | 'enthusiastic';
}

export const VoiceGuidedCoach: React.FC<VoiceCoachProps> = ({ isActive }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [repCount, setRepCount] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'female-1',
    speed: 1.0,
    volume: 0.8,
    encouragementLevel: 'moderate'
  });

  const [feedbackHistory, setFeedbackHistory] = useState<Array<{
    timestamp: Date;
    feedback: string;
    trigger: string;
  }>>([]);

  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [recognition, setRecognition] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { poseData, isInitialized } = useAdvancedPoseDetection(
    videoRef, 
    canvasRef, 
    'voice_guided_coaching'
  );

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
      
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
        setIsCameraActive(true);
        
        if (isVoiceEnabled) {
          speakFeedback("Camera started! I'm ready to guide your exercise session.");
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    
    if (isVoiceEnabled) {
      speakFeedback("Camera stopped. Great job on your session!");
    }
  };

  const speakFeedback = useCallback((text: string) => {
    if (!speechSynthesis || !isVoiceEnabled) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const selectedVoice = availableVoices.find(voice => 
      voice.name.toLowerCase().includes(voiceSettings.voice) ||
      (voiceSettings.voice === 'female-1' && voice.name.toLowerCase().includes('female')) ||
      (voiceSettings.voice === 'male-1' && voice.name.toLowerCase().includes('male'))
    );
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = voiceSettings.speed;
    utterance.volume = voiceSettings.volume;

    setCurrentFeedback(text);
    speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setCurrentFeedback('');
    };

    // Log feedback
    setFeedbackHistory(prev => [...prev.slice(-9), {
      timestamp: new Date(),
      feedback: text,
      trigger: 'real_time_analysis'
    }]);
  }, [speechSynthesis, isVoiceEnabled, availableVoices, voiceSettings]);

  const generateRealTimeFeedback = useCallback(() => {
    if (!isCameraActive || !isVoiceEnabled || !poseData.confidence) return;

    const { confidence, isCorrectForm, movements, feedback } = poseData;
    
    // Generate contextual feedback based on pose analysis
    if (isCorrectForm && confidence > 0.8) {
      const encouragementMessages = {
        minimal: ['Good form.', 'Keep going.'],
        moderate: ['Excellent form! Keep it up.', 'Great job! You\'re doing really well.'],
        enthusiastic: ['Outstanding! You\'re absolutely crushing this exercise!', 'Incredible form! You\'re a rehabilitation superstar!']
      };
      const messages = encouragementMessages[voiceSettings.encouragementLevel];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      speakFeedback(randomMessage);
    } else if (confidence < 0.6) {
      speakFeedback('Focus on your form. Take your time with each movement.');
    }

    // Fatigue detection
    if (movements.fatigueLevel > 7) {
      speakFeedback('I can see you\'re working hard. Feel free to take a rest when needed.');
    }

    // Balance feedback
    if (movements.balanceScore < 60) {
      speakFeedback('Focus on maintaining your balance. Keep your feet steady.');
    }
  }, [isCameraActive, isVoiceEnabled, poseData, voiceSettings, speakFeedback]);

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    
    if (command.includes('tired') || command.includes('rest')) {
      speakFeedback('I understand you need a break. Take your time to rest and breathe.');
    } else if (command.includes('help') || command.includes('how')) {
      speakFeedback('Focus on slow, controlled movements. I\'m here to guide you through each step.');
    } else if (command.includes('good') || command.includes('great')) {
      speakFeedback('Thank you! You\'re doing wonderfully. Keep up the excellent work!');
    } else if (command.includes('start')) {
      speakFeedback('Let\'s begin your exercise session. I\'ll guide you through each movement.');
    } else if (command.includes('stop')) {
      speakFeedback('Stopping the session. Great work today!');
    } else if (command.includes('faster')) {
      speakFeedback('Let\'s pick up the pace a bit. Maintain good form as we go faster.');
    } else if (command.includes('slower')) {
      speakFeedback('Let\'s slow it down. Focus on controlled, precise movements.');
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const testVoice = () => {
    speakFeedback('Hello! This is how I sound with your current settings. I\'m ready to guide your rehabilitation session.');
  };

  const handleRepCompleted = (repData: { accuracy: number; feedback: string }) => {
    const newRepCount = repCount + 1;
    setRepCount(newRepCount);
    
    // Milestone feedback
    if (newRepCount % 5 === 0 && isVoiceEnabled) {
      const milestoneMessage = voiceSettings.encouragementLevel === 'enthusiastic' 
        ? `Amazing! ${newRepCount} reps completed! You're doing incredible!`
        : `${newRepCount} reps done. Well done!`;
      speakFeedback(milestoneMessage);
    }
  };

  // Real-time feedback generation
  useEffect(() => {
    if (isCameraActive && isVoiceEnabled) {
      const interval = setInterval(generateRealTimeFeedback, 8000); // Every 8 seconds
      return () => clearInterval(interval);
    }
  }, [isCameraActive, isVoiceEnabled, generateRealTimeFeedback]);

  // Rep detection from pose data
  useEffect(() => {
    if (poseData.isCorrectForm && isCameraActive) {
      handleRepCompleted({
        accuracy: poseData.confidence,
        feedback: poseData.feedback
      });
    }
  }, [poseData.isCorrectForm, isCameraActive]);

  return (
    <div className="space-y-6">
      {/* Voice Coach Control Panel */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Live Voice AI Coach</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isVoiceEnabled ? 'default' : 'secondary'}>
                  {isVoiceEnabled ? 'Voice Active' : 'Voice Muted'}
                </Badge>
                <Badge variant={isListening ? 'default' : 'outline'}>
                  {isListening ? 'Listening' : 'Voice Commands Off'}
                </Badge>
                <Badge variant={isCameraActive ? 'default' : 'outline'}>
                  {isCameraActive ? 'Camera On' : 'Camera Off'}
                </Badge>
                <Badge variant="outline">Reps: {repCount}</Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Feed for Voice Coach */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-center text-gray-600">
                    <CameraOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Start camera for voice coaching</p>
                  </div>
                </div>
              )}

              {/* Live Voice Feedback Overlay */}
              {currentFeedback && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-green-600 bg-opacity-90 text-white px-4 py-2 rounded-lg text-center animate-pulse">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Volume2 className="h-4 w-4" />
                      <span className="font-medium">AI Coach Speaking:</span>
                    </div>
                    <p className="text-sm">"{currentFeedback}"</p>
                  </div>
                </div>
              )}

              {/* Pose Analysis Overlay */}
              {poseData.confidence > 0 && (
                <div className="absolute top-4 left-4 space-y-2">
                  <div className={`px-3 py-1 rounded-full text-sm text-white ${
                    poseData.isCorrectForm 
                      ? 'bg-green-500 bg-opacity-75' 
                      : 'bg-orange-500 bg-opacity-75'
                  }`}>
                    Form: {Math.round(poseData.confidence * 100)}%
                  </div>
                  {isListening && (
                    <div className="bg-blue-500 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Mic className="h-3 w-3" />
                      Listening...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Voice Controls */}
            <div className="space-y-4">
              {/* Main Controls */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  variant={isCameraActive ? 'destructive' : 'default'}
                  className="flex items-center gap-2"
                >
                  {isCameraActive ? (
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
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  variant={isVoiceEnabled ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                >
                  {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
                </Button>
                
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? 'destructive' : 'outline'}
                  className="flex items-center gap-2"
                  disabled={!isCameraActive}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isListening ? 'Stop Listening' : 'Voice Commands'}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={testVoice} variant="outline" size="sm">
                  Test Voice
                </Button>
                <Button 
                  onClick={() => setRepCount(0)} 
                  variant="outline" 
                  size="sm"
                >
                  Reset Count
                </Button>
              </div>

              {/* Voice Settings */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Voice Settings
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Encouragement Level</label>
                    <Select
                      value={voiceSettings.encouragementLevel}
                      onValueChange={(value: any) => setVoiceSettings(prev => ({ ...prev, encouragementLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Speech Speed: {voiceSettings.speed.toFixed(1)}x
                    </label>
                    <Slider
                      value={[voiceSettings.speed]}
                      onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, speed: value }))}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Volume: {Math.round(voiceSettings.volume * 100)}%
                    </label>
                    <Slider
                      value={[voiceSettings.volume]}
                      onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, volume: value }))}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{repCount}</div>
              <div className="text-sm text-gray-600">Reps Completed</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(poseData.confidence * 100)}%
              </div>
              <div className="text-sm text-gray-600">Form Accuracy</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className={`text-2xl font-bold ${
                isVoiceEnabled ? 'text-green-600' : 'text-gray-400'
              }`}>
                {isVoiceEnabled ? '🔊' : '🔇'}
              </div>
              <div className="text-sm text-gray-600">Voice Coach</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className={`text-2xl font-bold ${
                isListening ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {isListening ? '🎤' : '⏸️'}
              </div>
              <div className="text-sm text-gray-600">Voice Commands</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Voice Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Voice Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {feedbackHistory.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Bot className="h-4 w-4 text-green-600 mt-1" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm italic text-gray-700">"{entry.feedback}"</p>
                </div>
              </div>
            ))}
            {feedbackHistory.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Voice feedback will appear here during your exercise session</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
