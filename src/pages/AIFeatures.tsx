
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Brain, 
  Bot, 
  Video, 
  Heart, 
  ArrowLeft, 
  Play, 
  Pause,
  Settings,
  Sparkles,
  Activity,
  Zap
} from 'lucide-react';

// Import our enhanced AI components
import { NeuroAdaptEngine } from '@/components/ai/NeuroAdaptEngine';
import { VoiceGuidedCoach } from '@/components/ai/VoiceGuidedCoach';
import { TeleRehabMonitor } from '@/components/ai/TeleRehabMonitor';
import { EmotionAnalysis } from '@/components/ai/EmotionAnalysis';

const AIFeatures: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeFeatures, setActiveFeatures] = useState({
    neuroAdapt: false,
    voiceCoach: false,
    teleRehab: false,
    emotionAnalysis: false
  });

  const [sessionStats, setSessionStats] = useState({
    adaptations: 0,
    voiceInteractions: 0,
    remoteViewers: 2,
    motivationScore: 87
  });

  const handleFeatureToggle = (feature: keyof typeof activeFeatures) => {
    setActiveFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
    
    // Update stats when features are toggled
    if (!activeFeatures[feature]) {
      console.log(`Starting ${feature}...`);
      if (feature === 'voiceCoach') {
        setSessionStats(prev => ({ ...prev, voiceInteractions: prev.voiceInteractions + 1 }));
      } else if (feature === 'neuroAdapt') {
        setSessionStats(prev => ({ ...prev, adaptations: prev.adaptations + 1 }));
      }
    }
  };

  const toggleSession = () => {
    setIsSessionActive(!isSessionActive);
    if (!isSessionActive) {
      // Reset stats when starting new session
      setSessionStats({
        adaptations: 0,
        voiceInteractions: 0,
        remoteViewers: Math.floor(Math.random() * 3) + 1,
        motivationScore: 75 + Math.floor(Math.random() * 20)
      });
    }
  };

  const aiFeatureStats = [
    {
      title: "AI Adaptations",
      value: sessionStats.adaptations.toString(),
      change: activeFeatures.neuroAdapt ? "Active" : "Inactive",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      title: "Voice Interactions",
      value: sessionStats.voiceInteractions.toString(),
      change: activeFeatures.voiceCoach ? "Active" : "Inactive",
      icon: Bot,
      color: "text-green-600"
    },
    {
      title: "Remote Viewers",
      value: activeFeatures.teleRehab ? sessionStats.remoteViewers.toString() : "0",
      change: activeFeatures.teleRehab ? "Monitoring" : "Offline",
      icon: Video,
      color: "text-blue-600"
    },
    {
      title: "Motivation Score",
      value: `${sessionStats.motivationScore}%`,
      change: activeFeatures.emotionAnalysis ? "Analyzing" : "Paused",
      icon: Heart,
      color: "text-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Advanced AI Features</h1>
                  <p className="text-xs text-gray-500">Real-Time Rehabilitation Technology</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={isSessionActive ? 'default' : 'secondary'} className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {isSessionActive ? 'Live Session' : 'Session Paused'}
              </Badge>
              <Button 
                onClick={toggleSession}
                variant={isSessionActive ? 'destructive' : 'default'}
                className="flex items-center gap-2"
              >
                {isSessionActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isSessionActive ? 'Stop Session' : 'Start Live Session'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Real-Time AI-Powered Rehabilitation
          </h2>
          <p className="text-gray-600">
            Experience live AI features that adapt to your movements, provide voice guidance, 
            enable remote monitoring, and analyze your emotional state for optimal recovery.
          </p>
        </div>

        {/* Live Feature Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {aiFeatureStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className={`text-xs font-medium mt-1 ${
                  stat.change.includes('Active') || stat.change.includes('Monitoring') || stat.change.includes('Analyzing')
                    ? 'text-green-600' 
                    : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Toggle Panel */}
        <Card className="mb-8 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Live AI Feature Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'neuroAdapt', label: 'NeuroAdapt AI', icon: Brain, color: 'purple', desc: 'Real-time adaptation' },
                { key: 'voiceCoach', label: 'Voice Coach', icon: Bot, color: 'green', desc: 'Live voice feedback' },
                { key: 'teleRehab', label: 'TeleRehab Monitor', icon: Video, color: 'blue', desc: 'Remote monitoring' },
                { key: 'emotionAnalysis', label: 'Emotion Analysis', icon: Heart, color: 'pink', desc: 'Mood detection' }
              ].map(({ key, label, icon: Icon, color, desc }) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
                    activeFeatures[key as keyof typeof activeFeatures] 
                      ? `border-${color}-300 bg-${color}-50` 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handleFeatureToggle(key as keyof typeof activeFeatures)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      activeFeatures[key as keyof typeof activeFeatures] 
                        ? `text-${color}-600` 
                        : 'text-gray-400'
                    }`} />
                    <h3 className="font-semibold text-sm mb-1">{label}</h3>
                    <p className="text-xs text-gray-600 mb-2">{desc}</p>
                    <Badge variant={activeFeatures[key as keyof typeof activeFeatures] ? 'default' : 'outline'}>
                      {activeFeatures[key as keyof typeof activeFeatures] ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Session Status */}
            {isSessionActive && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Activity className="h-5 w-5" />
                  <span className="font-semibold">Live Session Active</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  {Object.values(activeFeatures).filter(Boolean).length} AI features are currently running and analyzing your movements in real-time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Features Tabs */}
        <Tabs defaultValue="neuroadapt" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="neuroadapt" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              NeuroAdapt AI
            </TabsTrigger>
            <TabsTrigger value="voicecoach" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Voice Coach
            </TabsTrigger>
            <TabsTrigger value="telerehab" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              TeleRehab
            </TabsTrigger>
            <TabsTrigger value="emotion" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Emotion AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="neuroadapt" className="mt-6">
            {activeFeatures.neuroAdapt ? (
              <NeuroAdaptEngine
                poseData={{
                  landmarks: [],
                  movements: {
                    jointAngles: [],
                    rangeOfMotion: {},
                    movementQuality: 75,
                    fatigueLevel: 3,
                    painIndicators: [],
                    balanceScore: 80,
                    symmetryScore: 85
                  },
                  isCorrectForm: true,
                  confidence: 0.85,
                  feedback: 'Excellent form! Keep up the great work!',
                  exercisePhase: 'execution' as const
                }}
                currentExercise="arm_raise"
                onSettingsChange={(settings) => console.log('Settings changed:', settings)}
                isActive={isSessionActive}
              />
            ) : (
              <Card className="p-8 text-center border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <Brain className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-2xl font-semibold mb-4">NeuroAdapt AI Engine</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Intelligent real-time exercise adaptation based on your performance, fatigue levels, and movement quality.
                </p>
                <Button 
                  onClick={() => handleFeatureToggle('neuroAdapt')}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Activate NeuroAdapt AI
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="voicecoach" className="mt-6">
            {activeFeatures.voiceCoach ? (
              <VoiceGuidedCoach isActive={isSessionActive} />
            ) : (
              <Card className="p-8 text-center border-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
                <Bot className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <h3 className="text-2xl font-semibold mb-4">Live Voice AI Coach</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Real-time spoken feedback and encouragement based on your exercise performance and form analysis.
                </p>
                <Button 
                  onClick={() => handleFeatureToggle('voiceCoach')}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Activate Voice Coach
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="telerehab" className="mt-6">
            {activeFeatures.teleRehab ? (
              <TeleRehabMonitor isActive={isSessionActive} />
            ) : (
              <Card className="p-8 text-center border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <Video className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                <h3 className="text-2xl font-semibold mb-4">Live TeleRehab Monitor</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Enable remote monitoring for caregivers and therapists to join your session with live pose overlay.
                </p>
                <Button 
                  onClick={() => handleFeatureToggle('teleRehab')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Activate TeleRehab Monitor
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emotion" className="mt-6">
            {activeFeatures.emotionAnalysis ? (
              <EmotionAnalysis isActive={isSessionActive} />
            ) : (
              <Card className="p-8 text-center border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
                <Heart className="h-16 w-16 mx-auto mb-4 text-pink-400" />
                <h3 className="text-2xl font-semibold mb-4">Live Emotion Analysis</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Real-time facial expression analysis for personalized motivation and content suggestions.
                </p>
                <Button 
                  onClick={() => handleFeatureToggle('emotionAnalysis')}
                  size="lg"
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Activate Emotion Analysis
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIFeatures;
