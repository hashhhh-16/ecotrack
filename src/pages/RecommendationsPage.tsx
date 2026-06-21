import { useEffect, useState } from 'react';
import { Lightbulb, Check, X, Sparkles, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Recommendation } from '../types';
import { PageHeader, EmptyState, LoadingSpinner, Toast } from '../components/ui';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  transport: { bg: 'bg-primary-50', text: 'text-primary-700', icon: '🚗' },
  energy: { bg: 'bg-accent-50', text: 'text-accent-700', icon: '⚡' },
  food: { bg: 'bg-warning-50', text: 'text-warning-700', icon: '🍽️' },
  waste: { bg: 'bg-danger-50', text: 'text-danger-700', icon: '♻️' },
};

const HABIT_TIPS: { title: string; suggestion: string; category: string }[] = [
  { title: 'Car-dependent travel', suggestion: 'Use public transport twice a week to cut up to 4.2 kg CO₂ per day.', category: 'transport' },
  { title: 'High electricity usage', suggestion: 'Switch to LED bulbs and unplug vampire electronics to save up to 2 kWh/day.', category: 'energy' },
  { title: 'Heavy water use', suggestion: 'Install low-flow fixtures and shorten showers to reduce hot-water energy demand.', category: 'energy' },
  { title: 'High meat consumption', suggestion: 'Introduce one plant-based meal weekly—save up to 5 kg CO₂ per week.', category: 'food' },
  { title: 'Excessive packaging waste', suggestion: 'Use reusable bags, bottles, and containers to cut single-use plastics.', category: 'waste' },
  { title: 'Food waste', suggestion: 'Compost food scraps—diverts up to 30% of household waste from landfill.', category: 'waste' },
];

export function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setRecommendations((data ?? []) as Recommendation[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateStatus = async (id: string, status: 'applied' | 'dismissed') => {
    const { error } = await supabase.from('recommendations').update({ status }).eq('id', id);
    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setRecommendations((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
      setToast({ message: status === 'applied' ? 'Marked as applied. Keep it up!' : 'Dismissed.', type: 'success' });
    }
  };

  if (loading) return <LoadingSpinner label="Loading recommendations…" />;

  const newRecs = recommendations.filter((r) => r.status === 'new');
  const appliedRecs = recommendations.filter((r) => r.status === 'applied');
  const totalPotential = newRecs.reduce((s, r) => s + Number(r.potential_reduction_kg), 0);
  const totalApplied = appliedRecs.reduce((s, r) => s + Number(r.potential_reduction_kg), 0);

  return (
    <div>
      <PageHeader
        title="Personalized Recommendations"
        subtitle="Actionable suggestions based on your habits and impact."
        icon={<Lightbulb className="h-5 w-5" />}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {recommendations.length === 0 ? (
        <>
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="No personalized tips yet"
            description="Log your daily activities using the calculator and we'll generate tailored recommendations to reduce your footprint."
            action={<a href="/calculator" className="btn-primary">Log today's activities</a>}
          />
          <div className="mt-8">
            <h3 className="mb-3 font-display text-lg font-bold text-slate-900">General sustainability tips</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {HABIT_TIPS.map((tip, i) => {
                const cat = CATEGORY_COLORS[tip.category] || CATEGORY_COLORS.energy;
                return (
                  <div key={i} className="card">
                    <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cat.bg} ${cat.text}`}>
                      <span>{cat.icon}</span> {tip.category}
                    </div>
                    <h4 className="font-medium text-slate-800">{tip.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{tip.suggestion}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-slate-900">{totalPotential.toFixed(1)} kg</div>
                  <div className="text-xs text-slate-500">Potential daily CO₂ savings</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-slate-900">{totalApplied.toFixed(1)} kg</div>
                  <div className="text-xs text-slate-500">Already applying — nice work!</div>
                </div>
              </div>
            </div>
          </div>

          {newRecs.length > 0 && (
            <>
              <h3 className="mb-3 font-display text-lg font-bold text-slate-900">New tips ({newRecs.length})</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {newRecs.map((rec) => {
                  const cat = CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.energy;
                  return (
                    <div key={rec.id} className="card animate-slide-up">
                      <div className="mb-2 flex items-center justify-between">
                        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cat.bg} ${cat.text}`}>
                          <span>{cat.icon}</span> {rec.category}
                        </div>
                        <span className="stat-pill bg-primary-50 text-primary-700">−{rec.potential_reduction_kg} kg</span>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-slate-400">Current: {rec.current_habit}</p>
                      </div>
                      <p className="text-sm text-slate-700">{rec.suggestion}</p>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => updateStatus(rec.id, 'applied')} className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-700 active:scale-95">
                          <Check className="mr-1 inline h-3.5 w-3.5" /> I'll do this
                        </button>
                        <button onClick={() => updateStatus(rec.id, 'dismissed')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {appliedRecs.length > 0 && (
            <>
              <h3 className="mt-8 mb-3 font-display text-lg font-bold text-slate-900">Habits you've adopted ({appliedRecs.length})</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {appliedRecs.map((rec) => {
                  const cat = CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.energy;
                  return (
                    <div key={rec.id} className="card flex items-start gap-3 border-primary-100 bg-primary-50/20">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.bg} ${cat.text}`}>
                          {rec.category}
                        </div>
                        <p className="text-sm text-slate-700">{rec.suggestion}</p>
                        <p className="mt-1 text-xs text-primary-600">Saving {rec.potential_reduction_kg} kg CO₂/day</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
