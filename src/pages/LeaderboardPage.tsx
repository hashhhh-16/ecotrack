import { useEffect, useState } from 'react';
import { Trophy, Crown, Flame, Medal, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { LeaderboardEntry } from '../types';
import { PageHeader, LoadingSpinner, EmptyState } from '../components/ui';

const RANK_STYLES: Record<number, { ring: string; medal: string; crown?: boolean }> = {
  1: { ring: 'ring-2 ring-warning-400 bg-gradient-to-br from-warning-50 to-warning-100', medal: 'text-warning-500', crown: true },
  2: { ring: 'ring-2 ring-slate-300 bg-gradient-to-br from-slate-50 to-slate-100', medal: 'text-slate-400' },
  3: { ring: 'ring-2 ring-amber-300 bg-gradient-to-br from-amber-50 to-amber-100', medal: 'text-amber-700' },
};

const BADGES = [
  { min: 0, label: 'Seedling', icon: '🌱' },
  { min: 50, label: 'Sprout', icon: '🌿' },
  { min: 150, label: 'Sapling', icon: '🌳' },
  { min: 350, label: 'Tree Hugger', icon: '🤗' },
  { min: 700, label: 'Eco Warrior', icon: '🛡️' },
  { min: 1500, label: 'Climate Hero', icon: '🏆' },
];

function getBadge(points: number) {
  let result = BADGES[0];
  for (const b of BADGES) if (points >= b.min) result = b;
  return result;
}

const COMMUNITY_GROUPS = [
  { name: 'Bike to Work', members: 1284, color: 'bg-primary-50 text-primary-700' },
  { name: 'Plant-Based Sundays', members: 942, color: 'bg-warning-50 text-warning-700' },
  { name: 'Zero Waste Living', members: 756, color: 'bg-danger-50 text-danger-700' },
  { name: 'Energy Savers', members: 612, color: 'bg-accent-50 text-accent-700' },
];

export function LeaderboardPage() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('leaderboard_view')
      .select('*')
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          // Fallback: query profiles directly
          supabase
            .from('profiles')
            .select('id, full_name, avatar_url, total_points, streak_days')
            .order('total_points', { ascending: false })
            .limit(50)
            .then(({ data: fallback }) => {
              const ranked = (fallback ?? []).map((p, idx) => ({ user_id: p.id, full_name: p.full_name, avatar_url: p.avatar_url, total_points: p.total_points ?? 0, streak_days: p.streak_days ?? 0, rank: idx + 1 }));
              ranked.sort((a, b) => b.total_points - a.total_points);
              setEntries(ranked);
            });
        } else {
          setEntries((data ?? []) as LeaderboardEntry[]);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner label="Loading leaderboard…" />;

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);
  const myRank = entries.findIndex((e) => e.user_id === user?.id);
  const myBadge = getBadge(profile?.total_points ?? 0);

  return (
    <div>
      <PageHeader
        title="Community Leaderboard"
        subtitle="Compete with fellow EcoTrackers and prove small actions add up."
        icon={<Trophy className="h-5 w-5" />}
      />

      {entries.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No community data yet" description="As you and other users earn points by completing challenges, the leaderboard will come alive." />
      ) : (
        <>
          {/* My rank card */}
          <div className="mb-6 card bg-gradient-to-br from-primary-50 to-accent-50">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-xl font-bold text-white shadow-lg shadow-primary-500/30">
                  {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-slate-900">{profile?.full_name || 'You'}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs">
                    <span className="stat-pill bg-white text-slate-700 shadow-sm">{myBadge.icon} {myBadge.label}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div>
                  <div className="font-display text-xl font-bold text-primary-700">{profile?.total_points ?? 0}</div>
                  <div className="text-xs text-slate-500">Points</div>
                </div>
                <div>
                  <div className="font-display text-xl font-bold text-primary-700">{myRank >= 0 ? `#${myRank + 1}` : '—'}</div>
                  <div className="text-xs text-slate-500">Rank</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 podium */}
          {topThree.length > 0 && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {topThree.map((entry, idx) => {
                const style = RANK_STYLES[idx + 1] || RANK_STYLES[3];
                const heightClass = idx === 0 ? 'sm:mt-0' : idx === 1 ? 'sm:mt-6' : 'sm:mt-10';
                return (
                  <div key={entry.user_id} className={`card text-center ${style.ring} ${heightClass}`}>
                    <div className="mb-2 flex justify-center">
                      {style.crown ? (
                        <Crown className="h-6 w-6 text-warning-500" />
                      ) : (
                        <Medal className={`h-6 w-6 ${style.medal}`} />
                      )}
                    </div>
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-lg font-bold text-white shadow-md">
                      {entry.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="font-display font-bold text-slate-900 truncate max-w-[140px] mx-auto">
                      {entry.user_id === user?.id ? 'You' : entry.full_name || 'Anonymous'}
                    </div>
                    <div className={`font-display text-2xl font-extrabold ${style.medal}`}>
                      {entry.total_points}
                    </div>
                    <div className="text-xs text-slate-500">points</div>
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
                      <Flame className="h-3 w-3 text-danger-400" /> {entry.streak_days}d streak
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full leaderboard */}
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Rank</th>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 text-right font-semibold">Points</th>
                  <th className="hidden px-5 py-3 text-center font-semibold sm:table-cell">Streak</th>
                  <th className="hidden px-5 py-3 text-right font-semibold sm:table-cell">Badge</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry) => {
                  const badge = getBadge(entry.total_points);
                  const isMe = entry.user_id === user?.id;
                  return (
                    <tr key={entry.user_id} className={`border-b border-slate-50 last:border-0 ${isMe ? 'bg-primary-50/50' : ''}`}>
                      <td className="px-5 py-3 font-semibold text-slate-500">#{entry.rank}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-xs font-bold text-white">
                            {entry.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className={`font-medium ${isMe ? 'text-primary-700' : 'text-slate-800'}`}>
                            {isMe ? 'You' : entry.full_name || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">{entry.total_points}</td>
                      <td className="hidden px-5 py-3 text-center text-slate-600 sm:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3 w-3 text-danger-400" /> {entry.streak_days}d
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 text-right text-slate-600 sm:table-cell">
                        <span className="text-sm">{badge.icon}</span> <span className="text-xs">{badge.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Community groups */}
          <div className="mt-8">
            <h3 className="font-display text-lg font-bold text-slate-900">Sustainability groups</h3>
            <p className="mt-1 text-sm text-slate-500">Join like-minded communities tackling climate action together.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {COMMUNITY_GROUPS.map((g) => (
                <div key={g.name} className="card flex items-center justify-between transition-all hover:border-primary-200 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${g.color}`}>
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{g.name}</h4>
                      <p className="text-xs text-slate-500">{g.members.toLocaleString()} members</p>
                    </div>
                  </div>
                  <button className="btn-ghost text-primary-600 hover:bg-primary-50">Join</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
