import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { usePlacementStore } from '../store/usePlacementStore';

export default function Login() {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const refreshData = usePlacementStore((state) => state.refreshData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = login(role, email, password);

    if (result.ok) {
      refreshData();
      navigate(role === 'admin' ? '/dashboard' : '/student');
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const handleQuickLogin = (selectedRole) => {
    setRole(selectedRole);
    setEmail(selectedRole === 'admin' ? 'admin@placeflow.edu' : 'student@placeflow.edu');
    setPassword(selectedRole === 'admin' ? 'admin123' : 'student123');
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center gap-3 mb-4'>
            <div
              className='w-12 h-12 rounded-xl flex items-center justify-center shadow-lg'
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='white'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
              </svg>
            </div>
          </div>
          <h1 className='text-2xl font-bold text-slate-900 mb-2'>
            <span className='text-slate-700'>Place</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              IQ
            </span>
          </h1>
          <p className='text-slate-500'>Placement Management System</p>
        </div>

        {/* Login Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-slate-100 p-8'>
          <h2 className='text-xl font-semibold text-slate-900 mb-6 text-center'>Sign In</h2>

          {/* Role Selection */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-slate-700 mb-3'>Select Role</label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => handleQuickLogin('admin')}
                className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                  role === 'admin'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className='flex flex-col items-center gap-1'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
                    <line x1='16' y1='2' x2='16' y2='6' />
                    <line x1='8' y1='2' x2='8' y2='6' />
                    <line x1='3' y1='10' x2='21' y2='10' />
                  </svg>
                  Admin / TPO
                </div>
              </button>
              <button
                type='button'
                onClick={() => handleQuickLogin('student')}
                className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                  role === 'student'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className='flex flex-col items-center gap-1'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                    <circle cx='12' cy='7' r='4' />
                  </svg>
                  Student
                </div>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>Email</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-slate-900 placeholder-slate-400'
                placeholder='Enter your email'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>Password</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-slate-900 placeholder-slate-400'
                placeholder='Enter your password'
                required
              />
            </div>

            {error && (
              <div className='bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className='mt-6 pt-6 border-t border-slate-100'>
            <p className='text-xs text-slate-500 text-center mb-3'>Demo Credentials</p>
            <div className='bg-slate-50 rounded-xl p-3 text-xs space-y-2'>
              <div className='flex justify-between'>
                <span className='text-slate-600 font-medium'>Admin:</span>
                <span className='text-slate-500'>admin@placeflow.edu / admin123</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-600 font-medium'>Student:</span>
                <span className='text-slate-500'>student@placeflow.edu / student123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className='text-center text-xs text-slate-400 mt-6'>
          &copy; 2024 PlaceIQ. All rights reserved.
        </p>
      </div>
    </div>
  );
}
