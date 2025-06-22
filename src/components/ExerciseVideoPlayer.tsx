
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

  const togglePlay = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restartVideo = () => {
    if (videoRef) {
      videoRef.currentTime = 0;
      videoRef.play();
      setIsPlaying(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo: {exercise.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
            <video
              ref={setVideoRef}
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
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
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Instructions:</h4>
            <ol className="space-y-2">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
          
          <Button onClick={onStartPractice} className="w-full mt-4">
            Start Practice with AI Coach
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
