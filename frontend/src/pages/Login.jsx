import { BarChart3, BrainCircuit, Building2, CheckCircle2, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/authService';
import { usePlacementStore } from '../store/usePlacementStore';

const featureTiles = [
  {
    title: 'Placement Insights',
    subtitle: 'journal + ML layer',
    icon: BarChart3,
  },
  {
    title: 'TPO Coordinator',
    subtitle: 'workflow command center',
    icon: Building2,
  },
  {
    title: 'Student',
    subtitle: 'profile + predictor + actions',
    icon: UserRound,
  },
];

function fieldClass() {
  return 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100';
}

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const refreshData = usePlacementStore((state) => state.refreshData);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCgpa, setSignupCgpa] = useState('');

  const handleQuickLogin = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setLoginEmail('admin@placeflow.edu');
      setLoginPassword('admin123');
    } else {
      setLoginEmail('student@placeflow.edu');
      setLoginPassword('student123');
    }
  };

  const resetForms = () => {
    setError('');
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupPhone('');
    setSignupCgpa('');
  };

  const handleToggleMode = (nextSignupMode) => {
    setIsSignup(nextSignupMode);
    resetForms();
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(role, loginEmail, loginPassword);
    if (result.ok) {
      refreshData();
      navigate(role === 'admin' ? '/dashboard' : '/student');
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!signupName.trim()) {
      setError('Name is required');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Email is required');
      return;
    }
    if (!signupPassword) {
      setError('Password is required');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (signupCgpa && (isNaN(signupCgpa) || Number(signupCgpa) < 0 || Number(signupCgpa) > 10)) {
      setError('CGPA must be between 0 and 10');
      return;
    }

    setIsLoading(true);
    const profileData = {
      name: signupName,
      phone: signupPhone,
      cgpa: signupCgpa ? Number.parseFloat(signupCgpa) : 0,
      interests: [],
      activeBacklogs: 0,
    };

    const result = await signup(signupEmail, signupPassword, profileData);
    if (result.ok) {
      refreshData();
      navigate('/student');
    } else {
      setError(result.error || 'Signup failed');
    }

    setIsLoading(false);
  };

  return (
    <div className='pf-shell-bg min-h-screen px-4 py-8 md:px-6'>
      <div className='mx-auto grid w-full max-w-[1220px] gap-6 lg:grid-cols-[1.2fr_1fr]'>
        <section className='pf-enter rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-[var(--pf-shadow)] backdrop-blur-sm md:p-8'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='pf-float rounded-xl bg-[linear-gradient(135deg,#0f5c8e,#0f766e)] p-2 text-white'>
                <BrainCircuit className='h-5 w-5' />
              </div>
              <div>
                <p className='text-sm font-semibold tracking-[0.12em] text-slate-900'>PLACIFY AI</p>
                <p className='text-xs text-slate-500'>Placement Intelligence Platform</p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => setIsSignup(false)}
              className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50'
            >
              Sign In
            </button>
          </div>

          <div className='mt-5 grid gap-3 sm:grid-cols-3'>
            {featureTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <div key={tile.title} className='rounded-2xl border border-slate-200 bg-slate-50 p-3'>
                  <Icon className='h-4 w-4 text-teal-700' />
                  <p className='mt-2 text-sm font-semibold text-slate-900'>{tile.title}</p>
                  <p className='text-xs text-slate-500'>{tile.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className='mt-6 grid gap-4 md:grid-cols-2'>
            <div className='rounded-2xl border border-slate-200 bg-white p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>What We Offer</p>
              <div className='mt-3 space-y-2 text-sm text-slate-700'>
                <p className='flex items-center gap-2'><CheckCircle2 className='h-4 w-4 text-teal-600' />Campus insights and analytics</p>
                <p className='flex items-center gap-2'><CheckCircle2 className='h-4 w-4 text-teal-600' />Student placement predictor</p>
                <p className='flex items-center gap-2'><CheckCircle2 className='h-4 w-4 text-teal-600' />Workflow and report automation</p>
                <p className='flex items-center gap-2'><CheckCircle2 className='h-4 w-4 text-teal-600' />Resume-assisted recommendations</p>
              </div>
            </div>

            <div className='rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-sky-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Flow Outcome</p>
              <p className='mt-2 text-lg font-semibold text-slate-900'>From logs to placement momentum</p>
              <p className='mt-2 text-sm text-slate-600'>Built for clear daily decisions with low-friction execution.</p>
              <div className='mt-3 flex items-center gap-2 text-xs text-slate-600'>
                <Sparkles className='h-4 w-4 text-amber-500' />
                Enhanced implementation inspired by team sketch
              </div>
            </div>
          </div>

          <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Execution Snapshot</p>
            <div className='mt-3 grid gap-2 text-sm sm:grid-cols-2'>
              <p className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700'>1. Sign in as TPO or Student</p>
              <p className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700'>2. Use predictor and insights views</p>
              <p className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700'>3. Track pipeline and status flow</p>
              <p className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700'>4. Generate actionable reports</p>
            </div>
          </div>
        </section>

        <section className='pf-enter rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-[var(--pf-shadow)] backdrop-blur-sm md:p-8'>
          <div className='mb-5 flex items-center justify-between gap-3'>
            <h2 className='text-xl font-semibold text-slate-900'>{isSignup ? 'Create Student Account' : 'Sign In'}</h2>
            <span className='rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700'>
              Secure Access
            </span>
          </div>

          {!isSignup ? (
            <>
              <div className='mb-5'>
                <p className='mb-2 text-sm font-medium text-slate-700'>Select Role</p>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    type='button'
                    onClick={() => handleQuickLogin('admin')}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      role === 'admin'
                        ? 'border-teal-300 bg-teal-50 text-teal-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    TPO Coordinator
                  </button>
                  <button
                    type='button'
                    onClick={() => handleQuickLogin('student')}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      role === 'student'
                        ? 'border-teal-300 bg-teal-50 text-teal-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Student
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className='space-y-3'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-slate-700'>Email</label>
                  <input
                    type='email'
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    className={fieldClass()}
                    placeholder='Enter your email'
                    required
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium text-slate-700'>Password</label>
                  <input
                    type='password'
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className={fieldClass()}
                    placeholder='Enter your password'
                    required
                  />
                </div>

                {error ? (
                  <div className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'>{error}</div>
                ) : null}

                <button
                  type='submit'
                  disabled={isLoading}
                  className='h-11 w-full rounded-xl bg-[linear-gradient(135deg,#0f5c8e,#0f766e)] text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {role === 'student' ? (
                <button
                  type='button'
                  onClick={() => handleToggleMode(true)}
                  className='mt-4 w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
                >
                  Create New Account
                </button>
              ) : null}
            </>
          ) : (
            <>
              <form onSubmit={handleSignupSubmit} className='space-y-3'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-slate-700'>Full Name</label>
                  <input
                    type='text'
                    value={signupName}
                    onChange={(event) => setSignupName(event.target.value)}
                    className={fieldClass()}
                    placeholder='Enter your full name'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium text-slate-700'>Email</label>
                  <input
                    type='email'
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    className={fieldClass()}
                    placeholder='Enter your email'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium text-slate-700'>Password</label>
                  <input
                    type='password'
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    className={fieldClass()}
                    placeholder='At least 6 characters'
                  />
                </div>

                <div>
                  <label className='mb-1 block text-sm font-medium text-slate-700'>Confirm Password</label>
                  <input
                    type='password'
                    value={signupConfirmPassword}
                    onChange={(event) => setSignupConfirmPassword(event.target.value)}
                    className={fieldClass()}
                    placeholder='Confirm your password'
                  />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-slate-700'>Phone</label>
                    <input
                      type='tel'
                      value={signupPhone}
                      onChange={(event) => setSignupPhone(event.target.value)}
                      className={fieldClass()}
                      placeholder='Optional'
                    />
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-slate-700'>CGPA</label>
                    <input
                      type='number'
                      min='0'
                      max='10'
                      step='0.01'
                      value={signupCgpa}
                      onChange={(event) => setSignupCgpa(event.target.value)}
                      className={fieldClass()}
                      placeholder='0-10'
                    />
                  </div>
                </div>

                {error ? (
                  <div className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'>{error}</div>
                ) : null}

                <button
                  type='submit'
                  disabled={isLoading}
                  className='h-11 w-full rounded-xl bg-[linear-gradient(135deg,#0f5c8e,#0f766e)] text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <button
                type='button'
                onClick={() => handleToggleMode(false)}
                className='mt-4 w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
              >
                Back to Sign In
              </button>
            </>
          )}

          <div className='mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600'>
            <p className='mb-2 flex items-center gap-2 font-semibold text-slate-700'>
              <ShieldCheck className='h-4 w-4 text-teal-700' />
              Demo Credentials
            </p>
            <p>Admin: admin@placeflow.edu / admin123</p>
            <p>Student: student@placeflow.edu / student123</p>
          </div>
        </section>
      </div>
    </div>
  );
}
