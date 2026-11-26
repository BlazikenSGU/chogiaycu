import HomeHeader from '../components/HomeHeader';
import HomeSearch from '../components/HomeSearch';
import HeroBanner from '../components/HeroBanner';

import BrandSection from '../components/BrandSection';
import CategorySection from '../components/CategorySection';

import CategorySectionHeader from '../components/CategorySectionHeader';
import ProductSection from '../components/ProductSection';

import MobileNavigation from '../components/MobileNavigation';

import { useHomeFilters } from '../hooks/useHomeFilters';
import Footer from '../../../components/layout/Footer';

export default function HomePage() {
  const filters = useHomeFilters();

  return (
    <div className="flex min-h-screen flex-col bg-white pb-20 text-[#171717] md:pb-0">
      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-7 md:px-8 mb-3">

        <HomeHeader />

        <HeroBanner />

        <BrandSection
          selectedId={filters.brandId}
          onSelect={filters.setBrandId}
        />

        <CategorySectionHeader />
        <CategorySection
          selectedId={filters.categoryId}
          onSelect={filters.setCategoryId}
        />

        <HomeSearch
          value={filters.search}
          onChange={filters.setSearch}
        />

        <ProductSection
          filters={filters.productQuery}
          isSearching={filters.isSearching}
          onPageChange={filters.setPage}
          onReset={filters.resetFilters}
        />

      </div>
      <Footer />

      <MobileNavigation />
    </div>
  );
}