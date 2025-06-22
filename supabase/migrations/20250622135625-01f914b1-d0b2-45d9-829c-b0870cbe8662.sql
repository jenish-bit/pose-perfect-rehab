
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  severity_level TEXT CHECK (severity_level IN ('mild', 'moderate', 'severe')),
  recovery_goals TEXT[], -- Array of goals like ['arm', 'leg', 'balance', 'core']
  hand_dominance TEXT CHECK (hand_dominance IN ('left', 'right')),
  medical_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('arm', 'leg', 'balance', 'core')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  position_type TEXT CHECK (position_type IN ('seated', 'standing', 'assisted')),
  video_url TEXT,
  thumbnail_url TEXT,
  instructions TEXT[],
  target_reps INTEGER DEFAULT 10,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user exercise sessions table
CREATE TABLE public.exercise_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id UUID REFERENCES public.exercises NOT NULL,
  reps_completed INTEGER DEFAULT 0,
  accuracy_score DECIMAL(3,2), -- Score from 0.00 to 1.00
  feedback_notes TEXT,
  session_duration INTEGER, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly plans table
CREATE TABLE public.weekly_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  week_start_date DATE NOT NULL,
  exercises JSONB, -- Store daily exercise plan as JSON
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Exercises policies (public read access)
CREATE POLICY "Anyone can view exercises" 
  ON public.exercises FOR SELECT 
  TO authenticated
  USING (true);

-- Exercise sessions policies
CREATE POLICY "Users can view their own sessions" 
  ON public.exercise_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.exercise_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Weekly plans policies
CREATE POLICY "Users can view their own plans" 
  ON public.weekly_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" 
  ON public.weekly_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
  ON public.weekly_plans FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert sample exercises with video demonstrations
INSERT INTO public.exercises (title, description, category, difficulty_level, position_type, video_url, thumbnail_url, instructions, target_reps, duration_seconds) VALUES
-- Arm exercises
('Shoulder Flexion', 'Raise your arm forward to shoulder height', 'arm', 'beginner', 'seated', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', ARRAY['Sit up straight in chair', 'Keep affected arm relaxed at side', 'Slowly raise arm forward to shoulder height', 'Hold for 3 seconds', 'Lower arm slowly'], 10, 180),

('Arm Circles', 'Small circular movements to improve range of motion', 'arm', 'beginner', 'seated', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', ARRAY['Sit comfortably with back straight', 'Extend arms out to sides', 'Make small circles forward', 'Reverse direction after 10 circles'], 20, 240),

('Bicep Curls', 'Strengthen arm muscles with light weights', 'arm', 'intermediate', 'seated', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400', ARRAY['Hold light weight or water bottle', 'Keep elbow at side', 'Slowly curl weight toward shoulder', 'Lower with control'], 12, 200),

-- Leg exercises  
('Ankle Pumps', 'Move your foot up and down to improve circulation', 'leg', 'beginner', 'seated', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', ARRAY['Sit with feet flat on floor', 'Lift toes up while keeping heel down', 'Point toes down', 'Repeat smooth motion'], 15, 120),

('Marching in Place', 'Lift knees alternately to strengthen legs', 'leg', 'intermediate', 'seated', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', ARRAY['Sit tall in chair', 'Lift right knee up', 'Lower and lift left knee', 'Keep steady rhythm'], 20, 300),

-- Balance exercises
('Weight Shifts', 'Shift weight from side to side', 'balance', 'beginner', 'standing', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', ARRAY['Stand with feet hip-width apart', 'Hold onto stable surface', 'Shift weight to right foot', 'Shift weight to left foot', 'Keep movements controlled'], 10, 180),

('Single Leg Stand', 'Stand on one foot to improve balance', 'balance', 'intermediate', 'standing', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', ARRAY['Stand near wall for support', 'Lift one foot slightly off ground', 'Hold position', 'Switch to other foot'], 5, 150),

-- Core exercises
('Seated Twists', 'Rotate torso to strengthen core', 'core', 'beginner', 'seated', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400', ARRAY['Sit straight with arms crossed', 'Slowly rotate to the right', 'Return to center', 'Rotate to the left'], 10, 120),

('Deep Breathing', 'Strengthen diaphragm and core muscles', 'core', 'beginner', 'seated', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', ARRAY['Sit comfortably with good posture', 'Place hand on chest, hand on belly', 'Breathe in slowly through nose', 'Exhale slowly through mouth'], 8, 240);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
