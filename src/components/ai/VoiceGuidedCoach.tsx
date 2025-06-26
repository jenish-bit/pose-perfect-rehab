
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Bot,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface VoiceCoachProps {
  poseData: any;
  exercisePhase: string;
  repCount: number;
  isActive: boolean;
  onFeedbackGenerated: (feedback: string) => void;
}

interface VoiceSettings {
  voice: string;
  speed: number;
  volume: number;
  pitch: number;
  encouragementLevel: 'minimal' | 'moderate' | 'enthusiastic';
  language: string;
}

export const VoiceGuidedCoach: React.FC<VoiceCoachProps> = ({
  poseData,
  exercisePhase,
  repCount,
  isActive,
  onFeedbackGenerated
}) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'female-1',
    speed: 1.0,
    volume: 0.8,
    pitch: 1.0,
    encouragementLevel: 'moderate',
    language: 'en-US'
  });

  const [feedbackHistory, setFeedbackHistory] = useState<Array<{
    timestamp: Date;
    feedback: string;
    trigger: string;
    phase: string;
  }>>([]);

  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const lastFeedbackRef = useRef<string>('');
  const speechTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
      
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        setIsInitialized(true);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Generate contextual feedback based on pose data
  const generateFeedback = useCallback(() => {
    if (!poseData || !isActive || !isVoiceEnabled) return;

    const { movements, confidence, isCorrectForm } = poseData;
    let feedback = '';
    let trigger = '';

    // Phase-based feedback
    if (exercisePhase === 'preparation') {
      feedback = getPreparationFeedback();
      trigger = 'phase_change';
    } else if (exercisePhase === 'execution') {
      feedback = getExecutionFeedback(movements, confidence, isCorrectForm);
      trigger = 'performance_analysis';
    } else if (exercisePhase === 'recovery') {
      feedback = getRecoveryFeedback(movements);
      trigger = 'recovery_phase';
    }

    // Rep milestone feedback
    if (repCount > 0 && repCount % 5 === 0) {
      feedback = getMilestoneFeedback(repCount);
      trigger = 'milestone_reached';
    }

    if (feedback && feedback !== lastFeedbackRef.current) {
      speakFeedback(feedback);
      logFeedback(feedback, trigger);
      lastFeedbackRef.current = feedback;
    }
  }, [poseData, exercisePhase, repCount, isActive, isVoiceEnabled, voiceSettings]);

  const getPreparationFeedback = (): string => {
    const messages = {
      minimal: ['Ready to begin.', 'Get in position.'],
      moderate: ['Great! Let\'s get ready to start your exercise.', 'Position yourself and we\'ll begin.'],
      enthusiastic: ['Excellent! You\'re looking great today. Let\'s crush this workout together!', 'I\'m excited to guide you through this session. You\'ve got this!']
    };
    const levelMessages = messages[voiceSettings.encouragementLevel];
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  };

  const getExecutionFeedback = (movements: any, confidence: number, isCorrectForm: boolean): string => {
    if (!movements) return '';

    const { movementQuality, fatigueLevel, balanceScore, symmetryScore } = movements;

    if (fatigueLevel > 7) {
      return voiceSettings.encouragementLevel === 'enthusiastic' 
        ? 'I can see you\'re working hard! Take your time and focus on your form.'
        : 'Take it slow. Focus on quality over speed.';
    }

    if (isCorrectForm && movementQuality > 80) {
      return voiceSettings.encouragementLevel === 'enthusiastic'
        ? 'Outstanding form! You\'re absolutely nailing this exercise!'
        : 'Excellent form! Keep it up.';
    }

    if (balanceScore < 60) {
      return 'Focus on your balance. Engage your core muscles.';
    }

    if (symmetryScore < 70) {
      return 'Try to keep both sides of your body moving equally.';
    }

    if (confidence < 0.6) {
      return 'Slow down a bit and focus on the movement pattern.';
    }

    return '';
  };

  const getRecoveryFeedback = (movements: any): string => {
    const messages = {
      minimal: ['Rest phase.', 'Recover now.'],
      moderate: ['Good work! Take a moment to rest and breathe.', 'Nice job! Use this time to recover.'],
      enthusiastic: ['Fantastic effort! You earned this rest. Breathe deeply and prepare for the next set!']
    };
    const levelMessages = messages[voiceSettings.encouragementLevel];
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  };

  const getMilestoneFeedback = (count: number): string => {
    const messages = {
      minimal: [`${count} reps completed.`],
      moderate: [`Great job! ${count} reps done.`, `You've completed ${count} repetitions. Well done!`],
      enthusiastic: [`Amazing! ${count} reps completed! You're doing incredible!`, `Wow! ${count} down! Your dedication is inspiring!`]
    };
    const levelMessages = messages[voiceSettings.encouragementLevel];
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  };

  const speakFeedback = useCallback((text: string) => {
    if (!speechSynthesis || !isVoiceEnabled) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
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
    utterance.pitch = voiceSettings.pitch;
    utterance.lang = voiceSettings.language;

    setCurrentFeedback(text);
    speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setCurrentFeedback('');
    };

    onFeedbackGenerated(text);
  }, [speechSynthesis, isVoiceEnabled, availableVoices, voiceSettings, onFeedbackGenerated]);

  const logFeedback = (feedback: string, trigger: string) => {
    setFeedbackHistory(prev => [...prev.slice(-19), {
      timestamp: new Date(),
      feedback,
      trigger,
      phase: exercisePhase
    }]);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceSettings.language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes('tired') || command.includes('rest')) {
      speakFeedback('I understand you need a break. Take your time to rest.');
    } else if (command.includes('help') || command.includes('how')) {
      speakFeedback('Focus on slow, controlled movements. I\'m here to guide you.');
    } else if (command.includes('good') || command.includes('great')) {
      speakFeedback('Thank you! You\'re doing wonderfully. Keep up the excellent work!');
    }
  };

  const testVoice = () => {
    speakFeedback('Hello! This is how I sound with your current settings.');
  };

  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(generateFeedback, 3000);
      return () => clearInterval(interval);
    }
  }, [generateFeedback, isInitialized]);

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
              <span className="text-xl font-bold">Voice-Guided AI Coach</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isVoiceEnabled ? 'default' : 'secondary'}>
                  {isVoiceEnabled ? 'Active' : 'Muted'}
                </Badge>
                <Badge variant={isListening ? 'default' : 'outline'}>
                  {isListening ? 'Listening' : 'Voice Commands Off'}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Controls */}
          <div className="flex gap-4">
            <Button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              variant={isVoiceEnabled ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
            </Button>
            
            <Button
              onClick={isListening ? () => setIsListening(false) : startListening}
              variant={isListening ? 'destructive' : 'outline'}
              className="flex items-center gap-2"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? 'Stop Listening' : 'Voice Commands'}
            </Button>

            <Button onClick={testVoice} variant="outline" size="sm">
              Test Voice
            </Button>
          </div>

          {/* Current Feedback Display */}
          {currentFeedback && (
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Currently Speaking:</span>
              </div>
              <p className="text-green-700 italic">"{currentFeedback}"</p>
            </div>
          )}

          {/* Voice Settings */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Voice Settings
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <label className="text-sm font-medium mb-2 block">Voice Type</label>
                <Select
                  value={voiceSettings.voice}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, voice: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female-1">Female Voice</SelectItem>
                    <SelectItem value="male-1">Male Voice</SelectItem>
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
        </CardContent>
      </Card>

      {/* Feedback History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Voice Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {feedbackHistory.slice(-10).reverse().map((entry, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Bot className="h-4 w-4 text-green-600 mt-1" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline" className="text-xs">
                      {entry.phase} • {entry.trigger.replace('_', ' ')}
                    </Badge>
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
