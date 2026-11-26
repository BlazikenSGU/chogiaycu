import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  UserRound,
  Bell,
  Heart,
  LogOut,
} from 'lucide-react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../../auth/hooks/useAuth';

export default function HomeHeader() {
  const {
    user,
    status,
    isAuthenticated,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const displayName =
    user?.name?.trim() ||
    user?.email ||
    'Khách';

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      'pointerdown',
      handleOutsideClick,
    );

    document.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleOutsideClick,
      );

      document.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, [menuOpen]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setMenuOpen(false);

    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="mb-7 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Tài khoản"
            aria-expanded={
              isAuthenticated ? menuOpen : undefined
            }
            onClick={() => {
              if (isAuthenticated) {
                setMenuOpen((previous) => !previous);
              } else {
                navigate('/login');
              }
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200"
          >
            <UserRound size={23} />
          </button>

          {isAuthenticated && menuOpen && (
            <div className="absolute left-0 top-full z-50 mt-3 w-60 rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl">
              <div className="border-b px-3 py-3">
                <p className="truncate text-sm font-semibold">
                  {displayName}
                </p>

                <p className="truncate text-xs text-neutral-500">
                  {user?.email}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-neutral-100"
              >
                <UserRound size={18} />
                Thông tin cá nhân
              </Link>

              <button
                type="button"
                disabled={loggingOut}
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                {loggingOut
                  ? 'Đang đăng xuất...'
                  : 'Đăng xuất'}
              </button>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-neutral-500">
            {isAuthenticated
              ? 'Xin chào 👋'
              : 'Welcome to 👋'}
          </p>

          <h1 className="truncate text-xl font-bold tracking-tight">
            {isAuthenticated
              ? displayName
              : '72Market'}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {status === 'loading' ? (
          <span className="text-xs text-neutral-400">
            Đang kiểm tra...
          </span>
        ) : isAuthenticated ? (
          <>
            <button
              type="button"
              aria-label="Thông báo"
            >
              <Bell size={22} strokeWidth={1.7} />
            </button>

            <button
              type="button"
              aria-label="Yêu thích"
            >
              <Heart size={22} strokeWidth={1.7} />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-full border border-black px-3 py-2.5 text-xs font-semibold sm:px-5 sm:text-sm"
            >
              Đăng nhập
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-black px-3 py-2.5 text-xs font-semibold text-white sm:px-5 sm:text-sm"
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
}