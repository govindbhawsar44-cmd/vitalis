import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { user } = await loginUser(username, password);
        onAuthSuccess(user);
        onClose();
      } else {
        const { user } = await registerUser(username, email, password);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-surface-container-lowest/80 backdrop-blur-xl">
      <div className="relative w-full max-w-md rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-space-xl flex flex-col gap-space-lg">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-primary uppercase">CLINICAL IDENTITY ENCLAVE</span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface focus:outline-none">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            {mode === 'login' ? 'Sign In to VITALIS' : 'Create Clinician Profile'}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {mode === 'login'
              ? 'Access your longitudinal telemetry records and past analytical sessions.'
              : 'Register your secure local profile to persist diagnostic sessions.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-0.5 rounded-lg bg-surface-container-high border border-outline-variant/20">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 rounded font-code-md text-code-md transition-all focus:outline-none ${
              mode === 'login' ? 'bg-primary-container text-on-primary font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 rounded font-code-md text-code-md transition-all focus:outline-none ${
              mode === 'register' ? 'bg-primary-container text-on-primary font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            REGISTER
          </button>
        </div>

        {error && (
          <div className="p-space-xs rounded bg-error-container/30 border border-error/40 text-error font-body-sm text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-outline uppercase">
              {mode === 'login' ? 'Username or Email' : 'Username'}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. dr_watson"
              className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm px-space-sm py-space-xs rounded focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
            />
          </div>

          {mode === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-outline uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@vitalis.health"
                className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm px-space-sm py-space-xs rounded focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-outline uppercase">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm px-space-sm py-space-xs rounded focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-space-sm rounded bg-primary-container text-on-primary font-headline-md text-body-md font-bold hover:bg-primary transition-all shadow-lg active:scale-[0.99] focus:outline-none"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Authenticate Session' : 'Register Profile'}
          </button>
        </form>

      </div>
    </div>
  );
};