import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

// Điều chỉnh đường dẫn useAuth theo dự án
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, status, isAuthenticated, user } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);

        try {
            const user = await register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            navigate(
                user.role === 'ADMIN' ? '/admin/products' : '/',
                { replace: true },
            );
        } catch (err: unknown) {
            setError(
                'Đăng ký thất bại. Vui lòng kiểm tra thông tin hoặc thử email khác.',
            );
        } finally {
            setLoading(false);
        }
    }

    if (status === 'loading') {
        return <div className="p-10 text-center">Đang kiểm tra phiên đăng nhập...</div>;
    }

    if (isAuthenticated && user) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin/products' : '/'} replace />;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-center text-2xl font-bold text-slate-900">
                    Tạo tài khoản
                </h1>

                <p className="mt-2 text-center text-sm text-slate-500">
                    Tham gia Chợ Giày Cũ ngay hôm nay
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block text-sm font-medium">
                            Họ và tên
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="example@gmail.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="Tối thiểu 8 ký tự"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="Nhập lại mật khẩu"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </main>
    );
}
