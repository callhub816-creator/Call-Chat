import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthButtons from './AuthButtons';

const Login: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        setError(error.message || String(error));
        return;
      }
      // If successful, redirect to home
      window.location.pathname = '/';
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Log in</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded"
          />
        </label>

        <label className="block">
          <span className="text-sm">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded"
          />
        </label>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex gap-3 items-center">
          <button type="submit" className="px-4 py-2 bg-pink-500 text-white rounded" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <button type="button" className="px-3 py-2 text-sm" onClick={onBack}>
            Cancel
          </button>
        </div>
      </form>

      <div className="my-4 border-t pt-4">
        <p className="text-sm mb-2">Or sign in with</p>
        <AuthButtons />
      </div>
    </div>
  );
};

export default Login;
