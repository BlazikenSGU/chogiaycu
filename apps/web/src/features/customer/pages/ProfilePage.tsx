import {
    useEffect,
    useState,
    type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import ChangePasswordForm from '../components/ChangePasswordForm';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        if (!editing) {
            setName(user?.name ?? '');
        }
    }, [user?.name, editing]);

    if (!user) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving) return;

        setError('');
        setSuccess('');

        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 100) {
            setError('Họ tên phải từ 2 đến 100 ký tự');
            return;
        }

        setSaving(true);

        try {
            await updateProfile({ name: trimmedName });
            setEditing(false);
            setSuccess('Cập nhật thông tin thành công');
        } catch {
            setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const cancelEditing = () => {
        setName(user.name);
        setEditing(false);
        setError('');
    };

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Thông tin tài khoản
                        </h1>
                        <p className="text-sm text-slate-500">
                            Quản lý thông tin cá nhân của bạn
                        </p>
                    </div>
                </div>

                {success && (
                    <p role="status" className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        {success}
                    </p>
                )}

                {error && (
                    <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                    <div>
                        <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-700">
                            Họ và tên
                        </label>

                        {editing ? (
                            <input
                                id="profile-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                minLength={2}
                                maxLength={100}
                                required
                                disabled={saving}
                                autoComplete="name"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                            />
                        ) : (
                            <p className="rounded-lg bg-slate-50 px-4 py-3 text-slate-900">
                                {user.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">
                            Email
                        </p>
                        <p className="rounded-lg bg-slate-50 px-4 py-3 text-slate-900">
                            {user.email}
                        </p>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">
                            Vai trò
                        </p>
                        <p className="rounded-lg bg-slate-50 px-4 py-3 text-slate-900">
                            {user.role === 'ADMIN'
                                ? 'Quản trị viên'
                                : 'Khách hàng'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
                        {editing ? (
                            <>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>

                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setError('');
                                    setSuccess('');
                                    setEditing(true);
                                }}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Chỉnh sửa thông tin
                            </button>

                        )}

                        <button
                            type="button"
                            onClick={() => setShowChangePassword(true)}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Đổi mật khẩu
                        </button>

                        <Link
                            to="/"
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </form>

                {showChangePassword && (
                    <ChangePasswordForm
                        onCancel={() => setShowChangePassword(false)}
                    />
                )}
            </div>
        </main>
    );
}