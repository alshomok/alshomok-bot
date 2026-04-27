'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/infrastructure/supabase';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Sign in to access your files and chat with AI
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-lg">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={cn(
                  'w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]',
                  'px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]'
                )}
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--card-border)]" />
            <span className="text-xs text-[var(--text-muted)]">or</span>
            <div className="h-px flex-1 bg-[var(--card-border)]" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-[var(--accent)] hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[var(--accent)] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
