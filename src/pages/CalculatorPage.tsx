import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator as CalculatorIcon, Save, Sparkles, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PageHeader, LoadingSpinner, Toast } from '../components/ui';
import { DonutChart } from '../components/Charts';
import { TRANSPORT_OPTIONS, FOOD_OPTIONS, calculateEmissions, generateRecommendations } from '../lib/carbon';

const SLICE_COLORS: Record<string, string> = {
  transport: '#16a34a',
  electricity: '#06b6d4',
  food: '#eab308',
  waste: '#ef4444',
};

export function CalculatorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transportMode, setTransportMode] =
  useState<(typeof TRANSPORT_OPTIONS)[number]['value']>('car');
  const [transportKm, setTransportKm] = useState(10);
  const [electricityKwh, setElectricityKwh] = useState(8);
  const [foodType, setFoodType] =
  useState<(typeof FOOD_OPTIONS)[number]['value']>('mixed');  const [wasteKg, setWasteKg] = useState(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const input = useMemo(
    () => ({ transportMode, transportKm, electricityKwh, foodType, wasteKg }),
    [transportMode, transportKm, electricityKwh, foodType, wasteKg]
  );

  const result = useMemo(() => calculateEmissions(input), [input]);
  const recommendations = useMemo(() => generateRecommendations(input), [input]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('carbon_records')
      .select('id')
      .eq('user_id', user.id)
      .eq('record_date', today)
      .maybeSingle();

    const payload = {
      user_id: user.id,
      record_date: today,
      transport_mode: transportMode,
      transport_km: transportKm,
      electricity_kwh: electricityKwh,
      food_type: foodType,
      waste_kg: wasteKg,
      transport_emission: result.transport,
      electricity_emission: result.electricity,
      food_emission: result.food,
      waste_emission: result.waste,
      total_emission: result.total,
    };

    let error: { message: string } | null = null;
    if (existing?.id) {
      ({ error } = await supabase.from('carbon_records').update(payload).eq('id', existing.id));
    } else {
      const { data: inserted } = await supabase.from('carbon_records').insert(payload).select().maybeSingle();
      if (inserted) {
        // Generate recommendations tied to this record
        const recPayload = recommendations.map((r) => ({
          user_id: user.id,
          carbon_record_id: inserted.id,
          category: r.category,
          current_habit: r.currentHabit,
          suggestion: r.suggestion,
          potential_reduction_kg: r.potentialReductionKg,
          status: 'new',
        }));
        if (recPayload.length) {
          await supabase.from('recommendations').insert(recPayload);
        }
      }
    }

    setSaving(false);
    if (error) {
      setToast({ message: `Error: ${error.message}`, type: 'error' });
    } else {
      setToast({ message: 'Saved successfully! View it on your dashboard.', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1200);
    }
  };

  return (
    <div>
      <PageHeader
        title="Carbon Calculator"
        subtitle="Log today's activities to calculate your carbon footprint."
        icon={<CalculatorIcon className="h-5 w-5" />}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input form */}
        <div className="lg:col-span-3">
          <div className="card">
            <h3 className="mb-5 font-display text-lg font-bold text-slate-900">Today's activities</h3>

            <div className="space-y-6">
              {/* Transport mode */}
              <div>
                <label className="label-text">Mode of transport</label>
                <div className="grid grid-cols-5 gap-2">
                  {TRANSPORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTransportMode(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                        transportMode === opt.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport km */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="label-text mb-0">Daily travel distance</label>
                  <span className="font-display text-sm font-bold text-primary-600">{transportKm} km</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={transportKm}
                  onChange={(e) => setTransportKm(Number(e.target.value))}
                  className="mt-2 w-full accent-primary-600"
                />
              </div>

              {/* Electricity */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="label-text mb-0">Electricity consumption</label>
                  <span className="font-display text-sm font-bold text-accent-600">{electricityKwh} kWh</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={electricityKwh}
                  onChange={(e) => setElectricityKwh(Number(e.target.value))}
                  className="mt-2 w-full accent-accent-600"
                />
              </div>

              {/* Food */}
              <div>
                <label className="label-text">Food habits</label>
                <div className="grid grid-cols-3 gap-2">
                  {FOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFoodType(opt.value)}
                      className={`rounded-xl border p-3 text-sm font-medium transition-all ${
                        foodType === opt.value
                          ? 'border-warning-500 bg-warning-50 text-warning-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                      <span className="mt-0.5 block text-xs font-normal text-slate-400">{opt.emission} kg/day</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Waste */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="label-text mb-0">Daily waste generated</label>
                  <span className="font-display text-sm font-bold text-danger-600">{wasteKg} kg</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={wasteKg}
                  onChange={(e) => setWasteKg(Number(e.target.value))}
                  className="mt-2 w-full accent-danger-500"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <LoadingSpinner /> : (<><Save className="h-4 w-4" /> Save today's footprint</>)}
              </button>
              <button
                onClick={() => { setTransportKm(10); setElectricityKwh(8); setFoodType('mixed'); setWasteKg(1); setTransportMode('car'); }}
                className="btn-secondary"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          <div className="card sticky top-20">
            <h3 className="mb-4 font-display text-lg font-bold text-slate-900">Your footprint today</h3>

            <div className="flex justify-center">
              <DonutChart
                data={[
                  { label: 'Transport', value: result.transport, color: SLICE_COLORS.transport },
                  { label: 'Electricity', value: result.electricity, color: SLICE_COLORS.electricity },
                  { label: 'Food', value: result.food, color: SLICE_COLORS.food },
                  { label: 'Waste', value: result.waste, color: SLICE_COLORS.waste },
                ]}
                centerValue={`${result.total}`}
                centerLabel="kg CO₂"
              />
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-medium text-slate-600">Monthly estimate</span>
                <span className="font-display font-bold text-slate-900">{Math.round(result.total * 30)} kg CO₂</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2.5 text-sm">
                <span className="font-medium text-primary-700">Annual estimate</span>
                <span className="font-display font-bold text-primary-800">{Math.round(result.total * 365)} kg CO₂</span>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                  <Sparkles className="h-4 w-4" />
                  {recommendations.length} tip{recommendations.length !== 1 ? 's' : ''} ready for you
                </div>
                <p className="text-xs text-primary-600">
                  Save your footprint to generate {recommendations.reduce((s, r) => s + r.potentialReductionKg, 0).toFixed(1)} kg of daily CO₂ reductions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
