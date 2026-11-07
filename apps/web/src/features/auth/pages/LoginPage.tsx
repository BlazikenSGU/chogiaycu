
import { useState, type FormEvent } from 'react';
import {
    Link,
    Navigate,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../../../lib/api-error';
import { UserRole } from '../types/auth.types';

import './login-page.css';

interface LoginLocationState {
    from?: {
        pathname?: string;
        search?: string;
        hash?: string;
    };
}

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login, status, isAuthenticated, user } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const locationState =
        location.state as LoginLocationState | null;

    function getRedirectPath(role: string) {
        const from = locationState?.from;

        const requestedPath = from?.pathname;

        // Chỉ cho phép điều hướng nội bộ.
        if (
            requestedPath &&
            requestedPath.startsWith('/') &&
            !requestedPath.startsWith('//') &&
            requestedPath !== '/login' &&
            (
                role === UserRole.ADMIN ||
                !requestedPath.startsWith('/admin')
            )
        ) {
            return (
                requestedPath +
                (from?.search ?? '') +
                (from?.hash ?? '')
            );
        }

        return role === UserRole.ADMIN
            ? '/admin/products'
            : '/';
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (submitting) return;

        setError('');

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setError('Vui lòng nhập email và mật khẩu.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            setError('Địa chỉ email không hợp lệ.');
            return;
        }

        setSubmitting(true);

        try {
            const authenticatedUser = await login({
                email: normalizedEmail,
                password,
            });

            navigate(
                getRedirectPath(authenticatedUser.role),
                { replace: true },
            );
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    if (status === 'loading') {
        return (
            <div className="login-loading">
                Đang kiểm tra phiên đăng nhập...
            </div>
        );
    }

    if (isAuthenticated && user) {
        return (
            <Navigate
                to={getRedirectPath(user.role)}
                replace
            />
        );
    }

    return (
        <main className="login-page">
            <div className="login-container">
                <Link to="/" className="login-brand">
                    <span className="login-brand-icon">S</span>
                    <span>CHOIGIAYCU.STORE</span>
                </Link>

                <div className="login-card">
                    <div className="login-header">
                        <h1>Đăng nhập</h1>
                        <p>
                            Chào mừng bạn quay lại!
                            Đăng nhập để tiếp tục.
                        </p>
                    </div>

                    <form onSubmit={(event) => void handleSubmit(event)}>
                        {error && (
                            <div
                                className="login-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="login-field">
                            <label htmlFor="login-email">
                                Email
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                disabled={submitting}
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="login-password">
                                Mật khẩu
                            </label>

                            <div className="login-password-wrapper">
                                <input
                                    id="login-password"
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder="Nhập mật khẩu"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    disabled={submitting}
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-toggle-password"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showPassword
                                            ? 'Ẩn mật khẩu'
                                            : 'Hiện mật khẩu'
                                    }
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? 'Ẩn' : 'Hiện'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={submitting}
                        >
                            {submitting
                                ? 'Đang đăng nhập...'
                                : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            Chưa có tài khoản?{' '}
                            <Link to="/register">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="login-copyright">
                    © {new Date().getFullYear()} chogiaycu.store
                </p>
            </div>
        </main>
    );
}
