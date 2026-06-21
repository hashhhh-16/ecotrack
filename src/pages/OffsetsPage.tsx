import { useEffect, useState } from 'react';
import { Trees, Leaf, Sun, Wind, Globe2, Calculator } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { OffsetInitiative, CarbonRecord } from '../types';
import { PageHeader, EmptyState, LoadingSpinner } from '../components/ui';

const TYPE_META: Record<string, { icon: typeof Trees; label: string; color: string }> = {
  tree_plantation: { icon: Trees, label: 'Tree Plantation', color: 'bg-primary-50 text-primary-700' },
  renewable_energy: { icon: Sun, label: 'Renewable Energy', color: 'bg-accent-50 text-accent-700' },
  ngo: { icon: Globe2, label: 'NGO / Charity', color: 'bg-warning-50 text-warning-700' },
};

export function OffsetsPage() {
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<OffsetInitiative[]>([]);
  const [records, setRecords] = useState<CarbonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [initRes, recordsRes] = await Promise.all([
        supabase.from('offset_initiatives').select('*'),
        supabase.from('carbon_records').select('*').eq('user_id', user.id).order('record_date', { ascending: true }),
      ]);
      setInitiatives((initRes.data ?? []) as OffsetInitiative[]);
      setRecords((recordsRes.data ?? []) as CarbonRecord[]);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading offset initiatives…" />;

  const todayEmissions = records.length > 0 ? Number(records[records.length - 1].total_emission) : 0;
  const monthlyEmissions = todayEmissions * 30;

  const handleUnitChange = (id: string, value: number) => {
    setUnits((p) => ({ ...p, [id]: Math.max(0, value) }));
  };

  return (
    <div>
      <PageHeader
        title="Carbon Offset Initiatives"
        subtitle="Offset what you cannot reduce by supporting vetted environmental programs."
        icon={<Trees className="h-5 w-5" />}
      />

      {/* Current footprint banner */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-accent-700 p-6 text-white">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-primary-100">Your estimated monthly footprint</p>
            <div className="mt-1 font-display text-3xl font-extrabold">{monthlyEmissions.toFixed(0)} kg CO₂</div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur">
            <Calculator className="h-5 w-5" />
            <span className="text-sm font-medium">Based on your latest logged day</span>
          </div>
        </div>
      </div>

      {initiatives.length === 0 ? (
        <EmptyState icon={<Leaf className="h-6 w-6" />} title="No initiatives yet" description="Offset programs will appear here soon." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {initiatives.map((init) => {
            const meta = TYPE_META[init.type] || TYPE_META.tree_plantation;
            const Icon = meta.icon;
            const unitCount = units[init.id] ?? 1;
            const offsetKg = unitCount * Number(init.co2_offset_per_unit_kg);
            const coversMonthly = monthlyEmissions > 0 ? Math.min(100, (offsetKg / monthlyEmissions) * 100) : 0;

            return (
              <div key={init.id} className="card animate-slide-up">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">{init.name}</h3>
                      <p className="text-xs text-slate-400">{init.partner || meta.label}</p>
                    </div>
                  </div>
                  <span className={`stat-pill ${meta.color}`}>{meta.label}</span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">{init.description}</p>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">Offset amount</span>
                    <span className="font-semibold text-primary-600">{offsetKg.toLocaleString()} kg CO₂/yr</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={unitCount}
                      onChange={(e) => handleUnitChange(init.id, Number(e.target.value))}
                      className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 focus:border-primary-500 focus:outline-none"
                    />
                    <span className="text-sm text-slate-500">{init.unit_label}{unitCount !== 1 ? 's' : ''}</span>
                    <span className="ml-auto text-xs text-slate-400">@ {Number(init.co2_offset_per_unit_kg).toLocaleString()} kg/{init.unit_label}</span>
                  </div>
                </div>

                {monthlyEmissions > 0 && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Covers your monthly footprint</span>
                      <span className={`font-semibold ${coversMonthly >= 100 ? 'text-primary-600' : 'text-slate-700'}`}>
                        {coversMonthly.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500" style={{ width: `${Math.min(100, coversMonthly)}%` }} />
                    </div>
                    {coversMonthly >= 100 && (
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600">
                        <Leaf className="h-3.5 w-3.5" />
                        Fully offsets your monthly emissions
                      </p>
                    )}
                  </div>
                )}

                <a
                  href="#"
                  className="btn-primary mt-4 w-full"
                  onClick={(e) => e.preventDefault()}
                >
                  <Wind className="h-4 w-4" /> Support this initiative
                </a>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        <p className="flex items-start gap-2">
          <Leaf className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
          <span>EcoTrack connects you with vetted initiatives. Offset figures are conservative annual estimates; for direct donations, each partner's website will confirm actual impact. Reducing emissions first should always be your priority—offsetting comes after.</span>
        </p>
      </div>
    </div>
  );
}
