import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../../../lib/api-error';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
export default function RegisterPage() {
  const navigate = useNavigate(); const { register, status, isAuthenticated, user } = useAuth();
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError('');

    const n = name.trim(), em = email.trim().toLowerCase();

    if (n.length < 2 || n.length > 100) {
      setError('Họ tên phải có từ 2 đến 100 ký tự.');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError('Địa chỉ email không hợp lệ.');
      return;
    }

    if (password.length < 8 || password.length > 72 || new TextEncoder().encode(password).length > 72) {
      setError('Mật khẩu phải có ít nhất 8 ký tự và không vượt quá 72 byte UTF-8.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await register({ name: n, email: em, password });
      navigate('/check-email', {
        replace: true,
        state: {
          email: result.email,
        },
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }
  if (status === 'loading') return <main className="auth-loading">Đang kiểm tra phiên đăng nhập...</main>;
  if (isAuthenticated && user) return <Navigate to={user.role === 'ADMIN' ? '/admin/products' : '/'} replace />;
  return <AuthLayout title={<>Create your<br />Account</>} footer={<>Already have an account? <Link to="/login">Sign in</Link></>}>
    <form onSubmit={e => void submit(e)} noValidate>
      <AuthInput id="register-name" icon={UserRound} label="Họ và tên" placeholder="Full name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={100} required disabled={submitting} />
      <AuthInput id="register-email" icon={Mail} label="Email" type="email" placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={submitting} />
      <AuthInput id="register-password" icon={LockKeyhole} label="Password" type="password" placeholder="Password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required disabled={submitting} />
      <AuthInput id="register-confirm" icon={LockKeyhole} label="Confirm password" type="password" placeholder="Confirm password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} required disabled={submitting} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-submit auth-register-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign up'}</button>
    </form>
  </AuthLayout>;
}
