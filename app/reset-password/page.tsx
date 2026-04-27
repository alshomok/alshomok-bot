'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/infrastructure/supabase';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a session (user clicked valid reset link)
    const checkSession = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Invalid or expired link
        setIsValidLink(false);
      }
    };

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const supabase = createBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  }

  if (!isValidLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
            Invalid or expired link
          </h1>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            This password reset link has expired or is invalid. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Set new password
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Enter your new password below
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-lg">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <svg
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-medium text-[var(--text-primary)]">
                Password updated!
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Your password has been successfully reset. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]',
                    'px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                    'focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]'
                  )}
                  required
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]',
                    'px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                    'focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]'
                  )}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full rounded-xl bg-[var(--accent)] py-3 font-medium text-white',
                  'transition-all duration-200',
                  'hover:bg-[var(--accent-hover)]',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
