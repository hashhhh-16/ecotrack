/*
# EcoTrack - Full Application Schema

## Overview
This migration creates the complete database schema for EcoTrack, a personal carbon footprint tracker.
The app lets users register, log daily activities (transport, electricity, food, waste), calculate
their carbon emissions, receive personalized recommendations, set goals, complete sustainability
challenges, earn points, and participate in a community leaderboard.

## 1. New Tables

### profiles
- `id` (uuid, PK, references auth.users) — one-to-one with the auth user.
- `full_name` (text) — display name.
- `avatar_url` (text) — optional profile picture URL.
- `total_points` (int, default 0) — cumulative points earned from challenges.
- `streak_days` (int, default 0) — current daily-check-in streak.
- `created_at` (timestamptz)

### carbon_records
- `id` (uuid, PK)
- `user_id` (uuid, owner, defaults to auth.uid())
- `record_date` (date) — the day the activity was logged for.
- `transport_mode` (text) — car / bus / train / bike / walk.
- `transport_km` (numeric) — distance traveled that day.
- `electricity_kwh` (numeric) — daily electricity consumption.
- `food_type` (text) — vegetarian / mixed / heavy_meat.
- `waste_kg` (numeric) — daily waste generated.
- `transport_emission` (numeric) — computed kg CO2 for transport.
- `electricity_emission` (numeric) — computed kg CO2 for electricity.
- `food_emission` (numeric) — computed kg CO2 for food.
- `waste_emission` (numeric) — computed kg CO2 for waste.
- `total_emission` (numeric) — sum of all four emissions.
- `created_at` (timestamptz)

### goals
- `id` (uuid, PK)
- `user_id` (uuid, owner)
- `title` (text) — goal name.
- `target_value` (numeric) — target (e.g. monthly kg CO2 reduction).
- `current_value` (numeric, default 0)
- `metric` (text) — emission_kg / kwh / transport_days.
- `deadline` (date)
- `status` (text, default 'active') — active / completed / failed.
- `created_at` (timestamptz)

### challenges
- `id` (uuid, PK)
- `title` (text)
- `description` (text)
- `points` (int) — reward points on completion.
- `category` (text) — transport / energy / food / waste / lifestyle.
- `difficulty` (text) — easy / medium / hard.
- `is_active` (boolean, default true)

### user_challenges
- `id` (uuid, PK)
- `user_id` (uuid, owner)
- `challenge_id` (uuid, FK → challenges)
- `status` (text, default 'pending') — pending / completed.
- `completed_at` (timestamptz, nullable)
- `assigned_date` (date) — the day it was assigned.
- `uniqueness constraint` — one (user_id, challenge_id, assigned_date) combo.

### recommendations
- `id` (uuid, PK)
- `user_id` (uuid, owner)
- `carbon_record_id` (uuid, FK → carbon_records, nullable)
- `category` (text) — transport / energy / food / waste.
- `current_habit` (text)
- `suggestion` (text)
- `potential_reduction_kg` (numeric) — estimated CO2 reduction.
- `status` (text, default 'new') — new / applied / dismissed.
- `created_at` (timestamptz)

### offset_initiatives (predefined)
- `id` (uuid, PK)
- `name` (text)
- `type` (text) — tree_plantation / renewable_energy / ngo.
- `description` (text)
- `co2_offset_per_unit_kg` (numeric) — kg CO2 offset per unit (e.g. per tree).
- `unit_label` (text) — e.g. "tree", "panel", "contribution".
- `partner` (text) — organization name.

### leaderboard_view — created as a SQL view (not a table) for community rankings.

## 2. Security (RLS)
- RLS enabled on every table.
- All user-owned tables (profiles, carbon_records, goals, user_challenges, recommendations) use
  owner-scoped policies (4 per table, one per CRUD verb) filtered by auth.uid() = user_id.
- `challenges` and `offset_initiatives` are public/shared reference data: read for anon+authenticated,
  write restricted (managed by platform, not users) — so only SELECT policies are added.
- `profiles` is keyed by id = auth.uid() and has its own ownership predicate.

## 3. Important Notes
- `user_id` columns default to auth.uid() so frontend inserts that omit user_id succeed.
- `profiles.id` references auth.users(id) ON DELETE CASCADE — deleting the auth user removes the profile.
- user_challenges has a unique constraint to prevent duplicate same-day assignments.
- An index on carbon_records(user_id, record_date) accelerates dashboard queries.
*/

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  total_points integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- CARBON RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS carbon_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  transport_mode text NOT NULL DEFAULT 'car',
  transport_km numeric NOT NULL DEFAULT 0,
  electricity_kwh numeric NOT NULL DEFAULT 0,
  food_type text NOT NULL DEFAULT 'mixed',
  waste_kg numeric NOT NULL DEFAULT 0,
  transport_emission numeric NOT NULL DEFAULT 0,
  electricity_emission numeric NOT NULL DEFAULT 0,
  food_emission numeric NOT NULL DEFAULT 0,
  waste_emission numeric NOT NULL DEFAULT 0,
  total_emission numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE carbon_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_carbon_records" ON carbon_records;
