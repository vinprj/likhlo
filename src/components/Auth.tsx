import { useState } from 'react';

// Inline Supabase client to bypass module resolution issues
const supabaseUrl = 'https://rlpusnjwgqskqyawavpo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscHVzbmp3Z3Fza3F5YXdhdnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3ODg0NTksImV4cCI6MjA4NjM2NDQ1OX0.bdPCZiIKl73m5gCXcl56GWo_mZI96k73ORw9Afpqi9k';

const supabase = {
  auth: {
    signUp: async (opts: { email: string; password: string }) => {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(opts),
      });
      return { data: await res.json(), error: res.ok ? null : new Error(await res.text()) };
    },
    signInWithPassword: async (opts: { email: string; password: string }) => {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(opts),
      });
      const data = await res.json();
      if (!res.ok) return { data: null, error: new Error(data.msg || 'Sign in failed') };
      return { data, error: null };
    },
    signOut: async () => {
      const res = await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
        },
      });
      return { error: res.ok ? null : new Error('Sign out failed') };
    },
    getSession: async () => {
      const res = await fetch(`${supabaseUrl}/auth/v1/session`, {
        headers: { 'apikey': supabaseAnonKey },
      });
      const data = await res.json();
      return { data: { session: data.session }, error: res.ok ? null : new Error('Failed') };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Basic implementation - just return unsubscribe
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
};

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Store session in localStorage
        localStorage.setItem('supabase_session', JSON.stringify(data));
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Likhlo</h1>
          <p className="text-gray-500 dark:text-gray-400">Write it down.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isSignUp
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isSignUp
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
