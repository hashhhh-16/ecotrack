export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  streak_days: number;
  created_at: string;
}

export interface CarbonRecord {
  id: string;
  user_id: string;
  record_date: string;
  transport_mode: string;
  transport_km: number;
  electricity_kwh: number;
  food_type: string;
  waste_kg: number;
  transport_emission: number;
  electricity_emission: number;
  food_emission: number;
  waste_emission: number;
  total_emission: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_value: number;
  current_value: number;
  metric: string;
  deadline: string;
  status: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  is_active: boolean;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  completed_at: string | null;
  assigned_date: string;
  created_at: string;
  challenge?: Challenge;
}

export interface Recommendation {
  id: string;
  user_id: string;
  carbon_record_id: string | null;
  category: string;
  current_habit: string;
  suggestion: string;
  potential_reduction_kg: number;
  status: string;
  created_at: string;
}

export interface OffsetInitiative {
  id: string;
  name: string;
  type: string;
  description: string;
  co2_offset_per_unit_kg: number;
  unit_label: string;
  partner: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  streak_days: number;
  rank: number;
}
