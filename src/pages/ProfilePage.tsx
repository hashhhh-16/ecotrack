import { useEffect, useState } from 'react';
import { User as UserIcon, Edit2, Save, Award, Flame, Trophy, Calendar, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { CarbonRecord, UserChallenge } from '../types';
import { PageHeader, LoadingSpinner, Toast } from '../components/ui';

const BADGES = [
  { min: 0, label: 'Seedling', icon: '🌱', color: 'bg-slate-100 text-slate-700' },
  { min: 50, label: 'Sprout', icon: '🌿', color: 'bg-primary-50 text-primary-700' },
  { min: 150, label: 'Sapling', icon: '🌳', color: 'bg-accent-50 text-accent-700' },
  { min: 350, label: 'Tree Hugger', icon: '🤗', color: 'bg-warning-50 text-warning-700' },
  { min: 700, label: 'Eco Warrior', icon: '🛡️', color: 'bg-danger-50 text-danger-700' },
  { min: 1500, label: 'Climate Hero', icon: '🏆', color: 'bg-primary-100 text-primary-800' },
];

function getNextBadge(points: number) {
  for (const b of BADGES) if (points < b.min) return b;
  return null;
}

export function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [records, setRecords] = useState<CarbonRecord[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [recordsRes, ucRes] = await Promise.all([
        supabase.from('carbon_records').select('*').eq('user_id', user.id).order('record_date', { ascending: true }),
        supabase.from('user_challenges').select('*, challenge:challenges(*)').eq('user_id', user.id).eq('status', 'completed'),
      ]);
      setRecords((recordsRes.data ?? []) as CarbonRecord[]);
      setUserChallenges((ucRes.data ?? []) as UserChallenge[]);
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);
    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      await refreshProfile();
      setToast({ message: 'Profile updated', type: 'success' });
      setEditing(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading profile…" />;

  const points = profile?.total_points ?? 0;
  const currentBadge = [...BADGES].reverse().find((b) => points >= b.min) ?? BADGES[0];
  const nextBadge = getNextBadge(points);
  const totalEmissions = records.reduce((s, r) => s + Number(r.total_emission), 0);
  const completedCount = userChallenges.length;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : '';

  const progressToNext = nextBadge ? Math.min(100, ((points - currentBadge.min) / (nextBadge.min - currentBadge.min)) * 100) : 100;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account and view your sustainability milestones." icon={<UserIcon className="h-5 w-5" />} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-3xl font-extrabold text-white shadow-lg shadow-primary-500/30">
                {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              {!editing ? (
                <>
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900">{profile?.full_name || 'Anonymous'}</h3>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" /> Member since {memberSince}
                  </p>
                  <button onClick={() => setEditing(true)} className="btn-secondary mt-4 w-full">
                    <Edit2 className="h-4 w-4" /> Edit name
                  </button>
                </>
              ) : (
                <div className="mt-4 w-full">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="Your full name"
                  />
                  <div className="mt-3 flex gap-2">
                    <button onClick={handleSave} className="btn-primary flex-1">
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button onClick={() => { setEditing(false); setFullName(profile?.full_name || ''); }} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <Trophy className="mx-auto h-5 w-5 text-warning-500" />
                <div className="mt-1 font-display text-lg font-bold text-slate-900">{points}</div>
                <div className="text-[10px] text-slate-500">Points</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <Flame className="mx-auto h-5 w-5 text-danger-500" />
                <div className="mt-1 font-display text-lg font-bold text-slate-900">{profile?.streak_days ?? 0}</div>
                <div className="text-[10px] text-slate-500">Streak</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <Leaf className="mx-auto h-5 w-5 text-primary-500" />
                <div className="mt-1 font-display text-lg font-bold text-slate-900">{records.length}</div>
                <div className="text-[10px] text-slate-500">Days logged</div>
              </div>
            </div>

            <button onClick={signOut} className="btn-secondary mt-6 w-full">
              Sign out
            </button>
          </div>
        </div>

        {/* Achievement + lifetime stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badge progression */}
          <div className="card">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <Award className="h-5 w-5 text-warning-500" /> Badges
            </h3>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 p-4">
              <div className="text-4xl">{currentBadge.icon}</div>
              <div className="flex-1">
                <div className="font-display text-lg font-bold text-slate-900">{currentBadge.label}</div>
                {nextBadge ? (
                  <>
                    <p className="text-xs text-slate-500">{nextBadge.min - points} points to {nextBadge.label} {nextBadge.icon}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500" style={{ width: `${progressToNext}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">You've reached the highest badge. Incredible!</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {BADGES.map((b) => {
                const unlocked = points >= b.min;
                return (
                  <span
                    key={b.label}
                    className={`stat-pill ${unlocked ? b.color : 'bg-slate-50 text-slate-400 opacity-50'}`}
                    title={unlocked ? `${b.label} — unlocked` : `Locked at ${b.min} points`}
                  >
                    {b.icon} {b.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Lifetime stats */}
          <div className="card">
            <h3 className="font-display text-lg font-bold text-slate-900">Lifetime impact</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-primary-50 p-4">
                <div className="font-display text-2xl font-bold text-primary-700">{totalEmissions.toFixed(1)}</div>
                <div className="text-xs text-primary-600">Total emissions logged (kg CO₂)</div>
              </div>
              <div className="rounded-xl bg-accent-50 p-4">
                <div className="font-display text-2xl font-bold text-accent-700">{completedCount}</div>
                <div className="text-xs text-accent-600">Challenges completed</div>
              </div>
              <div className="rounded-xl bg-warning-50 p-4">
                <div className="font-display text-2xl font-bold text-warning-700">{records.length > 0 ? Math.round(totalEmissions / records.length) : 0}</div>
                <div className="text-xs text-warning-600">Avg kg CO₂ per logged day</div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <h3 className="font-display text-lg font-bold text-slate-900">Recent activity</h3>
            {records.length === 0 ? (
              <p className="mt-3 py-6 text-center text-sm text-slate-400">No activity logged yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {records.slice(-5).reverse().map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-700">{new Date(r.record_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{Number(r.total_emission).toFixed(1)} kg CO₂</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
