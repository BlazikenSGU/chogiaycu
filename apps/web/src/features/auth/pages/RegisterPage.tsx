import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../../../lib/api-error';
import './login-page.css';
import './register-page.css';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, status, isAuthenticated, user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        setError('');
        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        if (trimmedName.length < 2 || trimmedName.length > 100) {
            setError('Họ tên phải có từ 2 đến 100 ký tự.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
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
            const registeredUser = await register({ name: trimmedName, email: normalizedEmail, password });
            navigate(registeredUser.role === 'ADMIN' ? '/admin/products' : '/', { replace: true });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    if (status === 'loading') {
        return <div className="login-loading">Đang kiểm tra phiên đăng nhập...</div>;
    }
    if (isAuthenticated && user) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin/products' : '/'} replace />;
    }

    return (
        <main className="login-page">
            <section className="login-shell" aria-label="Đăng ký tài khoản">
                <div className="login-topbar"><Link className="login-back" to="/" aria-label="Quay về trang chủ"><ArrowLeft size={23} strokeWidth={1.8} /></Link></div>
                <div className="login-content register-content">
                    <h1 className="login-title">Create your<br />Account</h1>
                    <form onSubmit={(event) => void handleSubmit(event)} className="register-form">
                        <label className="login-input-wrap"><UserRound size={18} /><span className="sr-only">Họ và tên</span><input type="text" placeholder="Full name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={100} required disabled={submitting} /></label>
                        <label className="login-input-wrap"><Mail size={18} /><span className="sr-only">Email</span><input type="email" placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={submitting} /></label>
                        <label className="login-input-wrap"><LockKeyhole size={18} /><span className="sr-only">Mật khẩu</span><input type={showPassword ? 'text' : 'password'} placeholder="Password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required disabled={submitting} /><button type="button" className="login-eye" disabled={submitting} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword(v => !v)}><>{showPassword ? <Eye size={19} /> : <EyeOff size={19} />}</></button></label>
                        <label className="login-input-wrap"><LockKeyhole size={18} /><span className="sr-only">Xác nhận mật khẩu</span><input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} required disabled={submitting} /><button type="button" className="login-eye" disabled={submitting} aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'} onClick={() => setShowConfirmPassword(v => !v)}>{showConfirmPassword ? <Eye size={19} /> : <EyeOff size={19} />}</button></label>
                        {error && <p className="login-error" role="alert">{error}</p>}
                        <button className="login-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign up'}</button>
                    </form>
                    <div className="login-divider"><span>or continue with</span></div>
                    <div className="login-socials" aria-label="Đăng nhập mạng xã hội (sắp ra mắt)">
                        <span className="login-social" title="Facebook (sắp ra mắt)" aria-label="Facebook (sắp ra mắt)">
                            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1877F2" /><path d="M13.7 20v-7h2.35l.35-2.7h-2.7V8.58c0-.78.22-1.31 1.35-1.31h1.45V4.86a19 19 0 0 0-2.12-.11c-2.1 0-3.54 1.28-3.54 3.63v1.92H8.5V13h2.34v7z" fill="white" /></svg>
                        </span>
                        <span className="login-social" title="Google (sắp ra mắt)" aria-label="Google (sắp ra mắt)">
                            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.35-.18-2H12v3.78h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.3z" /><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.5l-3.23-2.5c-.9.6-2.05.96-3.4.96-2.61 0-4.83-1.76-5.62-4.12H3.05v2.58A10 10 0 0 0 12 22z" /><path fill="#FBBC05" d="M6.38 13.84a6 6 0 0 1 0-3.68V7.58H3.05a10 10 0 0 0 0 8.84z" /><path fill="#EA4335" d="M12 6.04c1.43 0 2.72.49 3.73 1.47l2.8-2.8A9.58 9.58 0 0 0 12 2a10 10 0 0 0-8.95 5.58l3.33 2.58C7.17 7.8 9.39 6.04 12 6.04z" /></svg>
                        </span>
                        <span className="login-social" title="Apple (sắp ra mắt)" aria-label="Apple (sắp ra mắt)">
                            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M17.05 12.54c.02 2.26 1.98 3.01 2 3.02-.02.05-.31 1.1-1.04 2.19-.63.94-1.28 1.87-2.31 1.89-1.01.02-1.34-.6-2.5-.6-1.15 0-1.52.58-2.47.62-1 .04-1.76-1.02-2.39-1.96-1.3-1.93-2.29-5.46-.96-7.83a3.7 3.7 0 0 1 3.1-1.89c.97-.02 1.88.66 2.48.66.6 0 1.72-.81 2.9-.69.5.02 1.9.2 2.8 1.51-.07.05-1.67.97-1.65 3.08zM15.15 6.65c.53-.65.89-1.55.79-2.45-.77.03-1.7.51-2.25 1.15-.49.56-.92 1.48-.8 2.35.86.07 1.74-.44 2.26-1.05z" /></svg>
                        </span>
                    </div>
                    <p className="login-signup">Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </section>
        </main>
    );
}
