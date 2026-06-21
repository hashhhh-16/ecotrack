import { useEffect, useState } from 'react';
import { Target, Plus, Trash2, CheckCircle2, Calendar, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Goal, CarbonRecord } from '../types';
import { PageHeader, EmptyState, LoadingSpinner, Toast } from '../components/ui';

const METRIC_OPTIONS = [
  { value: 'emission_kg', label: 'Reduce emissions (kg CO₂)', unit: 'kg CO₂' },
  { value: 'kwh', label: 'Reduce electricity (kWh)', unit: 'kWh' },
  { value: 'transport_days', label: 'Use public transport (days)', unit: 'days' },
  { value: 'meatless_meals', label: 'Plant-based meals', unit: 'meals' },
];

export function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [records, setRecords] = useState<CarbonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState(20);
  const [metric, setMetric] = useState('emission_kg');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  const loadData = async () => {
    if (!user) return;
    const [goalsRes, recordsRes] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('carbon_records').select('*').eq('user_id', user.id).order('record_date', { ascending: true }),
    ]);
    setGoals((goalsRes.data ?? []) as Goal[]);
    setRecords((recordsRes.data ?? []) as CarbonRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-compute progress for emission goals
  const computeProgress = (goal: Goal): number => {
    if (goal.metric === 'emission_kg') {
      const createdAt = new Date(goal.created_at);
      const recent = records.filter((r) => new Date(r.record_date) >= createdAt);
      if (recent.length === 0) return 0;
      const avg = recent.reduce((s, r) => s + Number(r.total_emission), 0) / recent.length;
      // Goal: target reduction in average daily emissions (so current = avg in CO2 since starting)
      // We treat target as "target avg daily emission"
      // Simpler: progress measured as reduction from baseline (first record)
      const baseline = recent[0] ? Number(recent[0].total_emission) : avg;
      const reduction = Math.max(0, baseline - avg);
      return reduction;
    }
    return goal.current_value;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: title || 'New goal',
      target_value: targetValue,
      metric,
      deadline,
      status: 'active',
      current_value: 0,
    });
    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setToast({ message: 'Goal created!', type: 'success' });
      setTitle('');
      setTargetValue(20);
      setShowForm(false);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setGoals((p) => p.filter((g) => g.id !== id));
      setToast({ message: 'Goal deleted.', type: 'success' });
    }
  };

  const handleComplete = async (goal: Goal) => {
    const { error } = await supabase.from('goals').update({ status: 'completed', current_value: goal.target_value }).eq('id', goal.id);
    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setToast({ message: 'Goal completed! Great work.', type: 'success' });
      loadData();
    }
  };

  if (loading) return <LoadingSpinner label="Loading goals…" />;

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle="Set sustainability targets and track your progress."
        icon={<Target className="h-5 w-5" />}
        action={{ label: 'New goal', to: '#', }}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button
        onClick={() => setShowForm((v) => !v)}
        className="btn-primary mb-6"
      >
        <Plus className="h-4 w-4" /> {showForm ? 'Cancel' : 'Create new goal'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 animate-slide-down">
          <h3 className="font-display text-lg font-bold text-slate-900">New goal</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-text">Goal title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. Reduce monthly emissions by 20%"
                required
              />
            </div>
            <div>
              <label className="label-text">Metric</label>
              <select value={metric} onChange={(e) => setMetric(e.target.value)} className="input-field">
                {METRIC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Target value</label>
              <input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-field" required />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4">Create goal</button>
        </form>
      )}

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6" />}
          title="No goals yet"
          description="Set targets like reducing emissions by 20% or saving 50 kWh/month to stay motivated."
          action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="h-4 w-4" /> Create my first goal</button>}
        />
      ) : (
        <>
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-slate-500">Active goals ({activeGoals.length})</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeGoals.map((goal) => {
              const current = computeProgress(goal);
              const progress = goal.target_value > 0 ? Math.min(100, (current / goal.target_value) * 100) : 0;
              const unit = METRIC_OPTIONS.find((m) => m.value === goal.metric)?.unit || '';
              const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              return (
                <div key={goal.id} className="card animate-slide-up">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display text-base font-bold text-slate-900">{goal.title}</h4>
                      <p className="mt-0.5 text-xs text-slate-500 capitalize">{goal.metric.replace('_', ' ')}</p>
                    </div>
                    <button onClick={() => handleDelete(goal.id)} className="text-slate-300 transition-colors hover:text-danger-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="font-display text-2xl font-bold text-slate-900">{current.toFixed(1)}</span>
                      <span className="text-sm text-slate-400"> / {goal.target_value} {unit}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                    </span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{progress.toFixed(0)}% complete</span>
                    {progress >= 100 ? (
                      <button onClick={() => handleComplete(goal)} className="flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {completedGoals.length > 0 && (
            <>
              <h3 className="mt-8 mb-3 font-display text-sm font-bold uppercase tracking-wide text-slate-500">Completed ({completedGoals.length})</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="card flex items-center justify-between bg-primary-50/30">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-warning-500" />
                      <div>
                        <h4 className="font-medium text-slate-800">{goal.title}</h4>
                        <p className="text-xs text-slate-500">Reached {goal.target_value} {METRIC_OPTIONS.find((m) => m.value === goal.metric)?.unit}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary-500" />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
