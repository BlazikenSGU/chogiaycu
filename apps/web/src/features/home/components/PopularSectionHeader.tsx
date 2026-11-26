import { Link } from 'react-router-dom';

export default function PopularSectionHeader() {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-lg font-bold">
        Most Popular
      </h2>

      <Link
        to="/shop"
        className="text-sm font-semibold"
      >
        See All
      </Link>
    </div>
  );
}