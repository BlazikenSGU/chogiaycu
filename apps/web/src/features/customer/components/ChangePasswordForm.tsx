import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { authApi } from '../../auth/api/auth.api';
import { useAuth } from '../../auth/hooks/useAuth';

interface ChangePasswordFormProps {
    onCancel: () => void;
}

export default function ChangePasswordForm({
    onCancel,
}: ChangePasswordFormProps) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        if (loading) return;

        setError('');

        if (newPassword !== confirmPassword) {
            setError('Xác nhận mật khẩu không khớp');
            return;
        }

        if (newPassword === currentPassword) {
            setError('Mật khẩu mới phải khác mật khẩu hiện tại');
            return;
        }

        if (new TextEncoder().encode(newPassword).length > 72) {
            setError('Mật khẩu mới vượt quá 72 byte UTF-8');
            return;
        }

        setLoading(true);

        try {
            await authApi.changePassword({
                currentPassword,
                newPassword,
            });

            // Backend đã thu hồi refresh sessions.
            // Xóa trạng thái đăng nhập tại frontend.
            await logout();

            navigate('/login', {
                replace: true,
                state: {
                    message:
                        'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
                },
            });
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                const message = err.response?.data?.message;

                setError(
                    typeof message === 'string'
                        ? message
                        : 'Không thể đổi mật khẩu. Vui lòng thử lại.',
                );
            } else {
                setError(
                    'Không thể đổi mật khẩu. Vui lòng thử lại.',
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={(e) => void handleSubmit(e)}
            className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
            <h2 className="text-lg font-semibold text-slate-900">
                Đổi mật khẩu
            </h2>

            <div>
                <label
                    htmlFor="current-password"
                    className="mb-2 block text-sm font-medium"
                >
                    Mật khẩu hiện tại
                </label>

                <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(e) =>
                        setCurrentPassword(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
            </div>

            <div>
                <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-medium"
                >
                    Mật khẩu mới
                </label>

                <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={newPassword}
                    onChange={(e) =>
                        setNewPassword(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
            </div>

            <div>
                <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium"
                >
                    Xác nhận mật khẩu mới
                </label>

                <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={(e) =>
                        setConfirmPassword(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
            </div>

            {error && (
                <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                >
                    {error}
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading
                        ? 'Đang xử lý...'
                        : 'Đổi mật khẩu'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                    Hủy
                </button>
            </div>
        </form>
    );
}