
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  Music, 
  Lightbulb,
  Activity,
  Camera,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  CameraOff
} from 'lucide-react';

interface EmotionData {
  happiness: number;
  frustration: number;
  focus: number;
  motivation: number;
  fatigue: number;
  confidence: number;
}

interface EmotionAnalysisProps {
  isActive: boolean;
}

export const EmotionAnalysis: React.FC<EmotionAnalysisProps> = ({ isActive }) => {
  const [emotionData, setEmotionData] = useState<EmotionData>({
    happiness: 70,
    frustration: 15,
    focus: 80,
    motivation: 75,
    fatigue: 20,
    confidence: 65
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentMood, setCurrentMood] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [motivationLevel, setMotivationLevel] = useState(75);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout>();

  const motivationalQuotes = [
    "Every small step counts. You're doing better than you think!",
    "Progress isn't always visible, but it's always happening.",
    "Your future self will thank you for not giving up today.",
    "You're absolutely crushing this session! Keep up the amazing work!",
    "Look at you go! Your dedication is truly inspiring!"
  ];

  const startCamera = async () => {
    try {
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
        setIsCameraActive(true);
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
  };

  // Simulate facial emotion analysis (in production, use actual ML models like face-api.js)
  const analyzeEmotions = useCallback(() => {
    if (!isCameraActive || !videoRef.current) return;

    // Simulate emotion detection with realistic variations
    const newEmotions: EmotionData = {
      happiness: Math.max(0, Math.min(100, emotionData.happiness + (Math.random() - 0.5) * 15)),
      frustration: Math.max(0, Math.min(100, emotionData.frustration + (Math.random() - 0.5) * 10)),
      focus: Math.max(0, Math.min(100, emotionData.focus + (Math.random() - 0.5) * 12)),
      motivation: Math.max(0, Math.min(100, emotionData.motivation + (Math.random() - 0.5) * 8)),
      fatigue: Math.max(0, Math.min(100, emotionData.fatigue + (Math.random() - 0.5) * 6)),
      confidence: Math.max(0, Math.min(100, emotionData.confidence + (Math.random() - 0.5) * 10))
    };

    setEmotionData(newEmotions);

    // Determine overall mood
    const happiness = newEmotions.happiness;
    const frustration = newEmotions.frustration;

    let mood: 'positive' | 'neutral' | 'negative';
    if (happiness > 60 && frustration < 40) {
      mood = 'positive';
    } else if (frustration > 60) {
      mood = 'negative';
    } else {
      mood = 'neutral';
    }

    setCurrentMood(mood);

    // Calculate motivation level
    const motivationScore = (
      newEmotions.happiness * 0.3 +
      newEmotions.confidence * 0.25 +
      newEmotions.focus * 0.2 +
      (100 - newEmotions.frustration) * 0.15 +
      (100 - newEmotions.fatigue) * 0.1
    );
    setMotivationLevel(motivationScore);

    // Generate suggestions based on emotional state
    generateSuggestions(newEmotions, mood);
  }, [isCameraActive, emotionData]);

  const generateSuggestions = (emotions: EmotionData, mood: string) => {
    const newSuggestions: string[] = [];

    if (emotions.motivation < 40) {
      newSuggestions.push("💪 Try some uplifting music to boost energy");
      newSuggestions.push("🎯 Focus on one small movement at a time");
    }

    if (emotions.frustration > 70) {
      newSuggestions.push("🧘 Take a deep breath and slow down");
      newSuggestions.push("💡 Remember: progress over perfection");
    }

    if (emotions.fatigue > 75) {
      newSuggestions.push("⏸️ Consider taking a short rest break");
      newSuggestions.push("💧 Stay hydrated and listen to your body");
    }

    if (emotions.happiness > 80) {
      newSuggestions.push("🎉 You're doing amazing! Keep this energy up!");
      newSuggestions.push("⭐ Your positive attitude is inspiring!");
    }

    if (emotions.focus < 50) {
      newSuggestions.push("🎵 Try changing background music");
      newSuggestions.push("👁️ Focus on one specific movement cue");
    }

    setSuggestions(newSuggestions.slice(0, 3));
  };

  const applySuggestion = (suggestion: string) => {
    if (suggestion.includes('music')) {
      // In a real app, this would trigger music player
      console.log('Applying music suggestion');
    } else if (suggestion.includes('rest')) {
      console.log('Suggesting rest break');
    }
    
    // Show quote for motivation
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setSuggestions(prev => [quote, ...prev.slice(0, 2)]);
  };

  useEffect(() => {
    if (isActive && isCameraActive) {
      setIsAnalyzing(true);
      analysisIntervalRef.current = setInterval(analyzeEmotions, 2000);
    } else {
      setIsAnalyzing(false);
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isActive, isCameraActive, analyzeEmotions]);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive': return <Smile className="h-5 w-5 text-green-600" />;
      case 'negative': return <Frown className="h-5 w-5 text-red-600" />;
      default: return <Meh className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Emotion Analysis Panel */}
      <Card className="border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-pink-600 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Live Emotion AI Analysis</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isAnalyzing ? 'default' : 'secondary'}>
                  {isAnalyzing ? 'Analyzing' : 'Paused'}
                </Badge>
                <Badge className={getMoodColor(currentMood)}>
                  {getMoodIcon(currentMood)}
                  {currentMood}
                </Badge>
                <Badge variant={isCameraActive ? 'default' : 'outline'}>
                  {isCameraActive ? 'Camera On' : 'Camera Off'}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Feed */}
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
                className="absolute inset-0 w-full h-full opacity-50"
                width={640}
                height={480}
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-center text-gray-600">
                    <CameraOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Camera feed will appear here</p>
                  </div>
                </div>
              )}

              {/* Emotion Overlay */}
              {isCameraActive && (
                <div className="absolute top-4 left-4 space-y-2">
                  <div className={`px-3 py-1 rounded-full text-sm text-white ${
                    currentMood === 'positive' ? 'bg-green-500 bg-opacity-75' :
                    currentMood === 'negative' ? 'bg-red-500 bg-opacity-75' :
                    'bg-yellow-500 bg-opacity-75'
                  }`}>
                    Mood: {currentMood}
                  </div>
                  <div className="bg-purple-500 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                    Motivation: {Math.round(motivationLevel)}%
                  </div>
                </div>
              )}
            </div>

            {/* Current Emotion State */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Real-time Emotional State
              </h4>
              
              <div className="space-y-3">
                {Object.entries(emotionData).map(([emotion, value]) => (
                  <div key={emotion}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">
                        {emotion.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">{Math.round(value)}%</span>
                    </div>
                    <Progress 
                      value={value} 
                      className={`mb-1 ${
                        ['frustration', 'fatigue'].includes(emotion) 
                          ? '[&>div]:bg-red-500' 
                          : '[&>div]:bg-green-500'
                      }`} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="flex justify-center gap-4">
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
          </div>

          {/* Motivation Level Indicator */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Overall Motivation Level
              </span>
              <span className="text-2xl font-bold text-purple-600">
                {Math.round(motivationLevel)}%
              </span>
            </div>
            <Progress value={motivationLevel} className="mb-2 [&>div]:bg-purple-500" />
            <p className="text-xs text-gray-600">
              Based on facial expression analysis and emotional state detection
            </p>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm">{suggestion}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
