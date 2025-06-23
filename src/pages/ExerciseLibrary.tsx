
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Play, Clock, Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  position_type: string;
  video_url: string;
  thumbnail_url: string;
  instructions: string[];
  target_reps: number;
  duration_seconds: number;
}

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedCategory, selectedDifficulty]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      console.log('Fetched exercises:', data?.length);
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty_level === selectedDifficulty);
    }

    setFilteredExercises(filtered);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'arm': return 'bg-blue-100 text-blue-700';
      case 'leg': return 'bg-green-100 text-green-700';
      case 'balance': return 'bg-purple-100 text-purple-700';
      case 'core': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startExercise = (exerciseId: string) => {
    navigate(`/exercise-session?exerciseId=${exerciseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SR</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Exercise Library</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600">
                  Welcome, {user.email}
                </span>
              )}
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Exercise Library</h1>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="arm">Arm & Shoulder</SelectItem>
                <SelectItem value="leg">Leg & Mobility</SelectItem>
                <SelectItem value="balance">Balance & Coordination</SelectItem>
                <SelectItem value="core">Core & Posture</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {['arm', 'leg', 'balance', 'core'].map((category) => {
              const count = exercises.filter(ex => ex.category === category).length;
              const categoryNames = {
                arm: 'Arm & Shoulder',
                leg: 'Leg & Mobility', 
                balance: 'Balance & Coordination',
                core: 'Core & Posture'
              };
              return (
                <div key={category} className="p-4 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{categoryNames[category as keyof typeof categoryNames]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={exercise.thumbnail_url}
                  alt={exercise.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
                  <Button 
                    size="sm" 
                    className="bg-white text-black hover:bg-gray-100"
                    onClick={() => startExercise(exercise.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Exercise
                  </Button>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{exercise.title}</CardTitle>
                  <div className="flex gap-1 flex-wrap">
                    <Badge className={getCategoryColor(exercise.category)}>
                      {exercise.category}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(exercise.difficulty_level)}>
                      {exercise.difficulty_level}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {exercise.target_reps} reps
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.floor(exercise.duration_seconds / 60)}m {exercise.duration_seconds % 60}s
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-sm">Instructions:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {exercise.instructions.slice(0, 3).map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">{index + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                    {exercise.instructions.length > 3 && (
                      <li className="text-gray-500 italic">
                        +{exercise.instructions.length - 3} more steps...
                      </li>
                    )}
                  </ul>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => startExercise(exercise.id)}
                >
                  Start with AI Coach
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No exercises found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
