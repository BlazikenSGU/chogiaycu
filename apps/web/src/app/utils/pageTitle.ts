const pageTitles: Record<string, string> = {
    '/': '72Market',
    '/login': 'Đăng nhập',
    '/register': 'Đăng ký',
    '/forgot-password': 'Quên mật khẩu',
    '/reset-password': 'Đặt lại mật khẩu',
    '/profile': 'Tài khoản của tôi',

    '/admin': 'Quản lý sản phẩm',
    '/admin/products': 'Quản lý sản phẩm',
    '/admin/products/new': 'Thêm sản phẩm',
    '/admin/brands': 'Quản lý thương hiệu',
    '/admin/brands/new': 'Thêm thương hiệu',
    '/admin/categories': 'Quản lý danh mục',
    '/admin/categories/new': 'Thêm danh mục',

    '/check-email': 'Kiểm tra email',
    '/verify-email': 'Xác thực email',
};

export function getPageTitle(pathname: string): string {
    const path = pathname.replace(/\/+$/, '') || '/';

    if (pageTitles[path]) {
        return pageTitles[path];
    }

    if (/^\/admin\/products\/[^/]+\/edit$/.test(path)) {
        return 'Chỉnh sửa sản phẩm';
    }

    return 'Không tìm thấy trang';
}

export function updatePageTitle(pathname: string): void {
    document.title = getPageTitle(pathname);
}