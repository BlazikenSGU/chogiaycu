
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import axios from 'axios';

import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import { authApi } from '../api/auth.api';
import { getApiErrorMessage } from '../../../lib/api-error';

type ForgotRateLimitCode =
  | 'FORGOT_COOLDOWN'
  | 'FORGOT_DAILY_EMAIL_LIMIT'
  | 'FORGOT_DAILY_IP_LIMIT';

interface RateLimitResponse {
  statusCode?: number;
  code?: ForgotRateLimitCode;
  message?: string;
  retryAfter?: number;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours} giờ ${String(minutes).padStart(2, '0')} phút`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [limitCode, setLimitCode] =
    useState<ForgotRateLimitCode | null>(null);

  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const isLocked = remaining > 0;

  useEffect(() => {
    if (lockedUntil === null) return;

    const updateCountdown = () => {
      const seconds = Math.max(
        0,
        Math.ceil((lockedUntil - Date.now()) / 1000),
      );

      setRemaining(seconds);

      if (seconds === 0) {
        setLockedUntil(null);
        setLimitCode(null);
        setError('');
      }
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [lockedUntil]);

  function startCountdown(seconds: number) {
    const duration = Math.max(1, Math.ceil(seconds));

    setRemaining(duration);
    setLockedUntil(Date.now() + duration * 1000);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting || isLocked) return;

    setError('');

    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Địa chỉ email không hợp lệ.');
      return;
    }

    setSubmitting(true);

    try {
      await authApi.forgotPassword(normalized);

      setSuccess(true);
      setLimitCode('FORGOT_COOLDOWN');

      // Cooldown dự kiến sau một request thành công.
      // Backend vẫn là nguồn xác thực cuối cùng.
      startCountdown(60);
    } catch (err) {
      if (axios.isAxiosError<RateLimitResponse>(err)) {
        const response = err.response;
        const data = response?.data;

        if (
          response?.status === 429 &&
          typeof data?.retryAfter === 'number' &&
          Number.isFinite(data.retryAfter) &&
          data.retryAfter > 0
        ) {
          setSuccess(false);
          setLimitCode(data.code ?? null);
          setError(
            getApiErrorMessage(err),
          );

          startCountdown(data.retryAfter);
          return;
        }
      }

      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function changeEmail(value: string) {
    setEmail(value);
    setError('');
    setSuccess(false);

    // Giới hạn theo email cũ không được áp dụng
    // nhầm cho email mới trên giao diện.
    setLockedUntil(null);
    setRemaining(0);
    setLimitCode(null);
  }

  return (
    <AuthLayout
      title={<>Forgot your<br />Password?</>}
      footer={
        <>
          Remember your password?{' '}
          <Link to="/login">Sign in</Link>
        </>
      }
    >
      {success ? (
        <div role="status">
          <p className="auth-success">
            Nếu email đã đăng ký, bạn sẽ nhận được
            hướng dẫn đặt lại mật khẩu.
          </p>

          <p className="auth-help">
            Vui lòng kiểm tra hộp thư đến hoặc thư rác.
            Liên kết có hiệu lực trong 15 phút.
          </p>

          {isLocked && (
            <p className="auth-help">
              Có thể gửi lại sau:{' '}
              <strong>{formatTime(remaining)}</strong>
            </p>
          )}

          <button
            className="auth-submit"
            type="button"
            disabled={isLocked}
            onClick={() => setSuccess(false)}
          >
            {isLocked
              ? `Gửi lại sau ${formatTime(remaining)}`
              : 'Gửi lại yêu cầu'}
          </button>

          <p className="auth-forgot">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={e => void submit(e)} noValidate>
          <p className="auth-help">
            Nhập email đã đăng ký tài khoản 72Market.
            Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>

          <AuthInput
            id="forgot-email"
            icon={Mail}
            label="Email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={e => changeEmail(e.target.value)}
            disabled={submitting}
            required
          />

          {error && (
            <div className="auth-error" role="alert">
              <p>{error}</p>

              {isLocked && (
                <div style={{ marginTop: 10 }}>
                  <strong>
                    {limitCode === 'FORGOT_COOLDOWN'
                      ? 'Thời gian chờ gửi lại:'
                      : 'Thời gian còn lại:'}
                  </strong>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      marginTop: 6,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatTime(remaining)}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={submitting || isLocked}
          >
            {submitting
              ? 'Sending...'
              : isLocked
                ? `Thử lại sau ${formatTime(remaining)}`
                : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
