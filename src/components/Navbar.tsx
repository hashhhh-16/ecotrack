import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Calculator as CalculatorIcon,
  Target,
  CheckCircle,
  Trees,
  Trophy,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calculator', label: 'Calculator', icon: CalculatorIcon },
  { to: '/recommendations', label: 'Tips', icon: Lightbulb },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/challenges', label: 'Challenges', icon: CheckCircle },
  { to: '/offsets', label: 'Offsets', icon: Trees },
  { to: '/leaderboard', label: 'Community', icon: Trophy },
];

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-md shadow-primary-500/30">
            <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-extrabold text-slate-900">EcoTrack</span>
        </Link>

        {user && (
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
                <Trophy className="h-4 w-4 text-warning-500" />
                <span className="text-sm font-semibold text-slate-700">{profile?.total_points ?? 0} pts</span>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white">
                  {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden max-w-[100px] truncate sm:block">{profile?.full_name || 'Profile'}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-danger-50 hover:text-danger-600"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 lg:hidden"
                aria-label="Toggle menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>

      {open && user && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-slate-900">EcoTrack</span>
          </div>
          <p className="text-center text-sm text-slate-500">
            Empowering everyday climate action. One footprint at a time.
          </p>
          <p className="text-xs text-slate-400">
            Emission factors based on standard estimates.
          </p>
        </div>
      </div>
    </footer>
  );
}
