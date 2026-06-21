import { Car, Bus, Train, Bike, Footprints } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  calculateTransportEmission,
  calculateElectricityEmission,
  calculateFoodEmission,
  calculateWasteEmission,
  type TransportMode,
  type FoodType,
} from './supabase';

export interface CalculatorInput {
  transportMode: TransportMode;
  transportKm: number;
  electricityKwh: number;
  foodType: FoodType;
  wasteKg: number;
}

export interface EmissionResult {
  transport: number;
  electricity: number;
  food: number;
  waste: number;
  total: number;
}

export const TRANSPORT_OPTIONS: { value: TransportMode; label: string; icon: ReactNode }[] = [
  { value: 'car', label: 'Car', icon: <Car className="h-5 w-5" /> },
  { value: 'bus', label: 'Bus', icon: <Bus className="h-5 w-5" /> },
  { value: 'train', label: 'Train', icon: <Train className="h-5 w-5" /> },
  { value: 'bike', label: 'Bike', icon: <Bike className="h-5 w-5" /> },
  { value: 'walk', label: 'Walk', icon: <Footprints className="h-5 w-5" /> },
];

export const FOOD_OPTIONS: { value: FoodType; label: string; emission: number }[] = [
  { value: 'vegetarian', label: 'Vegetarian', emission: 2 },
  { value: 'mixed', label: 'Mixed diet', emission: 4 },
  { value: 'heavy_meat', label: 'Heavy meat', emission: 7 },
];

export function calculateEmissions(input: CalculatorInput): EmissionResult {
  const transport = calculateTransportEmission(input.transportKm, input.transportMode);
  const electricity = calculateElectricityEmission(input.electricityKwh);
  const food = calculateFoodEmission(input.foodType);
  const waste = calculateWasteEmission(input.wasteKg);
  return {
    transport,
    electricity,
    food,
    waste,
    total: Math.round((transport + electricity + food + waste) * 100) / 100,
  };
}

export interface RecommendationRule {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'waste';
  currentHabit: string;
  suggestion: string;
  potentialReductionKg: number;
}

export function generateRecommendations(input: CalculatorInput): RecommendationRule[] {
  const recs: RecommendationRule[] = [];

  // Transport
  if (input.transportMode === 'car' && input.transportKm > 20) {
    recs.push({
      id: 'transport-1',
      category: 'transport',
      currentHabit: `${input.transportKm} km/day by car`,
      suggestion: 'Switch to public transport twice a week to save up to 4.2 kg CO₂ per day you switch.',
      potentialReductionKg: 4.2,
    });
  }
  if (input.transportMode === 'car' && input.transportKm > 10 && input.transportKm <= 20) {
    recs.push({
      id: 'transport-2',
      category: 'transport',
      currentHabit: `${input.transportKm} km/day by car`,
      suggestion: 'Try carpooling or combining trips to cut your daily driving distance in half.',
      potentialReductionKg: 1.5,
    });
  }
  if (input.transportMode === 'car' && input.transportKm > 0) {
    recs.push({
      id: 'transport-3',
      category: 'transport',
      currentHabit: 'Car-dependent travel',
      suggestion: 'Walk or bike for trips under 2km—each trip saves about 0.4 kg CO₂.',
      potentialReductionKg: 0.8,
    });
  }

  // Electricity
  if (input.electricityKwh > 15) {
    recs.push({
      id: 'energy-1',
      category: 'energy',
      currentHabit: `${input.electricityKwh} kWh/day electricity`,
      suggestion: 'Replace old bulbs with LEDs and unplug idle electronics to cut usage by 20%.',
      potentialReductionKg: 2.5,
    });
  }
  if (input.electricityKwh > 10) {
    recs.push({
      id: 'energy-2',
      category: 'energy',
      currentHabit: 'High electricity consumption',
      suggestion: 'Use cold water for laundry and air-dry clothes to save up to 2 kWh per day.',
      potentialReductionKg: 1.6,
    });
  }

  // Food
  if (input.foodType === 'heavy_meat') {
    recs.push({
      id: 'food-1',
      category: 'food',
      currentHabit: 'Heavy-meat diet',
      suggestion: 'Introduce one plant-based meal per week—save up to 5 kg CO₂ weekly.',
      potentialReductionKg: 0.7,
    });
  }
  if (input.foodType === 'mixed') {
    recs.push({
      id: 'food-2',
      category: 'food',
      currentHabit: 'Mixed diet',
      suggestion: 'Skip beef twice a week—beef has up to 6x the emissions of poultry.',
      potentialReductionKg: 0.5,
    });
  }

  // Waste
  if (input.wasteKg > 1.5) {
    recs.push({
      id: 'waste-1',
      category: 'waste',
      currentHabit: `${input.wasteKg} kg waste/day`,
      suggestion: 'Start composting food scraps to divert up to 30% of household waste from landfill.',
      potentialReductionKg: 0.4,
    });
  }
  if (input.wasteKg > 1) {
    recs.push({
      id: 'waste-2',
      category: 'waste',
      currentHabit: 'Significant daily waste',
      suggestion: 'Switch to reusable bags, bottles, and containers to cut single-use plastics.',
      potentialReductionKg: 0.2,
    });
  }

  return recs;
}
