import React, { useState, useRef } from 'react';
import { X, Lock, Mail, User, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser, loginAsGuest, showToast } = useApp();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isAuthModalOpen);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (mode === 'reset') {
      showToast(`Password reset link sent to ${email}`);
      setMode('signin');
      return;
    }

    loginUser(email, name || undefined);
    setIsAuthModalOpen(false);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="auth-modal-panel"
      >
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] mx-auto flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h2 id="auth-modal-title" className="font-heading font-bold text-2xl text-[var(--color-text-primary)]">
            {mode === 'signin' && 'Sign in to Bookshelf'}
            {mode === 'signup' && 'Create your Bookshelf account'}
            {mode === 'reset' && 'Reset your password'}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
            {mode === 'signin' && 'Welcome back to your curated sanctuary for reading.'}
            {mode === 'signup' && 'Save your library, goals, and reflections permanently across devices.'}
            {mode === 'reset' && "We'll send you instructions to reset your password."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name-input" className="block font-medium text-[var(--color-text-primary)] mb-1">
                Your Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-[var(--color-text-tertiary)]" />
                <input
                  id="auth-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email-input" className="block font-medium text-[var(--color-text-primary)] mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-[var(--color-text-tertiary)]" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@bookshelf.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="auth-password-input" className="font-medium text-[var(--color-text-primary)]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[11px] text-[var(--color-accent)] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-[var(--color-text-tertiary)]" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)] font-semibold text-xs transition-colors shadow-xs mt-2"
          >
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)] space-y-2">
          {mode === 'signin' && (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[var(--color-accent)] font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[var(--color-accent)] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-[var(--color-accent)] font-semibold hover:underline"
            >
              Back to sign in
            </button>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                loginAsGuest();
                setIsAuthModalOpen(false);
              }}
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] text-[11px]"
            >
              Continue in Guest Mode (45 curated books)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
