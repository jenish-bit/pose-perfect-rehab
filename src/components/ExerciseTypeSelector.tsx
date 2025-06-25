
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Activity, 
  Brain, 
  Hand, 
  Eye, 
  Mic, 
  Heart,
  Zap,
  Users,
  Clock
} from 'lucide-react';

interface ExerciseType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  difficulty: string;
  duration: string;
  category: string;
  features: string[];
}

interface ExerciseTypeSelectorProps {
  onSelect: (type: ExerciseType) => void;
  selectedType?: string;
}

const ExerciseTypeSelector: React.FC<ExerciseTypeSelectorProps> = ({ onSelect, selectedType }) => {
  const exerciseTypes: ExerciseType[] = [
    {
      id: 'strength',
      name: 'Strength Training',
      description: 'Build muscle strength and endurance with targeted resistance exercises',
      icon: Target,
      color: 'bg-red-100 border-red-200 text-red-700',
      difficulty: 'Medium',
      duration: '15-30 min',
      category: 'Physical',
      features: ['Muscle Building', 'Endurance', 'Range of Motion']
    },
    {
      id: 'balance',
      name: 'Balance Training',
      description: 'Improve stability and prevent falls with specialized balance exercises',
      icon: Activity,
      color: 'bg-blue-100 border-blue-200 text-blue-700',
      difficulty: 'Easy',
      duration: '10-20 min',
      category: 'Physical',
      features: ['Fall Prevention', 'Stability', 'Coordination']
    },
    {
      id: 'cognitive',
      name: 'Cognitive Therapy',
      description: 'Enhance mental functions including memory, attention, and problem-solving',
      icon: Brain,
      color: 'bg-purple-100 border-purple-200 text-purple-700',
      difficulty: 'Variable',
      duration: '20-45 min',
      category: 'Cognitive',
      features: ['Memory', 'Attention', 'Problem Solving']
    },
    {
      id: 'hand_dexterity',
      name: 'Hand Dexterity',
      description: 'Fine motor skill development and hand coordination exercises',
      icon: Hand,
      color: 'bg-green-100 border-green-200 text-green-700',
      difficulty: 'Easy',
      duration: '10-15 min',
      category: 'Motor Skills',
      features: ['Fine Motor', 'Grip Strength', 'Coordination']
    },
    {
      id: 'eye_movement',
      name: 'Eye Movement',
      description: 'Visual tracking and eye coordination rehabilitation exercises',
      icon: Eye,
      color: 'bg-yellow-100 border-yellow-200 text-yellow-700',
      difficulty: 'Easy',
      duration: '5-10 min',
      category: 'Visual',
      features: ['Visual Tracking', 'Focus', 'Coordination']
    },
    {
      id: 'speech',
      name: 'Speech Therapy',
      description: 'Improve articulation, fluency, and communication skills',
      icon: Mic,
      color: 'bg-pink-100 border-pink-200 text-pink-700',
      difficulty: 'Medium',
      duration: '20-30 min',
      category: 'Communication',
      features: ['Articulation', 'Fluency', 'Voice Control']
    },
    {
      id: 'gait',
      name: 'Gait Training',
      description: 'Walking pattern improvement and mobility enhancement',
      icon: Activity,
      color: 'bg-indigo-100 border-indigo-200 text-indigo-700',
      difficulty: 'Medium',
      duration: '15-25 min',
      category: 'Mobility',
      features: ['Walking Pattern', 'Mobility', 'Step Length']
    },
    {
      id: 'mirror',
      name: 'Mirror Therapy',
      description: 'Visual feedback therapy using mirror reflections for motor recovery',
      icon: Eye,
      color: 'bg-teal-100 border-teal-200 text-teal-700',
      difficulty: 'Easy',
      duration: '10-20 min',
      category: 'Visual Feedback',
      features: ['Visual Feedback', 'Motor Recovery', 'Brain Plasticity']
    },
    {
      id: 'flexibility',
      name: 'Flexibility',
      description: 'Stretching and range of motion exercises for joint mobility',
      icon: Zap,
      color: 'bg-orange-100 border-orange-200 text-orange-700',
      difficulty: 'Easy',
      duration: '10-15 min',
      category: 'Physical',
      features: ['Stretching', 'Joint Mobility', 'Range of Motion']
    },
    {
      id: 'coordination',
      name: 'Coordination',
      description: 'Multi-limb coordination and complex movement patterns',
      icon: Target,
      color: 'bg-cyan-100 border-cyan-200 text-cyan-700',
      difficulty: 'Hard',
      duration: '15-30 min',
      category: 'Motor Skills',
      features: ['Multi-limb', 'Complex Movements', 'Timing']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Exercise Type</h2>
        <p className="text-gray-600">Select the type of rehabilitation exercise you want to create</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exerciseTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              selectedType === type.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => onSelect(type)}
          >
            <CardContent className="p-6">
              <div className={`inline-flex p-3 rounded-lg mb-4 ${type.color}`}>
                <type.icon className="h-6 w-6" />
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getDifficultyColor(type.difficulty)}>
                    {type.difficulty}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {type.duration}
                  </Badge>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-gray-500 mb-2">{type.category.toUpperCase()}</p>
                  <div className="flex flex-wrap gap-1">
                    {type.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExerciseTypeSelector;
