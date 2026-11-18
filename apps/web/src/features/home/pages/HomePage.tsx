
import { useState } from 'react';
import {
  Search, SlidersHorizontal, Heart, Bell,
  ShoppingBag,
  Home, UserRound, Package, Menu,
} from 'lucide-react';
import { Link } from 'react-router-dom';
// import api from '../../../lib/api';
// import type {
//   Product,
//   PaginatedProducts,
// } from '../../products/types/product.types';
import { mockProducts } from '../data/mockProducts';
import ProductCard from '../components/ProductCard';

const brandItems = [
  { name: 'Nike', icon: '/icons/brands/nike.svg' },
  { name: 'Adidas', icon: '/icons/brands/adidas.svg' },
  { name: 'Jordan', icon: '/icons/brands/jordan.svg' },
  { name: 'New Balance', icon: '/icons/brands/new-balance.svg' },
  { name: 'Converse', icon: '/icons/brands/converse.svg' },
  { name: 'Vans', icon: '/icons/brands/vans.svg' },
];
import { useAuth } from '../../auth/hooks/useAuth';

const brands = ['Tất cả', ...brandItems.map((item) => item.name)];

export default function HomePage() {
  // const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('Tất cả');

  const { user, status, isAuthenticated } = useAuth();
  const displayName = user?.name?.trim() || user?.email || 'Khách';

  // useEffect(() => {
  //   let active = true;

  //   // api.get<PaginatedProducts>('/products', {
  //   //   params: { page: 1, limit: 24, sort: 'newest' },
  //   // })
  //   //   .then(({ data }) => {
  //   //     if (active) setProducts(data.data);
  //   //   })
  //   //   .catch(() => {
  //   //     if (active) setError(true);
  //   //   })
  //   //   .finally(() => {
  //   //     if (active) setLoading(false);
  //   //   });

  //   return () => { active = false; };
  // }, []);

  // const filtered = useMemo(() => {
  //   return products.filter((product) => {
  //     const matchesSearch = product.name
  //       .toLowerCase()
  //       .includes(search.toLowerCase());

  //     const matchesBrand =
  //       brand === 'Tất cả' ||
  //       product.brand?.name.toLowerCase() === brand.toLowerCase();

  //     return matchesSearch && matchesBrand;
  //   });
  // }, [products, search, brand]);

  return (
    <div className="min-h-screen bg-white pb-20 text-[#171717] md:pb-0">
      <div className="mx-auto max-w-7xl px-5 py-7 md:px-8">


        {/* Welcome */}
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/profile"
                aria-label="Xem hồ sơ cá nhân"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100"
              >
                <UserRound size={23} />
              </Link>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <UserRound size={23} />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs text-neutral-500">
                {isAuthenticated ? 'Xin chào 👋' : 'Welcome to 👋'}
              </p>

              <h1 className="truncate text-xl font-bold tracking-tight">
                {isAuthenticated ? displayName : '86Market'}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {status === 'loading' ? (
              <span className="text-xs text-neutral-400">
                Đang kiểm tra...
              </span>
            ) : isAuthenticated ? (
              <>
                <button
                  type="button"
                  aria-label="Thông báo"
                  className="text-neutral-800"
                >
                  <Bell size={22} strokeWidth={1.7} />
                </button>

                <button
                  type="button"
                  aria-label="Yêu thích"
                  className="text-neutral-800"
                >
                  <Heart size={22} strokeWidth={1.7} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-neutral-800 hover:text-black"
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>


        {/* Search */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[#f5f5f5] px-5 py-4">
            <Search size={19} className="text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm đôi giày bạn yêu thích..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
          <button
            type="button"
            aria-label="Bộ lọc thương hiệu"
            onClick={() => document.getElementById('brands')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-2xl bg-[#f5f5f5] p-4"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Special Offers */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Special Offers</h2>
          <Link to="/shop" className="text-sm font-semibold">
            See All
          </Link>
        </div>

        <section className="relative mb-9 overflow-hidden rounded-[28px] bg-[#eeeeee]">
          <div className="relative z-10 flex min-h-56 w-[62%] flex-col justify-center p-4 md:min-h-80 md:p-12">
            <span className="mb-2 text-2xl font-extrabold tracking-tight md:text-4xl">
              Giày đá bóng
            </span>
            <h2 className="mb-3 text-lg font-bold md:text-2xl">
              Giày new, giày 2hand đều có.
            </h2>
            <p className="mb-5 max-w-xs text-xs text-neutral-600 md:text-sm">
              Xuất phát điểm từ sinh viên, mong muốn có được
              những đôi giày chính hãng giá cả vừa phải để chơi.
            </p>

          </div>
          <img
            src="/images/home/hero-shoes.webp"
            alt="Giày sneaker 86Market"
            className="absolute right-[-6%] bottom-[0%] h-[85%] w-[58%] object-contain md:right-0 md:h-full"
          />
        </section>

        {/* Categories */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Danh mục</h2>
          <Link to="/shop" className="text-sm font-semibold">
            See All
          </Link>
        </div>



        <div className="mb-10 grid grid-cols-4 gap-5 sm:grid-cols-4 md:grid-cols-6">
          {brandItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setBrand(item.name)}
              className="flex flex-col items-center gap-3"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center
          rounded-full transition-all duration-200
          ${brand === item.name
                    ? 'bg-neutral-200 ring-2 ring-black'
                    : 'bg-[#f3f3f3] hover:bg-neutral-200'
                  }`}
              >
                <span
                  role="img"
                  aria-label={item.name}
                  className="block h-7 w-7 bg-[#171717]"
                  style={{
                    maskImage: `url("${item.icon}")`,
                    WebkitMaskImage: `url("${item.icon}")`,
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                  }}
                />
              </span>

              <span className="text-center text-xs font-semibold">
                {item.name}
              </span>
            </button>
          ))}
        </div>



        {/* Most Popular */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Most Popular</h2>
          <Link to="/shop" className="text-sm font-semibold">
            See All
          </Link>
        </div>

        <div id="brands" className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {brands.map((name) => (
            <button
              key={name}
              onClick={() => setBrand(name)}
              className={`shrink-0 rounded-full border border-black px-5 py-2 text-sm font-semibold transition ${brand === name
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
                }`}
            >
              {name}
            </button>
          ))}
        </div>


        {/* Products - Mock data */}
        {(() => {
          const visibleProducts = mockProducts.filter((product) => {
            const matchesBrand =
              brand === 'Tất cả' || product.brand === brand;

            const matchesSearch = product.name
              .toLowerCase()
              .includes(search.trim().toLowerCase());

            return matchesBrand && matchesSearch;
          });

          return visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-neutral-500">
              Chưa có sản phẩm phù hợp.
            </div>
          );
        })()}

      </div>

      {/* Mobile navigation: giao diện minh họa */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 flex justify-around border-t border-neutral-100 bg-white px-3 py-3 md:hidden">
        <Link to="/" className="flex flex-col items-center gap-1 text-black">
          <Home size={21} fill="currentColor" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/shop" className="flex flex-col items-center gap-1 text-neutral-400">
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
        <Menu size={21} className="text-neutral-400" />
      </nav>
    </div>
  );
}
