
-- First, let's check if we have the new exercises and add them if they don't exist
INSERT INTO public.exercises (title, description, category, difficulty_level, position_type, video_url, thumbnail_url, instructions, target_reps, duration_seconds) 
SELECT * FROM (
  VALUES
  -- Arm & Shoulder Exercises
  ('Shoulder Flexion', 'Gentle forward arm raises to improve shoulder mobility and strength', 'arm', 'beginner', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', ARRAY['Sit upright in a chair with feet flat on floor', 'Keep your arm straight and slowly raise it forward', 'Lift until arm is parallel to the ground', 'Hold for 2 seconds', 'Slowly lower back to starting position'], 10, 300),
  
  ('Arm Circles', 'Small circular movements to improve shoulder range of motion', 'arm', 'beginner', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1594737626795-74b8db7bd6ce?w=400', ARRAY['Extend arms out to your sides', 'Make small circles with your arms', 'Start with forward circles for 10 reps', 'Then reverse to backward circles', 'Keep movements controlled and smooth'], 20, 240),
  
  ('Bicep Curls', 'Strengthening exercise for arm muscles using light weights or resistance', 'arm', 'intermediate', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', ARRAY['Hold light weights or water bottles in hands', 'Keep elbows close to your body', 'Slowly curl weights toward shoulders', 'Squeeze biceps at the top', 'Lower weights slowly to starting position'], 12, 360),
  
  -- Leg & Mobility Exercises
  ('Ankle Pumps', 'Simple ankle movements to improve circulation and mobility', 'leg', 'beginner', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', ARRAY['Sit comfortably with feet flat on floor', 'Lift toes up while keeping heels down', 'Point toes down while lifting heels', 'Alternate between flex and point', 'Feel the stretch in your calves'], 15, 180),
  
  ('Seated Marching', 'Gentle leg movements to strengthen hip flexors and improve coordination', 'leg', 'beginner', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1571019614031-51b6be2d75aa?w=400', ARRAY['Sit tall in chair with good posture', 'Lift one knee up as if marching', 'Lower foot back to floor gently', 'Alternate between left and right legs', 'Keep core engaged throughout'], 20, 300),
  
  -- Balance & Coordination Exercises  
  ('Weight Shifts', 'Controlled movements to improve balance and weight distribution', 'balance', 'beginner', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', ARRAY['Sit upright with feet shoulder-width apart', 'Slowly shift weight to your right side', 'Hold for 3 seconds', 'Return to center position', 'Repeat shifting to left side'], 10, 240),
  
  ('Head Turns', 'Gentle neck movements to improve coordination and reduce stiffness', 'balance', 'beginner', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', ARRAY['Sit with spine straight and shoulders relaxed', 'Slowly turn head to look right', 'Hold for 2 seconds', 'Return to center', 'Turn head to look left and hold'], 8, 180),
  
  -- Core & Posture Exercises
  ('Seated Spinal Twist', 'Gentle twisting motion to improve spinal mobility', 'core', 'beginner', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1594737626795-74b8db7bd6ce?w=400', ARRAY['Sit tall with feet flat on floor', 'Place hands on shoulders', 'Slowly rotate upper body to the right', 'Feel gentle stretch in your spine', 'Return to center and rotate left'], 6, 200),
  
  ('Shoulder Blade Squeezes', 'Strengthen upper back muscles and improve posture', 'core', 'beginner', 'seated', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', ARRAY['Sit upright with arms at your sides', 'Pull shoulder blades together', 'Imagine squeezing a pencil between them', 'Hold squeeze for 3 seconds', 'Release and repeat'], 12, 240)
) AS new_exercises(title, description, category, difficulty_level, position_type, video_url, thumbnail_url, instructions, target_reps, duration_seconds)
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises WHERE exercises.title = new_exercises.title
);

-- Create missing policy for exercises if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'exercises' 
    AND policyname = 'Everyone can view exercises'
  ) THEN
    CREATE POLICY "Everyone can view exercises" 
      ON public.exercises 
      FOR SELECT 
      USING (true);
  END IF;
END $$;

-- Create missing policy for profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END $$;
