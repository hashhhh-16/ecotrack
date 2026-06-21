import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Trophy,
  TrendingDown,
  Calendar,
  Target,
  CheckCircle,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { CarbonRecord, Goal, UserChallenge, Recommendation, Challenge } from '../types';
import { PageHeader, StatCard, EmptyState, LoadingSpinner } from '../components/ui';
import { LineChart, DonutChart } from '../components/Charts';

const SLICE_COLORS: Record<string, string> = {
  Transport: '#16a34a',
  Electricity: '#06b6d4',
  Food: '#eab308',
  Waste: '#ef4444',
};

const DEFAULT_GOAL_LINE = 7;

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<CarbonRecord[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [recordsRes, goalsRes, challengesRes, recsRes] = await Promise.all([
        supabase
          .from('carbon_records')
          .select('*')
          .eq('user_id', user.id)
          .order('record_date', { ascending: true })
          .limit(30),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('user_challenges')
          .select('*, challenge:challenges(*)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('assigned_date', { ascending: false })
          .limit(4),
        supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'new')
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      setRecords((recordsRes.data ?? []) as CarbonRecord[]);
      setActiveGoals((goalsRes.data ?? []) as Goal[]);
      setChallenges((challengesRes.data ?? []) as UserChallenge[]);
      setRecommendations((recsRes.data ?? []) as Recommendation[]);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading your dashboard…" />;

  // Build chart data
  const last14 = records.slice(-14);
  const lineData = last14.map((r) => ({
    label: new Date(r.record_date).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
    value: Number(r.total_emission),
  }));

  const today = records.length > 0 ? records[records.length - 1] : null;
  const weekRecords = records.slice(-7);
  const weeklyAvg = weekRecords.length
    ? weekRecords.reduce((s, r) => s + Number(r.total_emission), 0) / weekRecords.length
    : 0;
  const prevWeek = records.slice(-14, -7);
  const prevAvg = prevWeek.length
    ? prevWeek.reduce((s, r) => s + Number(r.total_emission), 0) / prevWeek.length
    : 0;
  const weeklyDelta = weeklyAvg > 0 && prevAvg > 0 ? ((weeklyAvg - prevAvg) / prevAvg) * 100 : 0;

  const donutData = today
    ? [
        { label: 'Transport', value: Number(today.transport_emission), color: SLICE_COLORS.Transport },
        { label: 'Electricity', value: Number(today.electricity_emission), color: SLICE_COLORS.Electricity },
        { label: 'Food', value: Number(today.food_emission), color: SLICE_COLORS.Food },
        { label: 'Waste', value: Number(today.waste_emission), color: SLICE_COLORS.Waste },
      ]
    : [];

  const todayStr = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${profile?.full_name || 'friend'}`}
        subtitle={todayStr}
        icon={<LayoutDashboard className="h-5 w-5" />}
        action={{ label: 'Log today', to: '/calculator' }}
      />

      {records.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-6 w-6" />}
          title="No data yet"
          description="Log your first day's activities to unlock your dashboard, charts, and personalized tips."
          action={
            <Link to="/calculator" className="btn-primary">
              <Leaf className="h-4 w-4" /> Log my first day
            </Link>
          }
        />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Today's footprint"
              value={today ? Number(today.total_emission).toFixed(1) : '0'}
              unit="kg CO₂"
              icon={<Flame className="h-5 w-5" />}
              color="primary"
              trend={prevAvg > 0 ? { value: `${Math.abs(weeklyDelta).toFixed(0)}%`, positive: weeklyDelta <= 0 } : undefined}
            />
            <StatCard
              label="7-day average"
              value={weeklyAvg.toFixed(1)}
              unit="kg CO₂/day"
              icon={<TrendingDown className="h-5 w-5" />}
              color="accent"
            />
            <StatCard
              label="Points earned"
              value={profile?.total_points ?? 0}
              icon={<Trophy className="h-5 w-5" />}
              color="warning"
            />
            <StatCard
              label="Day streak"
              value={profile?.streak_days ?? 0}
              unit="days"
              icon={<Flame className="h-5 w-5" />}
              color="danger"
            />
          </div>

          {/* Charts */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900">Emissions trend</h3>
                <span className="text-xs text-slate-400">Last 14 entries</span>
              </div>
              <LineChart data={lineData} goalLine={DEFAULT_GOAL_LINE} />
              {DEFAULT_GOAL_LINE && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-0.5 w-4 rounded-full bg-warning-500" />
                  Target: {DEFAULT_GOAL_LINE} kg CO₂/day
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="mb-4 font-display text-lg font-bold text-slate-900">Today's breakdown</h3>
              <div className="flex justify-center">
                <DonutChart data={donutData} centerValue={today ? Number(today.total_emission).toFixed(1) : '0'} centerLabel="kg CO₂" />
              </div>
            </div>
          </div>

          {/* Goals + Recommendations + Challenges */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Goals */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                  <Target className="h-5 w-5 text-primary-500" /> Active goals
                </h3>
                <Link to="/goals" className="text-xs font-semibold text-primary-600 hover:text-primary-700">View all</Link>
              </div>
              {activeGoals.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  No active goals yet.<br />
                  <Link to="/goals" className="font-semibold text-primary-600">Set your first goal →</Link>
                </p>
              ) : (
                <div className="space-y-4">
                  {activeGoals.map((goal) => {
                    const progress = goal.target_value > 0 ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0;
                    return (
                      <div key={goal.id}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{goal.title}</span>
                          <span className="text-xs text-slate-400">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                  <Sparkles className="h-5 w-5 text-accent-500" /> Tips
                </h3>
                <Link to="/recommendations" className="text-xs font-semibold text-primary-600 hover:text-primary-700">View all</Link>
              </div>
              {recommendations.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  No new tips.<br />
                  Log activities to get personalized recommendations.
                </p>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="stat-pill bg-primary-50 text-primary-700 capitalize">{rec.category}</span>
                        <span className="text-xs text-slate-400">−{rec.potential_reduction_kg} kg</span>
                      </div>
                      <p className="text-sm text-slate-700">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Challenges */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                  <CheckCircle className="h-5 w-5 text-warning-500" /> Challenges
                </h3>
                <Link to="/challenges" className="text-xs font-semibold text-primary-600 hover:text-primary-700">View all</Link>
              </div>
              {challenges.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  No pending challenges.<br />
                  <Link to="/challenges" className="font-semibold text-primary-600">Browse challenges →</Link>
                </p>
              ) : (
                <div className="space-y-2.5">
                  {challenges.map((uc) => {
                    const challenge = uc.challenge as unknown as Challenge;
                    return (
                      <Link
                        key={uc.id}
                        to="/challenges"
                        className="block rounded-xl border border-slate-100 p-3 transition-all hover:border-primary-200 hover:bg-primary-50/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-slate-800">{challenge?.title}</span>
                          <span className="stat-pill bg-warning-50 text-warning-700">+{challenge?.points}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{challenge?.description}</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
