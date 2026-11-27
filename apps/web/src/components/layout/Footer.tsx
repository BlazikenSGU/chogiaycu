import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#171717] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* Brand */}
          <div>
            <Link
              to="/"
              className="text-2xl font-extrabold tracking-tight"
            >
              72Market
            </Link>

            <p className="mt-4 text-sm leading-7 text-neutral-400">
              Giày chính hãng – Giá trị thật.
              Nơi kết nối những người đam mê bóng đá
              với những đôi giày chất lượng,
              phù hợp túi tiền.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">
              Khám phá
            </h3>

            <div className="flex flex-col gap-3 text-sm text-neutral-400">
              <Link
                to="/"
                className="transition hover:text-white"
              >
                Trang chủ
              </Link>

              <a
                href="/#products"
                className="transition hover:text-white"
              >
                Sản phẩm
              </a>

              <a
                href="/#brands"
                className="transition hover:text-white"
              >
                Thương hiệu
              </a>
              <Link
                to="/portfolio"
                className="transition hover:text-white"
              >
                About Developer
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">
              Tài khoản
            </h3>

            <div className="flex flex-col gap-3 text-sm text-neutral-400">
              <Link
                to="/login"
                className="transition hover:text-white"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="transition hover:text-white"
              >
                Đăng ký
              </Link>

              <Link
                to="/profile"
                className="transition hover:text-white"
              >
                Thông tin cá nhân
              </Link>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-neutral-700 pt-6">
          <p className="text-center text-xs text-neutral-400">
            © {currentYear} 72Market. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}