
import { useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  Layers3,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Footprints,
} from 'lucide-react';

import { useAuth } from '../../features/auth/hooks/useAuth';

const menuItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Sản phẩm', path: '/admin/products', icon: Package },
  { label: 'Thương hiệu', path: '/admin/brands', icon: Tags },
  { label: 'Danh mục', path: '/admin/categories', icon: Layers3 },
  { label: 'Đơn hàng', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Khách hàng', path: '/admin/customers', icon: Users },
  { label: 'Thống kê', path: '/admin/analytics', icon: BarChart3 },
];

const availablePaths = [
  '/admin',
  '/admin/products',
  '/admin/brands',
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const currentPage =
    menuItems
      .filter((item) =>
        item.path === '/admin'
          ? location.pathname === '/admin'
          : location.pathname === item.path ||
          location.pathname.startsWith(item.path + '/')
      )
      .sort((a, b) => b.path.length - a.path.length)[0];

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-['Outfit',sans-serif]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px]
          flex-col bg-[#111111] text-white transition-transform
          duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              <Footprints size={22} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider">
                CHOGIAYCU
              </p>
              <p className="text-xs text-gray-400">
                Admin Workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Đóng sidebar"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Quản lý cửa hàng
          </p>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const available = availablePaths.includes(item.path);

              if (!available) {
                return (
                  <div
                    key={item.path}
                    title="Tính năng đang phát triển"
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600"
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3
                    text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-white/10 p-4">
          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600">
            <Settings size={19} />
            <span>Cài đặt</span>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <LogOut size={19} />
            <span>{loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Mở sidebar"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Admin</span>
              <ChevronRight size={15} className="text-gray-400" />
              <span className="font-medium text-black">
                {currentPage?.label ?? 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              title="Thông báo đang phát triển"
              className="text-gray-400"
            >
              <Bell size={19} />
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              AD
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
