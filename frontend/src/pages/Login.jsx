import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClasses =
    'w-full h-[52px] rounded-[14px] bg-white border border-[#E2E8F0] pl-11 pr-4 text-[15px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all duration-200 focus:border-[#B3122A] focus:ring-4 focus:ring-[#B3122A]/10';

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F8FAFC] flex items-center justify-center px-4 py-10">
      {/* Subtle background pattern: dot grid at low opacity, no gradients/illustrations */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
        aria-hidden="true"
      >
        <defs>
          <pattern id="slg-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#B3122A" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#slg-dot-grid)" />
      </svg>
      <div
        className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full border border-[#B3122A]/[0.05]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 h-[380px] w-[380px] rounded-full border border-[#B3122A]/[0.05]"
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-[440px] transition-all duration-500 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <div className="rounded-[20px] border border-[#E2E8F0] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] px-8 py-10 sm:px-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#B3122A]">
              <Building2 className="h-6 w-6 text-white" strokeWidth={2} aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-[20px] font-semibold tracking-tight text-[#0F172A]">SLG Rooms</h1>
            <p className="mt-1 text-[13px] font-medium text-[#64748B]">Property Management System</p>

            <div className="mt-8 w-full text-left">
              <h2 className="text-[24px] font-semibold leading-tight text-[#0F172A]">Welcome back</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748B]">
                Sign in to manage rooms, bookings, tenants and daily operations.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-3.5 text-[13px] font-medium text-[#991B1B]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className={inputBaseClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-[#0F172A]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={`${inputBaseClasses} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#B3122A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3122A]/30 rounded-md p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-[4px] border-[#E2E8F0] text-[#B3122A] focus:ring-2 focus:ring-[#B3122A]/20 focus:ring-offset-0"
                />
                <span className="text-[13px] font-medium text-[#64748B]">Remember me</span>
              </label>
              <button
                type="button"
                className="text-[13px] font-medium text-[#B3122A] transition-colors hover:text-[#8F0E21] focus:outline-none focus-visible:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#B3122A] text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#8F0E21] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B3122A]/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[12px] font-medium text-[#94A3B8]">
          <span>Powered by Stayo</span>
          <span className="h-1 w-1 rounded-full bg-[#E2E8F0]" aria-hidden="true" />
          <button type="button" className="transition-colors hover:text-[#64748B] focus:outline-none focus-visible:underline">
            Privacy Policy
          </button>
          <span className="h-1 w-1 rounded-full bg-[#E2E8F0]" aria-hidden="true" />
          <button type="button" className="transition-colors hover:text-[#64748B] focus:outline-none focus-visible:underline">
            Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
