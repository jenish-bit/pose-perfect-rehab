
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { Camera, CameraOff, RotateCcw } from 'lucide-react';

interface WebcamPoseDetectionProps {
  exerciseTitle: string;
  onRepCompleted: (repData: { accuracy: number; feedback: string }) => void;
  isActive: boolean;
}

export const WebcamPoseDetection: React.FC<WebcamPoseDetectionProps> = ({
  exerciseTitle,
  onRepCompleted,
  isActive
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const { poseData, isInitialized } = usePoseDetection(videoRef, canvasRef, exerciseTitle);

  useEffect(() => {
    if (isActive && !isWebcamActive) {
      startWebcam();
    } else if (!isActive && isWebcamActive) {
      stopWebcam();
    }
  }, [isActive]);

  useEffect(() => {
    // Track reps based on pose analysis
    if (poseData.isCorrectForm && isWebcamActive) {
      const newRep = repCount + 1;
      setRepCount(newRep);
      onRepCompleted({
        accuracy: poseData.confidence,
        feedback: poseData.feedback
      });
    }
  }, [poseData.isCorrectForm, isWebcamActive]);

  const startWebcam = async () => {
    try {
      setError('');
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
        setIsWebcamActive(true);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Unable to access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  const resetSession = () => {
    setRepCount(0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Coach - {exerciseTitle}</span>
          <div className="flex gap-2">
            <Badge variant={isWebcamActive ? 'default' : 'secondary'}>
              {isWebcamActive ? 'Camera On' : 'Camera Off'}
            </Badge>
            <Badge variant={isInitialized ? 'default' : 'outline'}>
              {isInitialized ? 'AI Ready' : 'Loading AI...'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Webcam Feed */}
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
            
            {/* Overlay UI */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                Reps: {repCount}
              </div>
              {poseData.confidence > 0 && (
                <div className={`px-3 py-1 rounded-full text-sm ${
                  poseData.isCorrectForm 
                    ? 'bg-green-500 bg-opacity-75 text-white' 
                    : 'bg-orange-500 bg-opacity-75 text-white'
                }`}>
                  Accuracy: {Math.round(poseData.confidence * 100)}%
                </div>
              )}
            </div>

            {/* Feedback Display */}
            {poseData.feedback && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className={`px-4 py-2 rounded-lg text-center text-white ${
                  poseData.isCorrectForm 
                    ? 'bg-green-600 bg-opacity-90' 
                    : 'bg-blue-600 bg-opacity-90'
                }`}>
                  {poseData.feedback}
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                <div className="text-red-600 text-center p-4">
                  <p className="font-semibold">Camera Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={isWebcamActive ? stopWebcam : startWebcam}
              variant={isWebcamActive ? 'destructive' : 'default'}
              className="flex items-center gap-2"
            >
              {isWebcamActive ? (
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
              onClick={resetSession}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Exercise Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{repCount}</div>
              <div className="text-sm text-gray-600">Reps Completed</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(poseData.confidence * 100)}%
              </div>
              <div className="text-sm text-gray-600">Current Accuracy</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                poseData.isCorrectForm ? 'text-green-600' : 'text-orange-600'
              }`}>
                {poseData.isCorrectForm ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-600">Form Check</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
