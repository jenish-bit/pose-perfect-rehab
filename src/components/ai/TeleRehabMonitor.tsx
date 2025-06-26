
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WebcamPoseDetection } from '@/components/WebcamPoseDetection';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  MessageCircle, 
  Send,
  Eye,
  Activity,
  AlertCircle,
  Heart,
  Camera,
  UserCheck,
  Clock,
  Share2,
  Monitor
} from 'lucide-react';

interface TeleRehabMonitorProps {
  isActive: boolean;
}

interface MonitoringSession {
  id: string;
  startTime: Date;
  viewers: Array<{
    id: string;
    name: string;
    role: 'therapist' | 'caregiver' | 'doctor';
    avatar?: string;
    joinedAt: Date;
    isActive: boolean;
  }>;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    type: 'text' | 'voice' | 'system';
    timestamp: Date;
  }>;
}

export const TeleRehabMonitor: React.FC<TeleRehabMonitorProps> = ({ isActive }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isShareEnabled, setIsShareEnabled] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [repCount, setRepCount] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    accuracy: 0,
    totalReps: 0,
    sessionDuration: 0
  });
  
  const [monitoringSession, setMonitoringSession] = useState<MonitoringSession>({
    id: 'session_' + Date.now(),
    startTime: new Date(),
    viewers: [
      {
        id: 'therapist_1',
        name: 'Dr. Sarah Johnson',
        role: 'therapist',
        avatar: '/api/placeholder/32/32',
        joinedAt: new Date(),
        isActive: true
      },
      {
        id: 'caregiver_1',
        name: 'Mary (Caregiver)',
        role: 'caregiver',
        joinedAt: new Date(Date.now() - 300000),
        isActive: true
      }
    ],
    messages: [
      {
        id: 'msg_1',
        senderId: 'system',
        senderName: 'System',
        content: 'Remote monitoring session started',
        type: 'system',
        timestamp: new Date()
      }
    ]
  });

  const [liveMetrics, setLiveMetrics] = useState({
    heartRate: 72,
    stressLevel: 2,
    fatigueLevel: 3,
    attention: 85,
    engagement: 90
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [monitoringSession.messages]);

  // Simulate live metrics updates
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setLiveMetrics(prev => ({
          heartRate: Math.max(60, Math.min(120, prev.heartRate + (Math.random() - 0.5) * 4)),
          stressLevel: Math.max(0, Math.min(5, prev.stressLevel + (Math.random() - 0.5) * 0.5)),
          fatigueLevel: Math.max(0, Math.min(10, prev.fatigueLevel + (Math.random() - 0.5) * 0.8)),
          attention: Math.max(50, Math.min(100, prev.attention + (Math.random() - 0.5) * 5)),
          engagement: Math.max(60, Math.min(100, prev.engagement + (Math.random() - 0.5) * 3))
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // Update session duration
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const duration = Math.floor((Date.now() - monitoringSession.startTime.getTime()) / 1000);
        setSessionStats(prev => ({ ...prev, sessionDuration: duration }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, monitoringSession.startTime]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: 'msg_' + Date.now(),
      senderId: 'current_user',
      senderName: 'Patient',
      content: newMessage,
      type: 'text' as const,
      timestamp: new Date()
    };

    setMonitoringSession(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));

    setNewMessage('');

    // Simulate therapist response
    setTimeout(() => {
      const response = {
        id: 'msg_' + (Date.now() + 1),
        senderId: 'therapist_1',
        senderName: 'Dr. Sarah Johnson',
        content: getTherapistResponse(newMessage),
        type: 'text' as const,
        timestamp: new Date()
      };

      setMonitoringSession(prev => ({
        ...prev,
        messages: [...prev.messages, response]
      }));
    }, 1000 + Math.random() * 2000);
  };

  const getTherapistResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('tired') || lowerMessage.includes('fatigue')) {
      return "I can see you're working hard. Take a 30-second break and then continue with slower movements.";
    } else if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      return "Please stop the exercise immediately. Let's assess the pain level and modify the routine.";
    } else if (lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return "Excellent work! Your form is looking much better. Keep up the great progress!";
    } else if (lowerMessage.includes('difficult') || lowerMessage.includes('hard')) {
      return "It's normal for it to feel challenging. You're building strength! Would you like me to suggest an easier variation?";
    } else {
      return "I'm monitoring your progress closely. You're doing wonderfully! Keep focusing on controlled movements.";
    }
  };

  const sendQuickMessage = (message: string) => {
    const quickMessage = {
      id: 'msg_' + Date.now(),
      senderId: 'current_user',
      senderName: 'Patient',
      content: message,
      type: 'text' as const,
      timestamp: new Date()
    };

    setMonitoringSession(prev => ({
      ...prev,
      messages: [...prev.messages, quickMessage]
    }));
  };

  const handleRepCompleted = (repData: { accuracy: number; feedback: string }) => {
    const newRepCount = repCount + 1;
    setRepCount(newRepCount);
    
    setSessionStats(prev => ({
      ...prev,
      totalReps: newRepCount,
      accuracy: ((prev.accuracy * (newRepCount - 1)) + (repData.accuracy * 100)) / newRepCount
    }));

    // Notify viewers of progress
    if (newRepCount % 5 === 0) {
      const progressMessage = {
        id: 'msg_' + Date.now(),
        senderId: 'system',
        senderName: 'System',
        content: `Milestone reached: ${newRepCount} reps completed with ${Math.round(repData.accuracy * 100)}% accuracy`,
        type: 'system' as const,
        timestamp: new Date()
      };

      setMonitoringSession(prev => ({
        ...prev,
        messages: [...prev.messages, progressMessage]
      }));
    }
  };

  const getMetricColor = (value: number, type: string) => {
    switch (type) {
      case 'heartRate':
        return value > 100 ? 'text-red-600' : value > 85 ? 'text-orange-600' : 'text-green-600';
      case 'stress':
      case 'fatigue':
        return value > 6 ? 'text-red-600' : value > 4 ? 'text-orange-600' : 'text-green-600';
      default:
        return value > 80 ? 'text-green-600' : value > 60 ? 'text-orange-600' : 'text-red-600';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'therapist': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-purple-100 text-purple-800';
      case 'caregiver': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Monitoring Interface */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Live TeleRehab Monitor</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Live Session' : 'Session Paused'}
                </Badge>
                <Badge variant="outline">
                  {monitoringSession.viewers.filter(v => v.isActive).length} Active Viewers
                </Badge>
                <Badge variant="outline">
                  Duration: {formatTime(sessionStats.sessionDuration)}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Controls */}
          <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{repCount}</div>
                <div className="text-xs text-gray-600">Reps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(sessionStats.accuracy)}%
                </div>
                <div className="text-xs text-gray-600">Avg Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(sessionStats.sessionDuration)}
                </div>
                <div className="text-xs text-gray-600">Duration</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isVideoEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={isAudioEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={isShareEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsShareEnabled(!isShareEnabled)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Live Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { key: 'heartRate', label: 'Heart Rate', value: liveMetrics.heartRate, unit: 'bpm', icon: Heart },
              { key: 'fatigueLevel', label: 'Fatigue', value: liveMetrics.fatigueLevel, unit: '/10', icon: Activity },
              { key: 'stressLevel', label: 'Stress', value: liveMetrics.stressLevel, unit: '/5', icon: AlertCircle },
              { key: 'attention', label: 'Attention', value: liveMetrics.attention, unit: '%', icon: Eye },
              { key: 'engagement', label: 'Engagement', value: liveMetrics.engagement, unit: '%', icon: UserCheck }
            ].map(({ key, label, value, unit, icon: Icon }) => (
              <div key={key} className="bg-white p-4 rounded-lg border text-center">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${getMetricColor(value, key)}`} />
                <div className={`text-2xl font-bold ${getMetricColor(value, key)}`}>
                  {typeof value === 'number' ? Math.round(value) : value}{unit}
                </div>
                <div className="text-xs text-gray-600">{label}</div>
              </div>
            ))}
          </div>

          {/* Alert System */}
          {(liveMetrics.fatigueLevel > 7 || liveMetrics.stressLevel > 3) && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Attention Required</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                {liveMetrics.fatigueLevel > 7 && 'High fatigue detected - recommend rest break. '}
                {liveMetrics.stressLevel > 3 && 'Elevated stress levels observed - consider session adjustment.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Exercise Feed */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Live Exercise Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WebcamPoseDetection
            exerciseTitle="Monitored Rehabilitation Session"
            onRepCompleted={handleRepCompleted}
            isActive={isActive}
          />
        </CardContent>
      </Card>

      {/* Communication Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Viewers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Remote Viewers ({monitoringSession.viewers.filter(v => v.isActive).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monitoringSession.viewers.map((viewer) => (
                <div key={viewer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={viewer.avatar} />
                      <AvatarFallback>{viewer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {viewer.name}
                        {viewer.isActive && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(viewer.role)}`}>
                        {viewer.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.floor((Date.now() - viewer.joinedAt.getTime()) / 60000)}m ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="bg-gray-50 rounded-lg p-3 h-48 overflow-y-auto">
              <div className="space-y-3">
                {monitoringSession.messages.slice(-10).map((message) => (
                  <div key={message.id} className={`text-sm ${
                    message.type === 'system' ? 'text-center text-gray-500 italic' : ''
                  }`}>
                    {message.type !== 'system' && (
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-xs">{message.senderName}</span>
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className={message.type === 'system' ? '' : 'bg-white p-2 rounded'}>
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Messages */}
            <div className="flex flex-wrap gap-2">
              {[
                '👍 Doing great!',
                '⚠️ Need a break',
                '💪 Keep going!',
                '🔄 Adjust form'
              ].map((msg) => (
                <Button
                  key={msg}
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickMessage(msg)}
                  className="text-xs"
                >
                  {msg}
                </Button>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send message to therapist..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="text-sm"
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
