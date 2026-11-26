import { Link } from 'react-router-dom';

interface Props {
  title: string;
  viewAllTo?: string;
}

export default function SectionHeader({
  title,
  viewAllTo,
}: Props) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-lg font-bold">
        {title}
      </h2>

      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="text-sm font-semibold hover:underline"
        >
          Xem tất cả
        </Link>
      )}
    </div>
  );
}