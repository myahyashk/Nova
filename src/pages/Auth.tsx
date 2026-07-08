import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'linear-gradient(135deg, #EEF4F9 0%, #FAF7F4 50%, #F7F0E8 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo & branding */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg nova-logo-glow"
              style={{
                background:
                  'linear-gradient(135deg, #EEF4F9 0%, #F7F0E8 100%)',
                border: '2px solid #D7E8F2',
              }}
            >
              <img
                src="/Nova_Logo_Icon.png"
                alt="Nova"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div>
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: '#4A7A9B' }}
              >
                Nova
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#A89585' }}>
                Your productivity workspace
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-nova-tan-100 p-8">
          <h2 className="text-2xl font-bold text-nova-stone mb-6">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nova-stone mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nova-stone-light" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-nova-tan-100 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                  style={{ '--tw-ring-color': '#6B9BBF' } as React.CSSProperties}
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
                  onBlur={(e) => (e.target.style.boxShadow = '')}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-nova-stone mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-nova-stone-light" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-nova-tan-100 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #6B9BBF')}
                  onBlur={(e) => (e.target.style.boxShadow = '')}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #6B9BBF 0%, #C4956A 100%)',
              }}
            >
              {loading ? (
                'Please wait...'
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium transition-colors hover:underline"
              style={{ color: '#6B9BBF' }}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
