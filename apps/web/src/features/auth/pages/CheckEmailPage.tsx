
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck } from 'lucide-react';

import { authApi } from '../api/auth.api';
import AuthLayout from '../components/AuthLayout';
import { getApiErrorMessage } from '../../../lib/api-error';

export default function CheckEmailPage() {
  const location = useLocation();

  const [email, setEmail] = useState<string>(
    location.state?.email ?? '',
  );

  const [cooldown, setCooldown] = useState(
    location.state?.email ? 60 : 0,
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setCooldown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function resend() {
    if (loading || cooldown > 0) return;

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result =
        await authApi.resendVerification(
          normalizedEmail,
        );

      setMessage(result.message);
      setCooldown(60);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Kiểm tra email"
      footer={
        <Link to="/login">
          Quay lại đăng nhập
        </Link>
      }
    >
      <div style={{ textAlign: 'center' }}>
        <MailCheck size={64} color="#15803d" className='m-auto' />

        <span className='text-sm'>Xác thực tài khoản
          <br />
          Hãy kiểm tra email và nhấn vào liên kết xác thực tài khoản.
        </span>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Địa chỉ email"
          disabled={loading}
          style={{
            width: '100%',
            fontSize: 14,
            margin: '16px 0',
            textAlign: 'center',
          }}
        />

        <span className='text-sm'>
          Liên kết có hiệu lực trong 15 phút.
          <br />
          Nếu chưa nhận được email, hãy kiểm tra thư mục Spam.
        </span>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: '#15803d' }}>
            {message}
          </p>
        )}

        <button
          className="auth-submit mt-3"
          type="button"
          onClick={() => void resend()}
          disabled={loading || cooldown > 0}
        >
          {loading
            ? 'Đang gửi...'
            : cooldown > 0
              ? `Gửi lại sau ${cooldown}s`
              : 'Gửi lại email xác thực'}
        </button>
      </div>
    </AuthLayout>
  );
}
