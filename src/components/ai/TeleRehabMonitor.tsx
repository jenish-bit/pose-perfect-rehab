
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdvancedPoseDetection } from '@/hooks/useAdvancedPoseDetection';
import { 
  Video, 
  VideoOff, 
  Users, 
  MessageSquare, 
  Share2,
  Camera,
  CameraOff,
  Send,
  Mic,
  MicOff,
  Monitor,
  Eye,
  Activity
} from 'lucide-react';

interface TeleRehabMonitorProps {
  isActive: boolean;
}

interface RemoteViewer {
  id: string;
  name: string;
  role: 'therapist' | 'caregiver' | 'family';
  status: 'online' | 'offline';
  joinedAt: Date;
}

export const TeleRehabMonitor: React.FC<TeleRehabMonitorProps> = ({ isActive }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewers, setViewers] = useState<RemoteViewer[]>([
    { id: '1', name: 'Dr. Sarah Johnson', role: 'therapist', status: 'online', joinedAt: new Date() },
    { id: '2', name: 'Mom', role: 'family', status: 'online', joinedAt: new Date() }
  ]);
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: string;
    message: string;
    timestamp: Date;
    type: 'message' | 'system';
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { poseData, isInitialized } = useAdvancedPoseDetection(
    videoRef, 
    canvasRef, 
    'telereab_monitoring'
  );

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
        
        // Auto-start streaming when camera starts
        setIsStreaming(true);
        
        // Add system message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'System',
          message: 'Camera started. Live monitoring active.',
          timestamp: new Date(),
          type: 'system'
        }]);
      }
    } catch (err) {
      console.error('Error accessing cameras:', err);
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
    setIsStreaming(false);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'System',
      message: 'Camera stopped. Monitoring session ended.',
      timestamp: new Date(),
      type: 'system'
    }]);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date(),
        type: 'message'
      }]);
      setNewMessage('');
    }
  };

  // Simulate receiving messages from viewers
  useEffect(() => {
    if (isStreaming && viewers.some(v => v.status === 'online')) {
      const interval = setInterval(() => {
        const supportMessages = [
          "Great form! Keep it up!",
          "You're doing excellent today!",
          "Perfect shoulder alignment!",
          "Take your time, you're improving!",
          "Wonderful progress this session!"
        ];
        
        if (Math.random() < 0.3) { // 30% chance every 10 seconds
          const randomViewer = viewers.find(v => v.status === 'online');
          const randomMessage = supportMessages[Math.floor(Math.random() * supportMessages.length)];
          
          if (randomViewer) {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender: randomViewer.name,
              message: randomMessage,
              timestamp: new Date(),
              type: 'message'
            }]);
          }
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isStreaming, viewers]);

  return (
    <div className="space-y-6">
      {/* Main TeleRehab Monitor Panel */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Live TeleRehab Monitor</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isCameraActive ? 'default' : 'secondary'}>
                  {isCameraActive ? 'Camera On' : 'Camera Off'}
                </Badge>
                <Badge variant={isStreaming ? 'default' : 'outline'}>
                  {isStreaming ? 'Live Streaming' : 'Not Streaming'}
                </Badge>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {viewers.filter(v => v.status === 'online').length} Viewers
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Video Feed with Pose Overlay */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
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
                      <p>Start camera to begin monitoring</p>
                    </div>
                  </div>
                )}

                {/* Live Stream Indicator */}
                {isStreaming && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      LIVE
                    </div>
                  </div>
                )}

                {/* Pose Analysis Overlay */}
                {poseData.confidence > 0 && (
                  <div className="absolute top-4 right-4 space-y-2">
                    <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                      Form Score: {Math.round(poseData.confidence * 100)}%
                    </div>
                    <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                      Balance: {poseData.movements.balanceScore}%
                    </div>
                  </div>
                )}

                {/* Feedback Display */}
                {poseData.feedback && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded-lg text-center">
                      {poseData.feedback}
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  variant={isCameraActive ? 'destructive' : 'default'}
                  className="flex items-center gap-2"
                >
                  {isCameraActive ? (
                    <>
                      <CameraOff className="h-4 w-4" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Start Monitoring
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Viewers Panel & Chat */}
            <div className="space-y-4">
              {/* Active Viewers */}
              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Active Viewers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {viewers.map(viewer => (
                    <div key={viewer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{viewer.name}</div>
                        <div className="text-xs text-gray-600 capitalize">{viewer.role}</div>
                      </div>
                      <Badge variant={viewer.status === 'online' ? 'default' : 'secondary'}>
                        {viewer.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Live Chat */}
              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 h-48 overflow-y-auto mb-3">
                    {messages.map(msg => (
                      <div key={msg.id} className={`text-sm p-2 rounded ${
                        msg.type === 'system' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{msg.sender}:</span>
                          <span className="text-xs text-gray-500">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-1">{msg.message}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border rounded text-sm"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{viewers.filter(v => v.status === 'online').length}</div>
              <div className="text-sm text-gray-600">Active Viewers</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {isStreaming ? '●' : '○'}
              </div>
              <div className="text-sm text-gray-600">Stream Status</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(poseData.confidence * 100)}%
              </div>
              <div className="text-sm text-gray-600">Form Score</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{messages.length}</div>
              <div className="text-sm text-gray-600">Messages</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
