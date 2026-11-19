
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import { authApi } from '../api/auth.api';
import { getApiErrorMessage } from '../../../lib/api-error';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (submitting) return;

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
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
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

                    <Link className="auth-submit auth-action-link" to="/login">
                        Back to login
                    </Link>
                </div>
            ) : (
                <form onSubmit={e => void submit(e)} noValidate>
                    <p className="auth-help">
                        Nhập email đã đăng ký tài khoản 86Market.
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
                        onChange={e => setEmail(e.target.value)}
                        disabled={submitting}
                        required
                    />

                    {error && (
                        <p className="auth-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
}
