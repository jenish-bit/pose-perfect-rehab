
-- Create table for detailed movement analysis
CREATE TABLE public.movement_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.exercise_sessions(id) NOT NULL,
  user_id UUID NOT NULL,
  joint_angles JSONB NOT NULL DEFAULT '{}',
  range_of_motion JSONB NOT NULL DEFAULT '{}',
  movement_quality_score NUMERIC(3,2) DEFAULT 0,
  fatigue_level INTEGER DEFAULT 0,
  pain_indicators JSONB DEFAULT '{}',
  balance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for exercise progression tracking
CREATE TABLE public.exercise_progression (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  current_difficulty_level INTEGER DEFAULT 1,
  target_reps INTEGER DEFAULT 10,
  target_duration INTEGER DEFAULT 30,
  progression_rate NUMERIC(3,2) DEFAULT 1.0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for custom exercises created by therapists
CREATE TABLE public.custom_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  patient_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  instructions JSONB NOT NULL DEFAULT '[]',
  target_joints JSONB NOT NULL DEFAULT '[]',
  difficulty_level INTEGER DEFAULT 1,
  duration_seconds INTEGER DEFAULT 60,
  target_reps INTEGER DEFAULT 10,
  exercise_type TEXT DEFAULT 'custom',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI assessment results
CREATE TABLE public.ai_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.exercise_sessions(id),
  assessment_type TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for gait analysis
CREATE TABLE public.gait_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.exercise_sessions(id),
  step_length NUMERIC(5,2),
  step_width NUMERIC(5,2),
  walking_speed NUMERIC(5,2),
  symmetry_score NUMERIC(3,2),
  balance_score NUMERIC(3,2),
  analysis_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for speech therapy sessions
CREATE TABLE public.speech_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL,
  audio_url TEXT,
  transcription TEXT,
  speech_clarity_score NUMERIC(3,2),
  pronunciation_score NUMERIC(3,2),
  fluency_score NUMERIC(3,2),
  analysis_results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for all new tables
ALTER TABLE public.movement_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gait_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for movement_analysis
CREATE POLICY "Users can view their own movement analysis" 
  ON public.movement_analysis FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own movement analysis" 
  ON public.movement_analysis FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for exercise_progression
CREATE POLICY "Users can view their own exercise progression" 
  ON public.exercise_progression FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own exercise progression" 
  ON public.exercise_progression FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for custom_exercises
CREATE POLICY "Users can view custom exercises assigned to them" 
  ON public.custom_exercises FOR SELECT 
  USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

CREATE POLICY "Therapists can create custom exercises" 
  ON public.custom_exercises FOR INSERT 
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their custom exercises" 
  ON public.custom_exercises FOR UPDATE 
  USING (auth.uid() = therapist_id);

-- RLS policies for ai_assessments
CREATE POLICY "Users can view their own AI assessments" 
  ON public.ai_assessments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI assessments" 
  ON public.ai_assessments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for gait_analysis
CREATE POLICY "Users can view their own gait analysis" 
  ON public.gait_analysis FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gait analysis" 
  ON public.gait_analysis FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for speech_sessions
CREATE POLICY "Users can view their own speech sessions" 
  ON public.speech_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own speech sessions" 
  ON public.speech_sessions FOR ALL 
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_movement_analysis_user_id ON public.movement_analysis(user_id);
CREATE INDEX idx_movement_analysis_session_id ON public.movement_analysis(session_id);
CREATE INDEX idx_exercise_progression_user_id ON public.exercise_progression(user_id);
CREATE INDEX idx_custom_exercises_patient_id ON public.custom_exercises(patient_id);
CREATE INDEX idx_ai_assessments_user_id ON public.ai_assessments(user_id);
CREATE INDEX idx_gait_analysis_user_id ON public.gait_analysis(user_id);
CREATE INDEX idx_speech_sessions_user_id ON public.speech_sessions(user_id);