CREATE POLICY "select_own_carbon_records"
  ON carbon_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_carbon_records" ON carbon_records;
CREATE POLICY "insert_own_carbon_records"
  ON carbon_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_carbon_records" ON carbon_records;
CREATE POLICY "update_own_carbon_records"
  ON carbon_records FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_carbon_records" ON carbon_records;
CREATE POLICY "delete_own_carbon_records"
  ON carbon_records FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_carbon_records_user_date
  ON carbon_records(user_id, record_date DESC);

-- ============================================================================
-- GOALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  metric text NOT NULL DEFAULT 'emission_kg',
  deadline date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_goals" ON goals;
CREATE POLICY "select_own_goals"
  ON goals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_goals" ON goals;
CREATE POLICY "insert_own_goals"
  ON goals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_goals" ON goals;
CREATE POLICY "update_own_goals"
  ON goals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_goals" ON goals;
CREATE POLICY "delete_own_goals"
  ON goals FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- CHALLENGES (shared reference data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL DEFAULT 10,
  category text NOT NULL DEFAULT 'lifestyle',
  difficulty text NOT NULL DEFAULT 'easy',
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Public read (anon + authenticated); write is platform-managed (no insert/update/delete policies)
DROP POLICY IF EXISTS "read_challenges" ON challenges;
CREATE POLICY "read_challenges"
  ON challenges FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================================
-- USER CHALLENGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, challenge_id, assigned_date)
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_user_challenges" ON user_challenges;
CREATE POLICY "select_own_user_challenges"
  ON user_challenges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_user_challenges" ON user_challenges;
CREATE POLICY "insert_own_user_challenges"
  ON user_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_user_challenges" ON user_challenges;
CREATE POLICY "update_own_user_challenges"
  ON user_challenges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_user_challenges" ON user_challenges;
CREATE POLICY "delete_own_user_challenges"
  ON user_challenges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  carbon_record_id uuid REFERENCES carbon_records(id) ON DELETE SET NULL,
  category text NOT NULL,
  current_habit text NOT NULL,
  suggestion text NOT NULL,
  potential_reduction_kg numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recommendations" ON recommendations;
CREATE POLICY "select_own_recommendations"
  ON recommendations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_recommendations" ON recommendations;
CREATE POLICY "insert_own_recommendations"
  ON recommendations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_recommendations" ON recommendations;
CREATE POLICY "update_own_recommendations"
  ON recommendations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_recommendations" ON recommendations;
CREATE POLICY "delete_own_recommendations"
  ON recommendations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- OFFSET INITIATIVES (shared reference data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS offset_initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'tree_plantation',
  description text NOT NULL,
  co2_offset_per_unit_kg numeric NOT NULL DEFAULT 0,
  unit_label text NOT NULL DEFAULT 'unit',
  partner text
);

ALTER TABLE offset_initiatives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_offset_initiatives" ON offset_initiatives;
CREATE POLICY "read_offset_initiatives"
  ON offset_initiatives FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================================
-- LEADERBOARD VIEW (community rankings by total_points)
-- ============================================================================
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  p.id AS user_id,
  p.full_name,
  p.avatar_url,
  p.total_points,
  p.streak_days,
  RANK() OVER (ORDER BY p.total_points DESC) AS rank
FROM profiles p
ORDER BY p.total_points DESC;

ALTER VIEW leaderboard_view OWNER TO postgres;
GRANT SELECT ON leaderboard_view TO authenticated;
