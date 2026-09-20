-- Add extended profile fields to athlete_profiles
ALTER TABLE athlete_profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS sport_type TEXT,
ADD COLUMN IF NOT EXISTS upcoming_event TEXT,
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS available_body_parts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS photo_url TEXT;
