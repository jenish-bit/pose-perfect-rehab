
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Share2
} from 'lucide-react';

interface TeleRehabMonitorProps {
  patientData: {
    name: string;
    id: string;
    avatar?: string;
  };
  poseData: any;
  isSessionActive: boolean;
  onSendMessage: (message: string, type: 'text' | 'voice') => void;
  onSessionControl: (action: 'start' | 'pause' | 'end') => void;
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

export const TeleRehabMonitor: React.FC<TeleRehabMonitorProps> = ({
  patientData,
  poseData,
  isSessionActive,
  onSendMessage,
  onSessionControl
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isShareEnabled, setIsShareEnabled] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedViewer, setSelectedViewer] = useState<string | null>(null);
  
  const [monitoringSession, setMonitoringSession] = useState<MonitoringSession>({
    id: 'session_' + Date.now(),
    startTime: new Date(),
    viewers: [
      {
        id: 'therapist_1',
        name: 'Dr. Sarah Johnson',
        role: 'therapist',
        avatar: '/api/placeholder/32/32',
        joinedAt: new Date()
      },
      {
        id: 'caregiver_1',
        name: 'Mary (Caregiver)',
        role: 'caregiver',
        joinedAt: new Date(Date.now() - 300000)
      }
    ],
    messages: [
      {
        id: 'msg_1',
        senderId: 'system',
        senderName: 'System',
        content: 'Monitoring session started',
        type: 'system',
        timestamp: new Date()
      }
    ]
  });

  const [liveMetrics, setLiveMetrics] = useState({
    heartRate: 72,
    breathingRate: 16,
    stressLevel: 2,
    fatigueLevel: 3,
    painLevel: 1,
    attention: 85,
    engagement: 90
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [monitoringSession.messages]);

  // Simulate live metrics updates
  useEffect(() => {
    if (isSessionActive) {
      const interval = setInterval(() => {
        setLiveMetrics(prev => ({
          heartRate: Math.max(60, Math.min(120, prev.heartRate + (Math.random() - 0.5) * 4)),
          breathingRate: Math.max(12, Math.min(24, prev.breathingRate + (Math.random() - 0.5) * 2)),
          stressLevel: Math.max(0, Math.min(5, prev.stressLevel + (Math.random() - 0.5) * 0.5)),
          fatigueLevel: poseData?.movements?.fatigueLevel || prev.fatigueLevel,
          painLevel: Math.max(0, Math.min(5, prev.painLevel + (Math.random() - 0.5) * 0.3)),
          attention: Math.max(50, Math.min(100, prev.attention + (Math.random() - 0.5) * 5)),
          engagement: Math.max(60, Math.min(100, prev.engagement + (Math.random() - 0.5) * 3))
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isSessionActive, poseData]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: 'msg_' + Date.now(),
      senderId: 'current_user',
      senderName: 'You',
      content: newMessage,
      type: 'text' as const,
      timestamp: new Date()
    };

    setMonitoringSession(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));

    onSendMessage(newMessage, 'text');
    setNewMessage('');
  };

  const sendQuickMessage = (message: string) => {
    const quickMessage = {
      id: 'msg_' + Date.now(),
      senderId: 'current_user',
      senderName: 'You',
      content: message,
      type: 'text' as const,
      timestamp: new Date()
    };

    setMonitoringSession(prev => ({
      ...prev,
      messages: [...prev.messages, quickMessage]
    }));

    onSendMessage(message, 'text');
  };

  const getMetricColor = (value: number, type: string) => {
    switch (type) {
      case 'heartRate':
        return value > 100 ? 'text-red-600' : value > 85 ? 'text-orange-600' : 'text-green-600';
      case 'stress':
      case 'fatigue':
      case 'pain':
        return value > 3 ? 'text-red-600' : value > 2 ? 'text-orange-600' : 'text-green-600';
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

  return (
    <div className="space-y-6">
      {/* Main Monitoring Interface */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">TeleRehab Live Monitor</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isSessionActive ? 'default' : 'secondary'}>
                  {isSessionActive ? 'Live Session' : 'Session Ended'}
                </Badge>
                <Badge variant="outline">
                  {monitoringSession.viewers.length} Viewers
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Info & Session Controls */}
          <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={patientData.avatar} />
                <AvatarFallback>{patientData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{patientData.name}</h3>
                <p className="text-sm text-gray-600">Patient ID: {patientData.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs text-gray-500">
                    Session: {Math.floor((Date.now() - monitoringSession.startTime.getTime()) / 60000)} min
                  </span>
                </div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'heartRate', label: 'Heart Rate', value: liveMetrics.heartRate, unit: 'bpm', icon: Heart },
              { key: 'fatigueLevel', label: 'Fatigue', value: liveMetrics.fatigueLevel, unit: '/10', icon: Activity },
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
                {liveMetrics.fatigueLevel > 7 && 'High fatigue detected - consider rest break. '}
                {liveMetrics.stressLevel > 3 && 'Elevated stress levels observed.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viewers & Communication Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Viewers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Viewers ({monitoringSession.viewers.length})
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
                      <div className="font-medium text-sm">{viewer.name}</div>
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
                {monitoringSession.messages.map((message) => (
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
                '👍 Great job!',
                '⚠️ Take a break',
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
                placeholder="Send encouragement or instructions..."
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

      {/* Session Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor((Date.now() - monitoringSession.startTime.getTime()) / 60000)}
              </div>
              <div className="text-xs text-gray-600">Minutes Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(poseData?.confidence * 100 || 0)}%
              </div>
              <div className="text-xs text-gray-600">Avg Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {monitoringSession.messages.filter(m => m.type !== 'system').length}
              </div>
              <div className="text-xs text-gray-600">Messages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(liveMetrics.engagement)}%
              </div>
              <div className="text-xs text-gray-600">Engagement</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {liveMetrics.fatigueLevel}
              </div>
              <div className="text-xs text-gray-600">Peak Fatigue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-600">
                {monitoringSession.viewers.length}
              </div>
              <div className="text-xs text-gray-600">Peak Viewers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
