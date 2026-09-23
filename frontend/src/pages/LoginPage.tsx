import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthButton } from '../components/auth/GoogleOAuthButton';
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (res.isComplete) {
        navigate('/feed');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await demoLogin();
      if (res.isComplete) {
        navigate('/feed');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 text-slate-100 w-full max-w-full overflow-x-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-2">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-purple-600 text-white font-black text-xl sm:text-2xl shadow-xl shadow-brand-500/30 mb-3 sm:mb-4 animate-bounce-short">
          N
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
          NexaLink <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">CRM</span>
        </h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400">
          Build Meaningful Connections. Track Relationships. Achieve Your Goals.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md px-1 sm:px-0">
        <div className="bg-white text-slate-900 py-6 sm:py-8 px-4 sm:px-10 shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-100/10 backdrop-blur-md">
          {/* Quick Demo Access Callout */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-200/60 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                <Zap className="w-4 h-4 text-brand-600 fill-brand-600" />
                <span>Instant Demo Access</span>
              </div>
              <p className="text-[11px] text-slate-600">Explore pre-seeded contacts, goals, AI assistant & analytics</p>
            </div>
            <button
              onClick={handleDemo}
              disabled={loading}
              className="px-3.5 py-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              1-Click Demo
            </button>
          </div>

          <div className="mb-4">
            <GoogleOAuthButton
              buttonText="Continue with Google"
              onSuccess={(isComplete) => {
                if (isComplete) navigate('/feed');
                else navigate('/profile');
              }}
              onError={(err) => setError(err)}
            />
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">Or sign in with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> MySQL Prepared SQL</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-400" /> AI-Assisted, User-Controlled</span>
        </div>
      </div>
    </div>
  );
};
