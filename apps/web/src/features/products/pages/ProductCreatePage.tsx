
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { productsApi } from '../api/product.api';
import type { CreateProductDto } from '../types/product.types';

export default function ProductCreatePage() {
  const navigate = useNavigate();

  async function handleCreate(data: CreateProductDto) {
    const product = await productsApi.create(data);
    navigate(`/admin/products/${product.id}/edit`, {
      replace: true,
    });
  }

  return (
    <main className="products-page">
      <h1>Thêm sản phẩm</h1>
      <p>Tạo sản phẩm giày cũ mới.</p>

      <ProductForm
        onSubmit={handleCreate}
        submitLabel="Tạo sản phẩm"
      />
    </main>
  );
}
