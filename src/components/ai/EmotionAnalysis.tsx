
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  Music, 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Activity,
  Camera,
  Sparkles,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

interface EmotionData {
  happiness: number;
  sadness: number;
  frustration: number;
  focus: number;
  motivation: number;
  fatigue: number;
  confidence: number;
}

interface MotivationContent {
  type: 'music' | 'quote' | 'video' | 'exercise_modification';
  content: string;
  reason: string;
}

interface EmotionAnalysisProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onContentSuggestion: (content: MotivationContent) => void;
  onExerciseModification: (modification: string) => void;
}

export const EmotionAnalysis: React.FC<EmotionAnalysisProps> = ({
  videoRef,
  isActive,
  onContentSuggestion,
  onExerciseModification
}) => {
  const [emotionData, setEmotionData] = useState<EmotionData>({
    happiness: 75,
    sadness: 10,
    frustration: 15,
    focus: 80,
    motivation: 70,
    fatigue: 25,
    confidence: 65
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMood, setCurrentMood] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [motivationLevel, setMotivationLevel] = useState(70);
  const [suggestedContent, setSuggestedContent] = useState<MotivationContent | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<Array<{
    timestamp: Date;
    emotions: EmotionData;
    mood: string;
    action: string;
  }>>([]);

  const [musicPreferences, setMusicPreferences] = useState({
    genre: 'upbeat',
    energy: 75,
    tempo: 'moderate'
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout>();

  // Motivational quotes database
  const motivationalQuotes = {
    low_motivation: [
      "Every small step counts. You're doing better than you think!",
      "Progress isn't always visible, but it's always happening.",
      "Your future self will thank you for not giving up today."
    ],
    frustration: [
      "It's okay to feel frustrated. That means you care about getting better.",
      "Challenges are what make life interesting. Overcoming them makes life meaningful.",
      "Take a deep breath. You've overcome difficulties before, and you can do it again."
    ],
    fatigue: [
      "Rest when you need to, but don't quit. Your strength is building with each session.",
      "Listen to your body. Sometimes the best progress comes from knowing when to pause.",
      "You're stronger than you feel right now. Take it one rep at a time."
    ],
    encouragement: [
      "You're absolutely crushing this session! Keep up the amazing work!",
      "Look at you go! Your dedication is truly inspiring!",
      "You're a warrior! Every movement is a victory!"
    ]
  };

  // Music suggestions based on emotion
  const musicSuggestions = {
    low_energy: ['Uplifting Pop', 'Motivational Rock', 'Energetic Electronic'],
    high_stress: ['Calming Classical', 'Ambient Relaxation', 'Nature Sounds'],
    focused: ['Lo-fi Hip Hop', 'Instrumental Focus', 'Smooth Jazz'],
    motivated: ['Workout Hits', 'High-Energy Rock', 'Dance Electronic']
  };

  // Simulate emotion detection (in production, use actual ML models)
  const analyzeEmotions = useCallback(() => {
    if (!isActive || !videoRef.current) return;

    // Simulate facial emotion detection
    const simulatedEmotions: EmotionData = {
      happiness: Math.max(0, Math.min(100, emotionData.happiness + (Math.random() - 0.5) * 10)),
      sadness: Math.max(0, Math.min(100, emotionData.sadness + (Math.random() - 0.5) * 5)),
      frustration: Math.max(0, Math.min(100, emotionData.frustration + (Math.random() - 0.5) * 8)),
      focus: Math.max(0, Math.min(100, emotionData.focus + (Math.random() - 0.5) * 6)),
      motivation: Math.max(0, Math.min(100, emotionData.motivation + (Math.random() - 0.5) * 7)),
      fatigue: Math.max(0, Math.min(100, emotionData.fatigue + (Math.random() - 0.5) * 4)),
      confidence: Math.max(0, Math.min(100, emotionData.confidence + (Math.random() - 0.5) * 5))
    };

    setEmotionData(simulatedEmotions);

    // Determine overall mood
    const happiness = simulatedEmotions.happiness;
    const frustration = simulatedEmotions.frustration;
    const sadness = simulatedEmotions.sadness;

    let mood: 'positive' | 'neutral' | 'negative';
    if (happiness > 60 && frustration < 40 && sadness < 30) {
      mood = 'positive';
    } else if (frustration > 60 || sadness > 50) {
      mood = 'negative';
    } else {
      mood = 'neutral';
    }

    setCurrentMood(mood);

    // Calculate motivation level
    const motivationScore = (
      simulatedEmotions.happiness * 0.3 +
      simulatedEmotions.confidence * 0.25 +
      simulatedEmotions.focus * 0.2 +
      (100 - simulatedEmotions.frustration) * 0.15 +
      (100 - simulatedEmotions.fatigue) * 0.1
    );
    setMotivationLevel(motivationScore);

    // Generate suggestions based on emotional state
    generateMotivationalContent(simulatedEmotions, mood);

    // Log emotion data
    logEmotionData(simulatedEmotions, mood);
  }, [isActive, emotionData, videoRef]);

  const generateMotivationalContent = (emotions: EmotionData, mood: string) => {
    let suggestion: MotivationContent | null = null;

    if (emotions.motivation < 40) {
      suggestion = {
        type: 'quote',
        content: motivationalQuotes.low_motivation[Math.floor(Math.random() * motivationalQuotes.low_motivation.length)],
        reason: 'Low motivation detected'
      };
    } else if (emotions.frustration > 70) {
      suggestion = {
        type: 'quote',
        content: motivationalQuotes.frustration[Math.floor(Math.random() * motivationalQuotes.frustration.length)],
        reason: 'Frustration detected'
      };
    } else if (emotions.fatigue > 75) {
      suggestion = {
        type: 'exercise_modification',
        content: 'Consider reducing intensity by 20% and taking longer rest periods',
        reason: 'High fatigue detected'
      };
    } else if (emotions.happiness > 80 && emotions.confidence > 75) {
      suggestion = {
        type: 'quote',
        content: motivationalQuotes.encouragement[Math.floor(Math.random() * motivationalQuotes.encouragement.length)],
        reason: 'Excellent mood - reinforcing positive state'
      };
    } else if (emotions.focus < 50) {
      const energyMusic = musicSuggestions.low_energy[Math.floor(Math.random() * musicSuggestions.low_energy.length)];
      suggestion = {
        type: 'music',
        content: energyMusic,
        reason: 'Low focus - suggesting energizing music'
      };
    }

    if (suggestion) {
      setSuggestedContent(suggestion);
      onContentSuggestion(suggestion);
      
      if (suggestion.type === 'exercise_modification') {
        onExerciseModification(suggestion.content);
      }
    }
  };

  const logEmotionData = (emotions: EmotionData, mood: string) => {
    const entry = {
      timestamp: new Date(),
      emotions,
      mood,
      action: suggestedContent?.type || 'none'
    };

    setEmotionHistory(prev => [...prev.slice(-19), entry]);
  };

  const applySuggestion = (suggestion: MotivationContent) => {
    if (suggestion.type === 'music') {
      // In a real app, this would trigger music player
      console.log('Playing music:', suggestion.content);
    } else if (suggestion.type === 'exercise_modification') {
      onExerciseModification(suggestion.content);
    }
    setSuggestedContent(null);
  };

  const dismissSuggestion = () => {
    setSuggestedContent(null);
  };

  useEffect(() => {
    if (isActive) {
      setIsAnalyzing(true);
      analysisIntervalRef.current = setInterval(analyzeEmotions, 3000);
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
  }, [isActive, analyzeEmotions]);

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
              <span className="text-xl font-bold">Emotion & Motivation AI</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isAnalyzing ? 'default' : 'secondary'}>
                  {isAnalyzing ? 'Analyzing' : 'Paused'}
                </Badge>
                <Badge className={getMoodColor(currentMood)}>
                  {getMoodIcon(currentMood)}
                  {currentMood}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Emotion State */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Emotional State
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(emotionData).map(([emotion, value]) => (
                <div key={emotion}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium capitalize">
                      {emotion.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{Math.round(value)}%</span>
                  </div>
                  <Progress 
                    value={value} 
                    className={`mb-1 ${
                      ['sadness', 'frustration', 'fatigue'].includes(emotion) 
                        ? 'progress-red' 
                        : 'progress-green'
                    }`} 
                  />
                </div>
              ))}
            </div>
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
            <Progress value={motivationLevel} className="mb-2" />
            <p className="text-xs text-gray-600">
              Based on emotional state, confidence, and engagement levels
            </p>
          </div>

          {/* Active Suggestion */}
          {suggestedContent && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {suggestedContent.type === 'music' && <Music className="h-5 w-5 text-blue-600" />}
                  {suggestedContent.type === 'quote' && <Lightbulb className="h-5 w-5 text-blue-600" />}
                  {suggestedContent.type === 'exercise_modification' && <RefreshCw className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-800 mb-1">
                    {suggestedContent.reason}
                  </div>
                  <p className="text-blue-700 text-sm mb-3">
                    {suggestedContent.content}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => applySuggestion(suggestedContent)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={dismissSuggestion}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Music Preferences */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Music className="h-4 w-4" />
              Music Therapy Settings
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Energy Level</label>
                <Slider
                  value={[musicPreferences.energy]}
                  onValueChange={([value]) => setMusicPreferences(prev => ({ ...prev, energy: value }))}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-gray-600 mt-1">
                  {musicPreferences.energy}% Energy
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <label className="text-sm font-medium mb-2 block w-full">Genre Preference</label>
                {['upbeat', 'calming', 'focus', 'energetic'].map((genre) => (
                  <Button
                    key={genre}
                    variant={musicPreferences.genre === genre ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMusicPreferences(prev => ({ ...prev, genre }))}
                    className="capitalize"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <label className="text-sm font-medium mb-2 block w-full">Tempo</label>
                {['slow', 'moderate', 'fast'].map((tempo) => (
                  <Button
                    key={tempo}
                    variant={musicPreferences.tempo === tempo ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMusicPreferences(prev => ({ ...prev, tempo }))}
                    className="capitalize"
                  >
                    {tempo}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emotion History & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emotional Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {emotionHistory.slice(-8).reverse().map((entry, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 text-xs text-gray-500">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getMoodIcon(entry.mood)}
                    <span className="text-sm font-medium capitalize">{entry.mood} Mood</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Motivation: {Math.round(entry.emotions.motivation)}% • 
                    Focus: {Math.round(entry.emotions.focus)}% • 
                    Confidence: {Math.round(entry.emotions.confidence)}%
                  </div>
                </div>
                {entry.action !== 'none' && (
                  <Badge variant="outline" className="text-xs">
                    {entry.action}
                  </Badge>
                )}
              </div>
            ))}
            {emotionHistory.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Emotion analysis data will appear here during your session</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
