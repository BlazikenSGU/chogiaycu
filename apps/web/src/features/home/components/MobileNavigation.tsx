import {
  Home,
  ShoppingBag,
  Package,
  UserRound,
  Menu,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import { useAuth } from '../../auth/hooks/useAuth';

export default function MobileNavigation() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-neutral-100 bg-white px-3 py-3 md:hidden">
      <Link
        to="/"
        className="flex flex-col items-center gap-1 text-black"
      >
        <Home size={21} fill="currentColor" />
        <span className="text-[10px]">Home</span>
      </Link>

      <Link
        to="/shop"
        className="flex flex-col items-center gap-1 text-neutral-400"
      >
        <ShoppingBag size={21} />
        <span className="text-[10px]">Shop</span>
      </Link>

      <span className="flex flex-col items-center gap-1 text-neutral-400">
        <Package size={21} />
        <span className="text-[10px]">Orders</span>
      </span>

      <Link
        to={isAuthenticated ? '/profile' : '/login'}
        className="flex flex-col items-center gap-1 text-neutral-400"
      >
        <UserRound size={21} />
        <span className="text-[10px]">Profile</span>
      </Link>

      <Menu
        size={21}
        className="text-neutral-400"
      />
    </nav>
  );
}