
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function AdminLayout() {

  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = async () => {

    try {
      await logout();
    } catch (error) {
      console.log('Logout failed:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <h1 className='font-semibold text-gray-900'>
          Chợ Giày Cũ - Admin
        </h1>

        <button type='button' onClick={() => void handleLogout()} className='flex items-center gap-2 rounded-lg border-gray-200 border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100'>
          Đăng xuất
        </button>
      </header>

      <div style={{ display: 'flex' }}>
        <aside style={{
          width: 220,
          padding: 24,
          borderRight: '1px solid #e5e7eb',
        }}>
          <nav>
            <NavLink to="/admin/products">
              Quản lý sản phẩm
            </NavLink>
          </nav>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </div>
      </div>

    </div>
  );
}
