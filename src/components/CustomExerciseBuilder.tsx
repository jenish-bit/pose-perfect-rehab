import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  Minus, 
  Target, 
  Clock, 
  Repeat, 
  Save,
  Eye,
  Hand,
  Activity,
  Brain
} from 'lucide-react';

interface ExerciseInstruction {
  step: number;
  description: string;
  duration?: number;
  repetitions?: number;
}

interface TargetJoint {
  name: string;
  primaryMovement: string;
  rangeOfMotion: string;
}

const CustomExerciseBuilder: React.FC = () => {
  const { user } = useAuth();
  const [exerciseData, setExerciseData] = useState({
    title: '',
    description: '',
    exerciseType: 'strength',
    difficultyLevel: 1,
    durationSeconds: 60,
    targetReps: 10,
    instructions: [] as ExerciseInstruction[],
    targetJoints: [] as TargetJoint[],
    patientId: ''
  });

  const [currentInstruction, setCurrentInstruction] = useState({
    step: 1,
    description: '',
    duration: 30,
    repetitions: 1
  });

  const [currentJoint, setCurrentJoint] = useState({
    name: '',
    primaryMovement: '',
    rangeOfMotion: ''
  });

  const [previewMode, setPreviewMode] = useState(false);

  const exerciseTypes = [
    { value: 'strength', label: 'Strength Training' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'balance', label: 'Balance' },
    { value: 'coordination', label: 'Coordination' },
    { value: 'cognitive', label: 'Cognitive' },
    { value: 'speech', label: 'Speech Therapy' },
    { value: 'gait', label: 'Gait Training' },
    { value: 'mirror', label: 'Mirror Therapy' },
    { value: 'hand_dexterity', label: 'Hand Dexterity' },
    { value: 'eye_movement', label: 'Eye Movement' }
  ];

  const jointOptions = [
    'Shoulder (Left)', 'Shoulder (Right)',
    'Elbow (Left)', 'Elbow (Right)',
    'Wrist (Left)', 'Wrist (Right)',
    'Hip (Left)', 'Hip (Right)',
    'Knee (Left)', 'Knee (Right)',
    'Ankle (Left)', 'Ankle (Right)',
    'Neck', 'Spine', 'Fingers', 'Toes'
  ];

  const movementTypes = [
    'Flexion', 'Extension', 'Abduction', 'Adduction',
    'Rotation', 'Circumduction', 'Dorsiflexion', 'Plantarflexion'
  ];

  const addInstruction = () => {
    if (!currentInstruction.description.trim()) return;

    setExerciseData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { ...currentInstruction }]
    }));

    setCurrentInstruction(prev => ({
      step: prev.step + 1,
      description: '',
      duration: 30,
      repetitions: 1
    }));
  };

  const removeInstruction = (index: number) => {
    setExerciseData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addTargetJoint = () => {
    if (!currentJoint.name || !currentJoint.primaryMovement) return;

    setExerciseData(prev => ({
      ...prev,
      targetJoints: [...prev.targetJoints, { ...currentJoint }]
    }));

    setCurrentJoint({
      name: '',
      primaryMovement: '',
      rangeOfMotion: ''
    });
  };

  const removeTargetJoint = (index: number) => {
    setExerciseData(prev => ({
      ...prev,
      targetJoints: prev.targetJoints.filter((_, i) => i !== index)
    }));
  };

  const saveExercise = async () => {
    if (!user || !exerciseData.title.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_exercises')
        .insert({
          therapist_id: user.id,
          patient_id: exerciseData.patientId || null,
          title: exerciseData.title,
          description: exerciseData.description,
          instructions: exerciseData.instructions,
          target_joints: exerciseData.targetJoints,
          difficulty_level: exerciseData.difficultyLevel,
          duration_seconds: exerciseData.durationSeconds,
          target_reps: exerciseData.targetReps,
          exercise_type: exerciseData.exerciseType
        });

      if (error) throw error;

      toast.success('Custom exercise created successfully!');
      
      // Reset form
      setExerciseData({
        title: '',
        description: '',
        exerciseType: 'strength',
        difficultyLevel: 1,
        durationSeconds: 60,
        targetReps: 10,
        instructions: [],
        targetJoints: [],
        patientId: ''
      });
      setCurrentInstruction({ step: 1, description: '', duration: 30, repetitions: 1 });
      setCurrentJoint({ name: '', primaryMovement: '', rangeOfMotion: '' });

    } catch (error) {
      console.error('Error saving custom exercise:', error);
      toast.error('Failed to save exercise');
    }
  };

  const generateExerciseTemplate = (type: string) => {
    const templates = {
      strength: {
        title: 'Strength Training Exercise',
        description: 'Build muscle strength and endurance',
        instructions: [
          { step: 1, description: 'Warm up with gentle movements', duration: 30, repetitions: 1 },
          { step: 2, description: 'Perform the main exercise movement', duration: 60, repetitions: 10 },
          { step: 3, description: 'Cool down with stretching', duration: 30, repetitions: 1 }
        ]
      },
      balance: {
        title: 'Balance Training Exercise',
        description: 'Improve stability and prevent falls',
        instructions: [
          { step: 1, description: 'Stand with feet hip-width apart', duration: 10, repetitions: 1 },
          { step: 2, description: 'Maintain balance while moving', duration: 120, repetitions: 5 },
          { step: 3, description: 'Return to starting position', duration: 10, repetitions: 1 }
        ]
      },
      mirror: {
        title: 'Mirror Therapy Exercise',
        description: 'Use visual feedback to improve motor function',
        instructions: [
          { step: 1, description: 'Position mirror to reflect unaffected limb', duration: 30, repetitions: 1 },
          { step: 2, description: 'Perform movements with unaffected side', duration: 180, repetitions: 15 },
          { step: 3, description: 'Focus on mirror reflection', duration: 60, repetitions: 1 }
        ]
      }
    };

    const template = templates[type as keyof typeof templates];
    if (template) {
      setExerciseData(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
        instructions: template.instructions
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Exercise Builder</h1>
          <p className="text-gray-600 mt-2">Create personalized rehabilitation exercises for your patients</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={saveExercise} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Exercise
          </Button>
        </div>
      </div>

      {previewMode ? (
        // Preview Mode
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Exercise Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{exerciseData.title}</h2>
              <p className="text-gray-600 mb-4">{exerciseData.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  {exerciseTypes.find(t => t.value === exerciseData.exerciseType)?.label}
                </Badge>
                <Badge variant="outline">
                  Level {exerciseData.difficultyLevel}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {exerciseData.durationSeconds}s
                </Badge>
                <Badge variant="outline">
                  <Repeat className="h-3 w-3 mr-1" />
                  {exerciseData.targetReps} reps
                </Badge>
              </div>
            </div>

            {exerciseData.instructions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                <div className="space-y-3">
                  {exerciseData.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {instruction.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{instruction.description}</p>
                        <div className="flex gap-4 mt-1">
                          {instruction.duration && (
                            <span className="text-xs text-gray-500">
                              Duration: {instruction.duration}s
                            </span>
                          )}
                          {instruction.repetitions && (
                            <span className="text-xs text-gray-500">
                              Reps: {instruction.repetitions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {exerciseData.targetJoints.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Target Joints</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exerciseData.targetJoints.map((joint, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{joint.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Movement: {joint.primaryMovement}
                      </div>
                      {joint.rangeOfMotion && (
                        <div className="text-xs text-gray-600">
                          ROM: {joint.rangeOfMotion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Edit Mode
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="joints">Target Joints</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Exercise Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Exercise Title *</Label>
                    <Input
                      id="title"
                      value={exerciseData.title}
                      onChange={(e) => setExerciseData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter exercise title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="exerciseType">Exercise Type</Label>
                    <Select 
                      value={exerciseData.exerciseType} 
                      onValueChange={(value) => setExerciseData(prev => ({ ...prev, exerciseType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={exerciseData.description}
                    onChange={(e) => setExerciseData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the exercise purpose and benefits"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select 
                      value={exerciseData.difficultyLevel.toString()} 
                      onValueChange={(value) => setExerciseData(prev => ({ ...prev, difficultyLevel: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            Level {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={exerciseData.durationSeconds}
                      onChange={(e) => setExerciseData(prev => ({ ...prev, durationSeconds: parseInt(e.target.value) || 60 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reps">Target Repetitions</Label>
                    <Input
                      id="reps"
                      type="number"
                      value={exerciseData.targetReps}
                      onChange={(e) => setExerciseData(prev => ({ ...prev, targetReps: parseInt(e.target.value) || 10 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="patientId">Assign to Patient (Optional)</Label>
                  <Input
                    id="patientId"
                    value={exerciseData.patientId}
                    onChange={(e) => setExerciseData(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Enter patient ID or leave blank for general use"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Instruction */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Add New Instruction</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="stepDescription">Step Description</Label>
                      <Textarea
                        id="stepDescription"
                        value={currentInstruction.description}
                        onChange={(e) => setCurrentInstruction(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this step in detail"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stepDuration">Duration (seconds)</Label>
                        <Input
                          id="stepDuration"
                          type="number"
                          value={currentInstruction.duration}
                          onChange={(e) => setCurrentInstruction(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stepReps">Repetitions</Label>
                        <Input
                          id="stepReps"
                          type="number"
                          value={currentInstruction.repetitions}
                          onChange={(e) => setCurrentInstruction(prev => ({ ...prev, repetitions: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={addInstruction} disabled={!currentInstruction.description.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {/* Existing Instructions */}
                {exerciseData.instructions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Current Instructions</h3>
                    <div className="space-y-3">
                      {exerciseData.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {instruction.step}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{instruction.description}</p>
                            <div className="flex gap-4 mt-1">
                              <span className="text-xs text-gray-500">
                                Duration: {instruction.duration}s
                              </span>
                              <span className="text-xs text-gray-500">
                                Reps: {instruction.repetitions}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeInstruction(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="joints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Target Joints & Movements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Joint */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Add Target Joint</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="jointName">Joint</Label>
                      <Select 
                        value={currentJoint.name} 
                        onValueChange={(value) => setCurrentJoint(prev => ({ ...prev, name: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select joint" />
                        </SelectTrigger>
                        <SelectContent>
                          {jointOptions.map(joint => (
                            <SelectItem key={joint} value={joint}>
                              {joint}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="movement">Primary Movement</Label>
                      <Select 
                        value={currentJoint.primaryMovement} 
                        onValueChange={(value) => setCurrentJoint(prev => ({ ...prev, primaryMovement: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select movement" />
                        </SelectTrigger>
                        <SelectContent>
                          {movementTypes.map(movement => (
                            <SelectItem key={movement} value={movement}>
                              {movement}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rom">Range of Motion</Label>
                      <Input
                        id="rom"
                        value={currentJoint.rangeOfMotion}
                        onChange={(e) => setCurrentJoint(prev => ({ ...prev, rangeOfMotion: e.target.value }))}
                        placeholder="e.g., 0-90 degrees"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={addTargetJoint} 
                    disabled={!currentJoint.name || !currentJoint.primaryMovement}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Joint
                  </Button>
                </div>

                {/* Existing Joints */}
                {exerciseData.targetJoints.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Target Joints</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exerciseData.targetJoints.map((joint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div>
                            <div className="font-medium text-sm">{joint.name}</div>
                            <div className="text-xs text-gray-600">
                              {joint.primaryMovement}
                              {joint.rangeOfMotion && ` • ${joint.rangeOfMotion}`}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTargetJoint(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Templates</CardTitle>
                <p className="text-sm text-gray-600">
                  Start with a pre-built template and customize as needed
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {exerciseTypes.filter(type => ['strength', 'balance', 'mirror', 'gait', 'speech'].includes(type.value)).map(type => (
                    <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {type.value === 'strength' && <Target className="h-5 w-5 text-blue-600" />}
                          {type.value === 'balance' && <Activity className="h-5 w-5 text-green-600" />}
                          {type.value === 'mirror' && <Eye className="h-5 w-5 text-purple-600" />}
                          {type.value === 'gait' && <Activity className="h-5 w-5 text-orange-600" />}
                          {type.value === 'speech' && <Brain className="h-5 w-5 text-red-600" />}
                          <h3 className="font-semibold">{type.label}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {type.value === 'strength' && 'Build muscle strength and endurance'}
                          {type.value === 'balance' && 'Improve stability and prevent falls'}
                          {type.value === 'mirror' && 'Use visual feedback for motor recovery'}
                          {type.value === 'gait' && 'Improve walking patterns and mobility'}
                          {type.value === 'speech' && 'Enhance speech and communication skills'}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => generateExerciseTemplate(type.value)}
                          className="w-full"
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CustomExerciseBuilder;
