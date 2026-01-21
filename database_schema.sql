
-- Profiles table to store user progress and role
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  mobile TEXT,
  role TEXT,
  farm_location JSONB,
  progress JSONB,
  preferred_categories TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table for storing diagnostic history
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  type TEXT,
  title TEXT,
  content TEXT,
  audio_base64 TEXT,
  image_url TEXT,
  icon TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);
