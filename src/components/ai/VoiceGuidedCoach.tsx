
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WebcamPoseDetection } from '@/components/WebcamPoseDetection';
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
  Camera
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
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [repCount, setRepCount] = useState(0);
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

  // Initialize speech synthesis
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
  }, []);

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
      trigger: 'pose_analysis'
    }]);
  }, [speechSynthesis, isVoiceEnabled, availableVoices, voiceSettings]);

  const generateEncouragement = (accuracy: number, feedback: string) => {
    let encouragementText = '';

    if (accuracy > 0.8) {
      const messages = {
        minimal: ['Good form.', 'Nice work.'],
        moderate: ['Excellent form! Keep it up.', 'Great job! You\'re doing really well.'],
        enthusiastic: ['Outstanding! You\'re absolutely crushing this exercise!', 'Incredible form! You\'re a rehabilitation superstar!']
      };
      encouragementText = messages[voiceSettings.encouragementLevel][Math.floor(Math.random() * messages[voiceSettings.encouragementLevel].length)];
    } else if (accuracy > 0.6) {
      encouragementText = voiceSettings.encouragementLevel === 'enthusiastic' 
        ? 'Good effort! Let\'s focus on the movement pattern.'
        : 'Focus on your form. You\'re doing well.';
    } else {
      encouragementText = 'Take your time. Slow and steady movements work best.';
    }

    if (feedback.includes('fatigue')) {
      encouragementText = 'I can see you\'re working hard. Feel free to take a rest when needed.';
    }

    speakFeedback(encouragementText);
  };

  const handleRepCompleted = (repData: { accuracy: number; feedback: string }) => {
    const newRepCount = repCount + 1;
    setRepCount(newRepCount);
    
    if (isVoiceEnabled) {
      generateEncouragement(repData.accuracy, repData.feedback);
      
      // Milestone feedback
      if (newRepCount % 5 === 0) {
        setTimeout(() => {
          const milestoneMessage = voiceSettings.encouragementLevel === 'enthusiastic' 
            ? `Amazing! ${newRepCount} reps completed! You're doing incredible!`
            : `${newRepCount} reps done. Well done!`;
          speakFeedback(milestoneMessage);
        }, 2000);
      }
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;

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
                <Badge variant="outline">Reps: {repCount}</Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Controls */}
          <div className="flex flex-wrap gap-4">
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

            <Button 
              onClick={() => setRepCount(0)} 
              variant="outline" 
              size="sm"
            >
              Reset Count
            </Button>
          </div>

          {/* Current Feedback Display */}
          {currentFeedback && (
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">AI Coach Speaking:</span>
              </div>
              <p className="text-green-700 italic font-medium">"{currentFeedback}"</p>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Webcam Pose Detection */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Live Exercise Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WebcamPoseDetection
            exerciseTitle="Rehabilitation Exercise"
            onRepCompleted={handleRepCompleted}
            isActive={isActive}
          />
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
