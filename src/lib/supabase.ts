import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Emission factors in kg CO2 per unit
export const EMISSION_FACTORS = {
  transport: {
    car: 0.21,
    bus: 0.08,
    train: 0.04,
    bike: 0,
    walk: 0,
  },
  electricity: 0.82, // kg CO2 per kWh
  food: {
    vegetarian: 2,
    mixed: 4,
    heavy_meat: 7,
  },
  waste: 0.5, // kg CO2 per kg of waste
} as const;

export type TransportMode = keyof typeof EMISSION_FACTORS.transport;
export type FoodType = keyof typeof EMISSION_FACTORS.food;

export function calculateTransportEmission(km: number, mode: TransportMode): number {
  return Math.round(km * EMISSION_FACTORS.transport[mode] * 100) / 100;
}

export function calculateElectricityEmission(kwh: number): number {
  return Math.round(kwh * EMISSION_FACTORS.electricity * 100) / 100;
}

export function calculateFoodEmission(type: FoodType): number {
  return EMISSION_FACTORS.food[type];
}

export function calculateWasteEmission(kg: number): number {
  return Math.round(kg * EMISSION_FACTORS.waste * 100) / 100;
}
