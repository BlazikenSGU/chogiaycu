
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

import { authApi } from '../api/auth.api';
import AuthLayout from '../components/AuthLayout';
import { getApiErrorMessage } from '../../../lib/api-error';

export default function VerifyEmailPage() {
  const [token] = useState(() => {
    const params = new URLSearchParams(
      window.location.hash.slice(1),
    );

    return params.get('token') ?? '';
  });

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >(token ? 'idle' : 'error');

  const [message, setMessage] = useState(
    token ? '' : 'Liên kết xác thực không hợp lệ.',
  );

  async function verify() {
    if (status !== 'idle') return;

    setStatus('loading');

    try {
      const result =
        await authApi.verifyEmail(token);

      setMessage(result.message);
      setStatus('success');

      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname,
      );
    } catch (err) {
      setMessage(getApiErrorMessage(err));
      setStatus('error');
    }
  }

  return (
    <AuthLayout
      title="Xác thực email"
      footer={<Link to="/">Trang chủ</Link>}
    >
      <div style={{ textAlign: 'center' }}>
        {status === 'success' ? (
          <>
            <CheckCircle
              size={64}
              color="#15803d"
            />

            <h2>Xác thực thành công!</h2>

            <p>
              Tài khoản của bạn đã được kích hoạt.
            </p>

            <Link to="/login">
              Đăng nhập ngay
            </Link>
          </>
        ) : status === 'error' ? (
          <>
            <XCircle size={64} color="#dc2626" />

            <h2>Không thể xác thực</h2>

            <p>{message}</p>

            <Link to="/check-email">
              Gửi lại email xác thực
            </Link>
          </>
        ) : (
          <>
            <ShieldCheck
              size={64}
              color="#15803d"
            />

            <p>
              Nhấn nút bên dưới để xác thực tài khoản.
            </p>

            <button
              type="button"
              className="auth-submit"
              onClick={() => void verify()}
              disabled={status === 'loading'}
            >
              {status === 'loading'
                ? 'Đang xác thực...'
                : 'Xác thực tài khoản'}
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
