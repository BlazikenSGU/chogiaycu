
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import { authApi } from '../api/auth.api';
import { getApiErrorMessage } from '../../../lib/api-error';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const validToken = /^[a-f0-9]{64}$/i.test(token);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (submitting) return;

        setError('');

        if (
            password.length < 8 ||
            password.length > 72 ||
            new TextEncoder().encode(password).length > 72
        ) {
            setError(
                'Mật khẩu phải từ 8 đến 72 ký tự và không vượt quá 72 byte UTF-8.',
            );
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setSubmitting(true);

        try {
            await authApi.resetPassword({
                token,
                newPassword: password,
                confirmPassword,
            });

            setSuccess(true);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title={<>Reset your<br />Password</>}
            footer={
                <>
                    Remember your password?{' '}
                    <Link to="/login">Sign in</Link>
                </>
            }
        >
            {!validToken ? (
                <div>
                    <p className="auth-error" role="alert">
                        Liên kết đặt lại mật khẩu không hợp lệ.
                    </p>

                    <Link
                        className="auth-submit auth-action-link"
                        to="/forgot-password"
                    >
                        Request a new link
                    </Link>
                </div>
            ) : success ? (
                <div role="status">
                    <p className="auth-success">
                        Đặt lại mật khẩu thành công!
                        Bạn có thể đăng nhập bằng mật khẩu mới.
                    </p>

                    <Link
                        className="auth-submit auth-action-link"
                        to="/login"
                    >
                        Sign in now
                    </Link>
                </div>
            ) : (
                <form onSubmit={e => void submit(e)} noValidate>
                    <p className="auth-help">
                        Tạo mật khẩu mới cho tài khoản 86Market.
                        Mật khẩu cần có ít nhất 8 ký tự.
                    </p>

                    <AuthInput
                        id="reset-password"
                        icon={LockKeyhole}
                        label="New password"
                        type="password"
                        placeholder="New password"
                        autoComplete="new-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={submitting}
                        minLength={8}
                        required
                    />

                    <AuthInput
                        id="reset-confirm-password"
                        icon={LockKeyhole}
                        label="Confirm new password"
                        type="password"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        disabled={submitting}
                        minLength={8}
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
                        {submitting ? 'Updating...' : 'Reset password'}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
}
