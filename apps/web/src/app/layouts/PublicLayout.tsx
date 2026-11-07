
import { Outlet } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useState } from 'react';

export default function PublicLayout() {

  const navigate = useNavigate();

  const {
    user,
    status,
    isAuthenticated,
    logout,
  } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error('Logout failed: ', error);
    } finally {
      navigate('/login', { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="text-xl font-bold text-slate-900"
          >
            Chợ Giày Cũ
          </Link>

          <div className="flex items-center gap-3">
            {status === 'loading' ? null : isAuthenticated ? (
              <>
                <span className="hidden text-sm font-medium text-slate-700 sm:block">
                  {user?.name}
                </span>

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer style={{ padding: 24 }}>
        © Chợ Giày Cũ
      </footer>
    </>
  );
}
