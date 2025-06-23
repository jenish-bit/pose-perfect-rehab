
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  video_url: string;
  instructions: string[];
}

interface ExerciseVideoPlayerProps {
  exercise: Exercise;
  onStartPractice: () => void;
}

export const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = ({ exercise, onStartPractice }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play().catch(() => {
          console.log('Video playback failed, showing demo content instead');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restartVideo = () => {
    if (videoRef) {
      videoRef.currentTime = 0;
      videoRef.play().catch(() => {
        console.log('Video restart failed');
      });
      setIsPlaying(true);
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    console.log('Video failed to load, showing demo animation instead');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo: {exercise.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg aspect-video overflow-hidden">
            {!hasError ? (
              <>
                <video
                  ref={setVideoRef}
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={handleVideoError}
                  muted
                  loop
                >
                  <source src={exercise.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button onClick={togglePlay} size="sm" className="bg-white text-black hover:bg-gray-100">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button onClick={restartVideo} size="sm" variant="outline" className="bg-white text-black hover:bg-gray-100">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{exercise.title}</h3>
                  <p className="text-sm text-gray-600">Demo Animation</p>
                  <div className="mt-4 space-y-2">
                    <div className="w-full bg-blue-200 rounded-full h-2 animate-pulse"></div>
                    <div className="w-3/4 bg-green-200 rounded-full h-2 animate-pulse delay-100 mx-auto"></div>
                    <div className="w-1/2 bg-purple-200 rounded-full h-2 animate-pulse delay-200 mx-auto"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Step-by-Step Instructions:</h4>
            <ol className="space-y-2">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <Button onClick={onStartPractice} className="w-full mt-4 bg-green-600 hover:bg-green-700">
            <Play className="h-4 w-4 mr-2" />
            Start Practice with AI Coach
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
