
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
  Activity
} from 'lucide-react';

// Import our AI components
import { NeuroAdaptEngine } from '@/components/ai/NeuroAdaptEngine';
import { VoiceGuidedCoach } from '@/components/ai/VoiceGuidedCoach';
import { TeleRehabMonitor } from '@/components/ai/TeleRehabMonitor';
import { EmotionAnalysis } from '@/components/ai/EmotionAnalysis';

const AIFeatures: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeFeatures, setActiveFeatures] = useState({
    neuroAdapt: false,
    voiceCoach: false,
    teleRehab: false,
    emotionAnalysis: false
  });

  // Mock pose data for demonstration
  const [mockPoseData] = useState({
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
  });

  const handleFeatureToggle = (feature: keyof typeof activeFeatures) => {
    setActiveFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleSessionToggle = () => {
    setIsSessionActive(!isSessionActive);
    if (!isSessionActive) {
      // Start all active features
      Object.keys(activeFeatures).forEach(feature => {
        if (activeFeatures[feature as keyof typeof activeFeatures]) {
          console.log(`Starting ${feature}...`);
        }
      });
    }
  };

  const handleAdaptiveSettingsChange = (settings: any) => {
    console.log('Adaptive settings changed:', settings);
  };

  const handleFeedbackGenerated = (feedback: string) => {
    console.log('Voice feedback:', feedback);
  };

  const handleContentSuggestion = (content: any) => {
    console.log('Content suggestion:', content);
  };

  const handleExerciseModification = (modification: string) => {
    console.log('Exercise modification:', modification);
  };

  const handleSendMessage = (message: string, type: string) => {
    console.log('TeleRehab message:', message, type);
  };

  const handleSessionControl = (action: string) => {
    console.log('Session control:', action);
    if (action === 'end') {
      setIsSessionActive(false);
    }
  };

  const aiFeatureStats = [
    {
      title: "AI Adaptations",
      value: "12",
      change: "+4 this session",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      title: "Voice Interactions",
      value: "28",
      change: "+8 feedbacks",
      icon: Bot,
      color: "text-green-600"
    },
    {
      title: "Remote Viewers",
      value: "2",
      change: "Active now",
      icon: Video,
      color: "text-blue-600"
    },
    {
      title: "Motivation Score",
      value: "87%",
      change: "+12% today",
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
                  <p className="text-xs text-gray-500">Next-Generation Rehabilitation Technology</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={isSessionActive ? 'default' : 'secondary'}>
                {isSessionActive ? 'Session Active' : 'Session Paused'}
              </Badge>
              <Button 
                onClick={handleSessionToggle}
                variant={isSessionActive ? 'destructive' : 'default'}
                className="flex items-center gap-2"
              >
                {isSessionActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isSessionActive ? 'Stop Session' : 'Start Session'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced AI-Powered Rehabilitation
          </h2>
          <p className="text-gray-600">
            Experience cutting-edge AI features that adapt to your needs, provide voice guidance, 
            enable remote monitoring, and analyze your emotional state for optimal recovery.
          </p>
        </div>

        {/* Feature Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {aiFeatureStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Toggle Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Feature Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'neuroAdapt', label: 'NeuroAdapt AI', icon: Brain, color: 'purple' },
                { key: 'voiceCoach', label: 'Voice Coach', icon: Bot, color: 'green' },
                { key: 'teleRehab', label: 'TeleRehab Monitor', icon: Video, color: 'blue' },
                { key: 'emotionAnalysis', label: 'Emotion Analysis', icon: Heart, color: 'pink' }
              ].map(({ key, label, icon: Icon, color }) => (
                <Button
                  key={key}
                  variant={activeFeatures[key as keyof typeof activeFeatures] ? 'default' : 'outline'}
                  onClick={() => handleFeatureToggle(key as keyof typeof activeFeatures)}
                  className={`h-auto p-4 flex flex-col items-center gap-2 ${
                    activeFeatures[key as keyof typeof activeFeatures] 
                      ? `bg-${color}-600 hover:bg-${color}-700` 
                      : ''
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{label}</span>
                  <Badge variant={activeFeatures[key as keyof typeof activeFeatures] ? 'secondary' : 'outline'}>
                    {activeFeatures[key as keyof typeof activeFeatures] ? 'Active' : 'Inactive'}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Features Tabs */}
        <Tabs defaultValue="neuroadapt" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
                poseData={mockPoseData}
                currentExercise="arm_raise"
                onSettingsChange={handleAdaptiveSettingsChange}
                isActive={isSessionActive}
              />
            ) : (
              <Card className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">NeuroAdapt AI is Inactive</h3>
                <p className="text-gray-600 mb-4">
                  Enable NeuroAdapt AI to get real-time exercise adaptations based on your performance.
                </p>
                <Button onClick={() => handleFeatureToggle('neuroAdapt')}>
                  Activate NeuroAdapt AI
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="voicecoach" className="mt-6">
            {activeFeatures.voiceCoach ? (
              <VoiceGuidedCoach
                poseData={mockPoseData}
                exercisePhase={mockPoseData.exercisePhase}
                repCount={8}
                isActive={isSessionActive}
                onFeedbackGenerated={handleFeedbackGenerated}
              />
            ) : (
              <Card className="p-8 text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Voice Coach is Inactive</h3>
                <p className="text-gray-600 mb-4">
                  Enable Voice Coach to receive real-time spoken feedback and encouragement.
                </p>
                <Button onClick={() => handleFeatureToggle('voiceCoach')}>
                  Activate Voice Coach
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="telerehab" className="mt-6">
            {activeFeatures.teleRehab ? (
              <TeleRehabMonitor
                patientData={{
                  name: user?.email?.split('@')[0] || 'Patient',
                  id: user?.id || 'unknown',
                  avatar: '/api/placeholder/48/48'
                }}
                poseData={mockPoseData}
                isSessionActive={isSessionActive}
                onSendMessage={handleSendMessage}
                onSessionControl={handleSessionControl}
              />
            ) : (
              <Card className="p-8 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">TeleRehab Monitor is Inactive</h3>
                <p className="text-gray-600 mb-4">
                  Enable TeleRehab Monitor to allow caregivers and therapists to join your session remotely.
                </p>
                <Button onClick={() => handleFeatureToggle('teleRehab')}>
                  Activate TeleRehab Monitor
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emotion" className="mt-6">
            {activeFeatures.emotionAnalysis ? (
              <EmotionAnalysis
                videoRef={videoRef}
                isActive={isSessionActive}
                onContentSuggestion={handleContentSuggestion}
                onExerciseModification={handleExerciseModification}
              />
            ) : (
              <Card className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Emotion Analysis is Inactive</h3>
                <p className="text-gray-600 mb-4">
                  Enable Emotion Analysis to get personalized motivation and content suggestions based on your mood.
                </p>
                <Button onClick={() => handleFeatureToggle('emotionAnalysis')}>
                  Activate Emotion Analysis
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Hidden video element for camera access */}
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          autoPlay
          playsInline
          muted
        />
      </div>
    </div>
  );
};

export default AIFeatures;
