import { useEffect, useState } from 'react';
import { CheckCircle, Plus, Trophy, Flame, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Challenge, UserChallenge } from '../types';
import { PageHeader, EmptyState, LoadingSpinner, Toast } from '../components/ui';

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-primary-50 text-primary-700',
  energy: 'bg-accent-50 text-accent-700',
  food: 'bg-warning-50 text-warning-700',
  waste: 'bg-danger-50 text-danger-700',
  lifestyle: 'bg-slate-100 text-slate-700',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function ChallengesPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    if (!user) return;
    const [challsRes, ucRes] = await Promise.all([
      supabase.from('challenges').select('*').eq('is_active', true).order('points', { ascending: true }),
      supabase.from('user_challenges').select('*, challenge:challenges(*)').eq('user_id', user.id).order('assigned_date', { ascending: false }),
    ]);
    setChallenges((challsRes.data ?? []) as Challenge[]);
    setUserChallenges((ucRes.data ?? []) as UserChallenge[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const today = new Date().toISOString().split('T')[0];

  const isAssignedToday = (challengeId: string) =>
    userChallenges.some((uc) => uc.challenge_id === challengeId && uc.assigned_date === today);

  const isCompleted = (challengeId: string) =>
    userChallenges.some((uc) => uc.challenge_id === challengeId && uc.status === 'completed');

  const handleAssign = async (challengeId: string) => {
    if (!user) return;
    const assignedDate = today;
    const { error } = await supabase.from('user_challenges').insert({
      user_id: user.id,
      challenge_id: challengeId,
      assigned_date: assignedDate,
      status: 'pending',
    });
    if (error) {
      setToast({ message: error.code === '23505' ? 'Already assigned today.' : error.message, type: 'error' });
    } else {
      setToast({ message: 'Challenge added to today!', type: 'success' });
      loadData();
    }
  };

  const handleComplete = async (uc: UserChallenge) => {
    if (!user) return;
    const challenge = uc.challenge as unknown as Challenge;
    const { error: updateError } = await supabase
      .from('user_challenges')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', uc.id);

    if (updateError) {
      setToast({ message: updateError.message, type: 'error' });
      return;
    }

    const newPoints = (profile?.total_points ?? 0) + (challenge?.points ?? 10);
    await supabase.from('profiles').update({ total_points: newPoints }).eq('id', user.id);
    await refreshProfile();
    setToast({ message: `Completed! +${challenge?.points} points`, type: 'success' });
    loadData();
  };

  if (loading) return <LoadingSpinner label="Loading challenges…" />;

  const todayChallenges = userChallenges.filter((uc) => uc.assigned_date === today);
  const completedCount = todayChallenges.filter((uc) => uc.status === 'completed').length;

  const grouped: Record<string, Challenge[]> = {};
  for (const c of challenges) {
    const cat = c.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  }

  return (
    <div>
      <PageHeader
        title="Sustainability Challenges"
        subtitle="Complete daily eco-tasks to earn points and build green habits."
        icon={<CheckCircle className="h-5 w-5" />}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Today's progress summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-xl font-bold text-slate-900">{profile?.total_points ?? 0}</div>
            <div className="text-xs text-slate-500">Total points</div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-xl font-bold text-slate-900">{profile?.streak_days ?? 0}</div>
            <div className="text-xs text-slate-500">Day streak</div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-xl font-bold text-slate-900">{completedCount} / {todayChallenges.length}</div>
            <div className="text-xs text-slate-500">Completed today</div>
          </div>
        </div>
      </div>

      {/* Today's challenges */}
      {todayChallenges.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 font-display text-lg font-bold text-slate-900">Today's challenges</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {todayChallenges.map((uc) => {
              const challenge = uc.challenge as unknown as Challenge;
              const completed = uc.status === 'completed';
              return (
                <div key={uc.id} className={`card transition-all ${completed ? 'border-primary-200 bg-primary-50/30' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`stat-pill ${CATEGORY_COLORS[challenge?.category]} capitalize`}>{challenge?.category}</span>
                        <span className="stat-pill bg-slate-100 text-slate-600">{DIFFICULTY_LABEL[challenge?.difficulty]}</span>
                      </div>
                      <h4 className="font-medium text-slate-900">{challenge?.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{challenge?.description}</p>
                    </div>
                    <span className="stat-pill bg-warning-50 text-warning-700 whitespace-nowrap">+{challenge?.points}</span>
                  </div>
                  <button
                    onClick={() => handleComplete(uc)}
                    disabled={completed}
                    className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                      completed
                        ? 'bg-primary-100 text-primary-600 cursor-default'
                        : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                    }`}
                  >
                    {completed ? 'Completed' : 'Mark as complete'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All challenges by category */}
      <h3 className="mb-3 font-display text-lg font-bold text-slate-900">Browse all challenges</h3>
      {challenges.length === 0 ? (
        <EmptyState icon={<RefreshCw className="h-6 w-6" />} title="None available" description="Check back soon." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catChallenges]) => (
            <div key={cat}>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500 capitalize">{cat}</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {catChallenges.map((c) => {
                  const assigned = isAssignedToday(c.id);
                  const completed = isCompleted(c.id);
                  return (
                    <div key={c.id} className="card">
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`stat-pill ${CATEGORY_COLORS[c.category]} capitalize`}>{c.difficulty}</span>
                        <span className="stat-pill bg-warning-50 text-warning-700">+{c.points}</span>
                      </div>
                      <h4 className="font-medium text-slate-900">{c.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{c.description}</p>
                      {completed ? (
                        <div className="mt-3 w-full rounded-lg bg-primary-100 px-3 py-2 text-center text-sm font-semibold text-primary-700">
                          Completed before
                        </div>
                      ) : assigned ? (
                        <div className="mt-3 w-full rounded-lg bg-accent-50 px-3 py-2 text-center text-sm font-semibold text-accent-700">
                          Already in today's list
                        </div>
                      ) : (
                        <button onClick={() => handleAssign(c.id)} className="btn-secondary mt-3 w-full">
                          <Plus className="h-4 w-4" /> Add to today
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
