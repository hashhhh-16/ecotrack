import { Link } from 'react-router-dom';
import {
  Leaf,
  Calculator,
  Target,
  TrendingUp,
  Lightbulb,
  Trophy,
  Trees,
  Users,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Zap,
} from 'lucide-react';
import { Navbar, Footer } from '../components/Navbar';

const features = [
  {
    icon: Calculator,
    title: 'Carbon Calculator',
    description: 'Log your daily travel, electricity, food, and waste. We calculate your carbon footprint using standard emission factors.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: Lightbulb,
    title: 'Personalized Tips',
    description: 'Get actionable, science-based recommendations tailored to your habits with estimated CO₂ reductions.',
    color: 'bg-accent-50 text-accent-600',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set emissions targets, track progress automatically, and celebrate milestones as you reach them.',
    color: 'bg-warning-50 text-warning-600',
  },
  {
    icon: TrendingUp,
    title: 'Progress Dashboard',
    description: 'Beautiful charts reveal daily, weekly, and monthly trends so you can see your real impact over time.',
    color: 'bg-primary-50 text-primary-700',
  },
  {
    icon: Trophy,
    title: 'Daily Challenges',
    description: 'Complete simple sustainability tasks, earn points, unlock badges, and build lasting green habits.',
    color: 'bg-accent-50 text-accent-700',
  },
  {
    icon: Trees,
    title: 'Carbon Offsets',
    description: 'Explore vetted initiatives—tree planting, renewables, and NGOs—to offset what you cannot reduce.',
    color: 'bg-primary-50 text-primary-600',
  },
];

const steps = [
  { num: '01', title: 'Tell us about your day', description: 'Log your transport, electricity, diet, and waste in seconds.' },
  { num: '02', title: 'See your footprint', description: 'We calculate emissions instantly with transparent, standard factors.' },
  { num: '03', title: 'Get personalized tips', description: 'Receive concrete actions to cut emissions where it matters most.' },
  { num: '04', title: 'Track & improve', description: 'Watch your emissions fall, complete challenges, and hit your goals.' },
];

const stats = [
  { value: '0.21', label: 'kg CO₂ per km by car' },
  { value: '0.82', label: 'kg CO₂ per kWh electricity' },
  { value: '7', label: 'kg CO₂/day on a heavy-meat diet' },
  { value: '20+', label: 'eco challenges to complete' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="animate-slide-up">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                  <Leaf className="h-3.5 w-3.5" />
                  Make climate action measurable
                </div>
                <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  See your impact.
                  <br />
                  <span className="text-gradient-primary">Change the planet.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                  EcoTrack turns invisible carbon emissions into clear, actionable insight. Understand your footprint, get personalized recommendations, and build sustainable habits—step by step.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link to="/register" className="btn-primary text-base">
                    Start tracking free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/login" className="btn-secondary text-base">
                    I have an account
                  </Link>
                </div>
                <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-primary-500" />
                    No credit card needed
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-primary-500" />
                    Setup in 2 minutes
                  </div>
                </div>
              </div>

              {/* Hero illustration card */}
              <div className="relative animate-scale-in">
                <div className="absolute -right-8 -top-8 h-72 w-72 animate-float rounded-full bg-primary-200/40 blur-3xl" />
                <div className="absolute -bottom-8 -left-8 h-64 w-64 animate-float rounded-full bg-accent-200/40 blur-3xl" style={{ animationDelay: '1.5s' }} />
                <div className="relative rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl shadow-primary-900/10 backdrop-blur-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Today's footprint</p>
                      <div className="mt-1 flex items-end gap-1">
                        <span className="font-display text-3xl font-bold text-slate-900">8.4</span>
                        <span className="mb-1 text-sm text-slate-500">kg CO₂</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                      <TrendingUp className="h-3 w-3" />
                      ↓ 12% vs avg
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Transport', value: 72, color: 'bg-primary-500', val: '4.2 kg' },
                      { label: 'Electricity', value: 48, color: 'bg-accent-500', val: '2.1 kg' },
                      { label: 'Food', value: 30, color: 'bg-warning-500', val: '1.5 kg' },
                      { label: 'Waste', value: 18, color: 'bg-danger-400', val: '0.6 kg' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium text-slate-600">{row.label}</span>
                          <span className="text-slate-500">{row.val}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${row.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <div className="font-display text-lg font-bold text-primary-600">142</div>
                      <div className="text-[10px] text-slate-500">Points earned</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <div className="font-display text-lg font-bold text-accent-600">7 day</div>
                      <div className="text-[10px] text-slate-500">Streak</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <div className="font-display text-lg font-bold text-warning-600">3/5</div>
                      <div className="text-[10px] text-slate-500">Goals met</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-20 grid grid-cols-2 gap-6 border-t border-slate-200 pt-10 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl font-extrabold text-gradient-primary sm:text-4xl">{stat.value}</div>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-slate-200/70 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <Zap className="h-3.5 w-3.5 text-warning-500" />
                Everything you need
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                A complete toolkit for sustainable living
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                From measurement to action—EcoTrack guides every step of your climate journey.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-mesh py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                <BarChart3 className="h-3.5 w-3.5" />
                How it works
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                From data to action in four simple steps
              </h2>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.num} className="relative">
                  <div className="card h-full">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="font-display text-2xl font-extrabold text-primary-200">{step.num}</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community CTA */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 p-10 sm:p-14">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    <Users className="h-3.5 w-3.5" />
                    Join the community
                  </div>
                  <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                    Your actions add up.
                  </h2>
                  <p className="mt-4 max-w-lg text-lg text-primary-50">
                    Thousands of people are using EcoTrack to cut their emissions. Compete with friends, join challenges, and prove that small changes—when measured—truly matter.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 active:scale-95">
                      Create your free account
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-5 text-white backdrop-blur">
                    <div className="font-display text-3xl font-extrabold">2.4M kg</div>
                    <div className="mt-1 text-sm text-primary-100">CO₂ reduced by users</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5 text-white backdrop-blur">
                    <div className="font-display text-3xl font-extrabold">18k+</div>
                    <div className="mt-1 text-sm text-primary-100">Challenges completed</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5 text-white backdrop-blur">
                    <div className="font-display text-3xl font-extrabold">8.4k</div>
                    <div className="mt-1 text-sm text-primary-100">Trees virtually planted</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5 text-white backdrop-blur">
                    <div className="font-display text-3xl font-extrabold">12%</div>
                    <div className="mt-1 text-sm text-primary-100">Avg. footprint reduction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
