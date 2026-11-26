
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
              className='m-auto'
            />

            <span className='text-sm'>
              Xác thực thành công!
              <br />
              Tài khoản của bạn đã được kích hoạt.
            </span>


            <Link to="/login">
              Đăng nhập ngay
            </Link>
          </>
        ) : status === 'error' ? (
          <>
            <XCircle size={64} color="#dc2626" className='m-auto' />

            <span className='text-sm'>
              Không thể xác thực
              <br />
              {message}
              <br />
            </span>

            <Link to="/check-email" className='text-sm text-red-500'>
              Gửi lại email xác thực
            </Link>
          </>
        ) : (
          <>
            <ShieldCheck
              size={64}
              color="#15803d"
              className='m-auto'
            />

            <span className='text-sm'>
              Nhấn nút bên dưới để xác thực tài khoản.
            </span>

            <button
              type="button"
              className="auth-submit mt-3"
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
    </AuthLayout >
  );
}
