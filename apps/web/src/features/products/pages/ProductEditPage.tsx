
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ProductForm from '../components/ProductForm';
import { productsApi } from '../api/product.api';
import { getApiErrorMessage } from '../../../lib/api-error';
import ProductImageManager from '../components/ProductImageManager';

import type {
  Product,
  CreateProductDto,
} from '../types/product.types';

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Thiếu ID sản phẩm.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError('');

        const result = await productsApi.getById(id!);

        if (!cancelled) {
          setProduct(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleUpdate(data: CreateProductDto) {
    if (!id) return;

    await productsApi.update(id, data);
    navigate('/admin/products');
  }

  if (loading) {
    return <p>Đang tải sản phẩm...</p>;
  }

  if (error) {
    return <p role="alert" className="error">{error}</p>;
  }

  if (!product) {
    return <p>Không tìm thấy sản phẩm.</p>;
  }

  return (
    <main className="products-page">
      <h1>Chỉnh sửa sản phẩm</h1>

      <ProductForm
        key={product.id}
        initialValues={product}
        onSubmit={handleUpdate}
        submitLabel="Lưu thay đổi"
      />

      <ProductImageManager productId={product.id} />
    </main>
  );
}
