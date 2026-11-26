
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import axios from 'axios';

import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../../../lib/api-error';
import { UserRole } from '../types/auth.types';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';

import { isAxiosError } from 'axios';

interface LoginLocationState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

interface RateLimitResponse {
  statusCode?: number;
  message?: string;
  retryAfter?: number;
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, status, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isLocked = remainingSeconds > 0;

  useEffect(() => {
    if (lockedUntil === null) return;

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((lockedUntil - Date.now()) / 1000),
      );

      setRemainingSeconds(remaining);

      if (remaining === 0) {
        setLockedUntil(null);
        setError('');
      }
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [lockedUntil]);

  const state = location.state as LoginLocationState | null;

  function redirect(role: string) {
    const from = state?.from;
    const path = from?.pathname;

    if (
      path &&
      path.startsWith('/') &&
      !path.startsWith('//') &&
      path !== '/login' &&
      (role === UserRole.ADMIN || !path.startsWith('/admin'))
    ) {
      return path + (from?.search ?? '') + (from?.hash ?? '');
    }

    return role === UserRole.ADMIN ? '/admin/products' : '/';
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting || isLocked) return;

    setError('');

    const normalized = email.trim().toLowerCase();

    if (!normalized || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Địa chỉ email không hợp lệ.');
      return;
    }

    setSubmitting(true);

    try {
      void rememberMe;

      const result = await login({
        email: normalized,
        password,
      });

      navigate(redirect(result.role), { replace: true });
    } catch (err) {
      if (
        isAxiosError(err) &&
        err.response?.data?.code === 'EMAIL_NOT_VERIFIED'
      ) {
        navigate('/check-email', {
          state: {
            email: email.trim().toLowerCase(),
          },
        });

        return;
      }

      if (axios.isAxiosError<RateLimitResponse>(err)) {
        const response = err.response;
        const retryAfter = response?.data?.retryAfter;

        if (
          response?.status === 429 &&
          typeof retryAfter === 'number' &&
          Number.isFinite(retryAfter) &&
          retryAfter > 0
        ) {
          const seconds = Math.ceil(retryAfter);

          setRemainingSeconds(seconds);
          setLockedUntil(Date.now() + seconds * 1000);
          setError(
            'Bạn đã nhập sai mật khẩu quá nhiều lần.',
          );
          return;
        }
      }

      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <main className="auth-loading">
        Đang kiểm tra phiên đăng nhập...
      </main>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={redirect(user.role)} replace />;
  }

  return (
    <AuthLayout
      title={<>Login to your<br />Account</>}
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register">Sign up</Link>
        </>
      }
    >
      <form onSubmit={e => void submit(e)} noValidate>
        {error && (
          <div className="auth-error" role="alert">
            {error}

            {isLocked && (
              <div style={{ marginTop: 10 }}>
                <div>Vui lòng thử lại sau:</div>

                <strong
                  style={{
                    display: 'block',
                    marginTop: 6,
                    fontSize: 24,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatCountdown(remainingSeconds)}
                </strong>
              </div>
            )}
          </div>
        )}

        <AuthInput
          id="login-email"
          icon={Mail}
          label="Email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={submitting}
          required
        />

        <AuthInput
          id="login-password"
          icon={LockKeyhole}
          label="Password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={submitting}
          required
        />

        <label className="auth-remember">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={submitting || isLocked}
        >
          {submitting
            ? 'Signing in...'
            : isLocked
              ? `Thử lại sau ${formatCountdown(remainingSeconds)}`
              : 'Sign in'}
        </button>
      </form>

      <p className="auth-forgot">
        <Link to="/forgot-password">
          Forgot the password?
        </Link>
      </p>
    </AuthLayout>
  );
}
