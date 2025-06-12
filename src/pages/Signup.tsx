import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass-container">
        <h2 className="glass-title mb-6">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full mt-1"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="glass-send w-full mt-2"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-300">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-300 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
