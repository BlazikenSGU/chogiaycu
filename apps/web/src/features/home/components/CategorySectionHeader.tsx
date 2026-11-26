import { Link } from 'react-router-dom';

export default function CategorySectionHeader() {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-lg font-bold">
        Danh mục
      </h2>

      <Link
        to="/shop"
        className="text-sm font-semibold"
      >
        Xem tất cả
      </Link>
    </div>
  );
}