import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../../../lib/api-error';
import { UserRole } from '../types/auth.types';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
interface LoginLocationState { from?: { pathname?: string; search?: string; hash?: string } }
export default function LoginPage() {
  const navigate = useNavigate(), location = useLocation();
  const { login, status, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true), [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
  const state = location.state as LoginLocationState | null;
  function redirect(role: string) {
    const from = state?.from, path = from?.pathname;
    if (path && path.startsWith('/') && !path.startsWith('//') && path !== '/login' && (role === UserRole.ADMIN || !path.startsWith('/admin'))) return path + (from?.search ?? '') + (from?.hash ?? '');
    return role === UserRole.ADMIN ? '/admin/products' : '/';
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (submitting) return; setError('');
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) { setError('Vui lòng nhập email và mật khẩu.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) { setError('Địa chỉ email không hợp lệ.'); return; }
    setSubmitting(true);
    try { void rememberMe; const result = await login({ email: normalized, password }); navigate(redirect(result.role), { replace: true }); }
    catch (err) { setError(getApiErrorMessage(err)); } finally { setSubmitting(false); }
  }
  if (status === 'loading') return <main className="auth-loading">Đang kiểm tra phiên đăng nhập...</main>;
  if (isAuthenticated && user) return <Navigate to={redirect(user.role)} replace />;
  return <AuthLayout title={<>Login to your<br />Account</>} footer={<>Don't have an account? <Link to="/register">Sign up</Link></>}>
    <form onSubmit={e => void submit(e)} noValidate>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <AuthInput id="login-email" icon={Mail} label="Email" type="email" placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} disabled={submitting} required />
      <AuthInput id="login-password" icon={LockKeyhole} label="Password" type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} disabled={submitting} required />
      <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /><span>Remember me</span></label>
      <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
    </form>
    <p className="auth-forgot">
      <Link to="/forgot-password">
        Forgot the password?
      </Link>
    </p>
  </AuthLayout>;
}
