import HomeHeader from '../components/HomeHeader';
import HomeSearch from '../components/HomeSearch';
import HeroBanner from '../components/HeroBanner';

import BrandSection from '../components/BrandSection';
import CategorySection from '../components/CategorySection';

import PopularSectionHeader from '../components/PopularSectionHeader';
import ProductSection from '../components/ProductSection';

import MobileNavigation from '../components/MobileNavigation';

import { useHomeFilters } from '../hooks/useHomeFilters';

export default function HomePage() {
  const filters = useHomeFilters();

  return (
    <div className="min-h-screen bg-white pb-20 text-[#171717] md:pb-0">
      <div className="mx-auto max-w-7xl px-5 py-7 md:px-8">

        <HomeHeader />

        <HomeSearch
          value={filters.search}
          onChange={filters.setSearch}
        />

        <HeroBanner />

        <BrandSection
          selectedId={filters.brandId}
          onSelect={filters.setBrandId}
        />

        <PopularSectionHeader />

        <CategorySection
          selectedId={filters.categoryId}
          onSelect={filters.setCategoryId}
        />

        <ProductSection
          filters={filters.productQuery}
          isSearching={filters.isSearching}
          onPageChange={filters.setPage}
          onReset={filters.resetFilters}
        />

      </div>

      <MobileNavigation />
    </div>
  );
}