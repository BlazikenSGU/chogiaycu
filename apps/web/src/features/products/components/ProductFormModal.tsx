
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  X,
  PackagePlus,
  Pencil,
  LoaderCircle,
  Save,
  Trash2,
} from 'lucide-react';

import { brandsApi } from '../../brands/api/brand.api';
import { categoriesApi } from '../../categories/api/category.api';
import type { Brand } from '../../brands/types/brand.types';
import type { Category } from '../../categories/types/category.types';
import { getApiErrorMessage } from '../../../lib/api-error';
import { productsApi } from '../api/product.api';

import { ProductStatus } from '../types/product.types';
import type {
  Product,
  ProductImage,
  CreateProductDto,
} from '../types/product.types';
import ProductImageUploader from './ProductImageUploader';

type ProductFormModalProps = {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (data: CreateProductDto, imageFile: File[]) => Promise<void>;
  onPrimaryChange?: (productId: string, imageId: string) => void;
  onImageDeleted?: (productId: string, imageId: string) => void;
};

type FormValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string;
  size: string;
  conditionPercent: string;
  conditionNote: string;
  stock: string;
  status: ProductStatus;
  brandId: string;
  categoryId: string;
};

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getInitialValues(product: Product | null): FormValues {
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    originalPrice:
      product?.originalPrice == null
        ? ''
        : String(product.originalPrice),
    size: product?.size ?? '',
    conditionPercent:
      product?.conditionPercent == null
        ? ''
        : String(product.conditionPercent),
    conditionNote: product?.conditionNote ?? '',
    stock: String(product?.stock ?? 1),
    status: product?.status ?? ProductStatus.DRAFT,
    brandId: product?.brandId ?? '',
    categoryId: product?.categoryId ?? '',
  };
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50';

const labelClass =
  'mb-2 block text-sm font-medium text-gray-700';

export default function ProductFormModal({
  open,
  product = null,
  onClose,
  onSubmit,
  onPrimaryChange,
  onImageDeleted,
}: ProductFormModalProps) {
  const isEditing = product !== null;

  const [values, setValues] = useState<FormValues>(() =>
    getInitialValues(product),
  );

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [optionsLoading, setOptionsLoading] =
    useState<boolean>(false);
  const [optionsError, setOptionsError] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  const [changingPrimaryId, setChangingPrimaryId] = useState<string | null>(null);
  const changingPrimaryRef = useRef(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const deletingImageRef = useRef(false);

  const savingRef = useRef<boolean>(false);
  const closeRef = useRef(onClose);

  const isBusy = saving || deletingImageId !== null || changingPrimaryId !== null;

  function isOperationInProgress() {
    return (
      savingRef.current ||
      deletingImageRef.current ||
      changingPrimaryRef.current
    );
  }

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Reset form when opening or switching products.
  useEffect(() => {
    if (!open) return;

    setValues(getInitialValues(product));
    setSelectedImages([]);
    setExistingImages(product?.images ?? []);
    setError('');
    setSaving(false);
    savingRef.current = false;
  }, [open, product]);

  // Load Brand and Category options.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      setOptionsError('');

      try {
        const [brandData, categoryData] = await Promise.all([
          brandsApi.getAll(),
          categoriesApi.getAll(),
        ]);

        if (cancelled) return;

        setBrands(brandData);
        setCategories(categoryData);
      } catch (err) {
        if (!cancelled) {
          setOptionsError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === 'Escape' &&
        !savingRef.current &&
        !deletingImageRef.current &&
        !changingPrimaryRef.current
      ) {
        closeRef.current();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function setField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSetPrimary(imageId: string) {
    if (!product || isOperationInProgress()) {
      return;
    }

    const currentImage = existingImages.find(
      (image) => image.id === imageId,
    );

    if (!currentImage || currentImage.isPrimary) {
      return;
    }

    changingPrimaryRef.current = true;

    try {
      setChangingPrimaryId(imageId);
      setError('');

      await productsApi.setPrimaryImage(product.id, imageId);

      setExistingImages((previous) =>
        previous.map((image) => ({
          ...image,
          isPrimary: image.id === imageId,
        })),
      );

      onPrimaryChange?.(product.id, imageId);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      changingPrimaryRef.current = false;
      setChangingPrimaryId(null);
    }
  }


  async function handleDeleteImage(imageId: string) {
    if (!product || isOperationInProgress()) {
      return;
    }

    const image = existingImages.find(
      (item) => item.id === imageId,
    );

    if (!image || image.isPrimary) {
      return;
    }

    const confirmed = window.confirm(
      'Ảnh sẽ bị xóa khỏi sản phẩm. File trên ImageKit sẽ được dọn dẹp tự động. Thao tác này không thể hoàn tác.',
    );

    if (!confirmed) return;

    deletingImageRef.current = true;
    setDeletingImageId(imageId);
    setError('');

    try {
      await productsApi.deleteImage(product.id, imageId);

      setExistingImages((previous) =>
        previous.filter((item) => item.id !== imageId),
      );

      // Thông báo cho ProductListPage cập nhật sản phẩm.
      onImageDeleted?.(product.id, imageId);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      deletingImageRef.current = false;
      setDeletingImageId(null);
    }
  }

  function handleClose() {
    if (isOperationInProgress()) return;
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isOperationInProgress()) return;

    setError('');

    const name = values.name.trim();
    const slug = values.slug.trim();
    const size = values.size.trim();

    if (!name || !slug || !size) {
      setError('Vui lòng nhập đầy đủ tên, slug và size.');
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError(
        'Slug chỉ được chứa chữ thường, số và dấu gạch ngang.',
      );
      return;
    }

    if (!values.brandId || !values.categoryId) {
      setError('Vui lòng chọn thương hiệu và danh mục.');
      return;
    }

    const price = Number(values.price);
    const stock = Number(values.stock);

    if (
      !values.price.trim() ||
      !Number.isSafeInteger(price) ||
      price < 0
    ) {
      setError('Giá bán phải là số nguyên không âm.');
      return;
    }

    if (
      !values.stock.trim() ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      setError('Số lượng phải là số nguyên không âm.');
      return;
    }

    const originalPrice = values.originalPrice.trim()
      ? Number(values.originalPrice)
      : undefined;

    if (
      originalPrice !== undefined &&
      (!Number.isSafeInteger(originalPrice) || originalPrice < 0)
    ) {
      setError('Giá gốc phải là số nguyên không âm.');
      return;
    }

    const conditionPercent = values.conditionPercent.trim()
      ? Number(values.conditionPercent)
      : undefined;

    if (
      conditionPercent !== undefined &&
      (!Number.isInteger(conditionPercent) ||
        conditionPercent < 0 ||
        conditionPercent > 100)
    ) {
      setError('Độ mới phải là số nguyên từ 0 đến 100.');
      return;
    }

    const payload: CreateProductDto = {
      name,
      slug,
      description: values.description.trim(),
      price,
      size,
      stock,
      status: values.status,
      brandId: values.brandId,
      categoryId: values.categoryId,
      ...(originalPrice !== undefined && { originalPrice }),
      ...(conditionPercent !== undefined && {
        conditionPercent,
      }),
      conditionNote: values.conditionNote.trim(),
    };

    savingRef.current = true;
    setSaving(true);

    try {
      await onSubmit(payload, selectedImages);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-3">
              {isEditing ? (
                <Pencil size={20} />
              ) : (
                <PackagePlus size={20} />
              )}
            </div>

            <div>
              <h2
                id="product-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {isEditing
                  ? 'Chỉnh sửa sản phẩm'
                  : 'Thêm sản phẩm'}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {isEditing
                  ? 'Cập nhật thông tin giày trong cửa hàng.'
                  : 'Tạo sản phẩm giày cũ mới.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            aria-label="Đóng cửa sổ"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {optionsError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
              >
                Không thể tải thương hiệu hoặc danh mục:{' '}
                {optionsError}
              </div>
            )}

            {/* Section 1 */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-900">
                  1. Thông tin sản phẩm
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Tên, đường dẫn và phân loại sản phẩm.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className={labelClass}>
                    Tên sản phẩm *
                  </span>
                  <input
                    required
                    maxLength={200}
                    disabled={isBusy}
                    value={values.name}
                    onChange={(event) => {
                      const name = event.target.value;

                      setValues((previous) => ({
                        ...previous,
                        name,
                        slug: isEditing
                          ? previous.slug
                          : toSlug(name),
                      }));
                    }}
                    placeholder="Nike Air Jordan 1 Low"
                    className={inputClass}
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className={labelClass}>Slug *</span>
                  <input
                    required
                    maxLength={220}
                    disabled={isBusy}
                    value={values.slug}
                    onChange={(event) =>
                      setField('slug', event.target.value)
                    }
                    placeholder="nike-air-jordan-1-low"
                    className={inputClass}
                  />
                  <span className="mt-1 block text-xs text-gray-400">
                    Khi chỉnh sửa, slug không tự thay đổi theo tên.
                  </span>
                </label>

                <label>
                  <span className={labelClass}>
                    Thương hiệu *
                  </span>
                  <select
                    required
                    value={values.brandId}
                    disabled={isBusy || optionsLoading}
                    onChange={(event) =>
                      setField('brandId', event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className={labelClass}>
                    Danh mục *
                  </span>
                  <select
                    required
                    value={values.categoryId}
                    disabled={isBusy || optionsLoading}
                    onChange={(event) =>
                      setField('categoryId', event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {/* Section 2 */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-900">
                  2. Giá bán và tình trạng
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Giá, kích thước, độ mới và tồn kho.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>
                    Giá bán (VNĐ) *
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    disabled={isBusy}
                    value={values.price}
                    onChange={(event) =>
                      setField('price', event.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className={labelClass}>
                    Giá gốc (VNĐ)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={isBusy}
                    value={values.originalPrice}
                    onChange={(event) =>
                      setField('originalPrice', event.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className={labelClass}>Size *</span>
                  <input
                    required
                    maxLength={20}
                    disabled={isBusy}
                    value={values.size}
                    onChange={(event) =>
                      setField('size', event.target.value)
                    }
                    placeholder="42"
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className={labelClass}>
                    Độ mới (%)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    disabled={isBusy}
                    value={values.conditionPercent}
                    onChange={(event) =>
                      setField('conditionPercent', event.target.value)
                    }
                    placeholder="90"
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className={labelClass}>
                    Số lượng *
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    disabled={isBusy}
                    value={values.stock}
                    onChange={(event) =>
                      setField('stock', event.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className={labelClass}>
                    Trạng thái
                  </span>
                  <select
                    value={values.status}
                    disabled={isBusy}
                    onChange={(event) =>
                      setField(
                        'status',
                        event.target.value as ProductStatus,
                      )
                    }
                    className={inputClass}
                  >
                    <option value={ProductStatus.DRAFT}>
                      Bản nháp
                    </option>
                    <option value={ProductStatus.ACTIVE}>
                      Đang bán
                    </option>
                    <option value={ProductStatus.SOLD_OUT}>
                      Hết hàng
                    </option>
                    <option value={ProductStatus.HIDDEN}>
                      Đã ẩn
                    </option>
                  </select>
                </label>
              </div>
            </section>

            {/* Section 3 */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-900">
                  3. Mô tả và ghi chú
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Thông tin chi tiết về sản phẩm.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className={labelClass}>
                    Mô tả sản phẩm
                  </span>
                  <textarea
                    rows={4}
                    disabled={isBusy}
                    value={values.description}
                    onChange={(event) =>
                      setField('description', event.target.value)
                    }
                    placeholder="Mô tả kiểu dáng, chất liệu..."
                    className={`${inputClass} resize-y`}
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>
                    Ghi chú tình trạng
                  </span>
                  <textarea
                    rows={3}
                    disabled={isBusy}
                    value={values.conditionNote}
                    onChange={(event) =>
                      setField('conditionNote', event.target.value)
                    }
                    placeholder="Đế còn tốt, xước nhẹ..."
                    className={`${inputClass} resize-y`}
                  />
                </label>
              </div>
            </section>

            {/* Section 4 - Product Images */}
            {isEditing && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">
                  4. Hình ảnh hiện tại
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Đã lưu {existingImages.length}/6 ảnh trên ImageKit
                </p>

                {existingImages.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-400">
                    Sản phẩm chưa có hình ảnh.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingImages.map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-xl border border-gray-200"
                      >
                        {/* Vùng ảnh */}
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={image.alt ?? 'Hình ảnh sản phẩm'}
                            className="aspect-square w-full object-cover"
                          />

                          {/* Icon xóa nằm đè trên ảnh */}
                          {!image.isPrimary && (
                            <button
                              type="button"
                              title="Xóa ảnh"
                              aria-label="Xóa ảnh"
                              onClick={() => void handleDeleteImage(image.id)}
                              disabled={isBusy}
                              className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white/60 text-black-500 shadow-sm backdrop-blur-[2px] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingImageId === image.id ? (
                                <LoaderCircle size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} strokeWidth={2} />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Giữ nguyên phần nút Đặt làm đại diện ở dưới ảnh */}
                        <div className="p-2 text-center text-xs">
                          {image.isPrimary ? (
                            <span className="font-semibold text-green-700">
                              ✓ Ảnh đại diện
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void handleSetPrimary(image.id)}
                              disabled={isBusy}
                              className="w-full rounded-lg bg-blue-600 px-2 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {changingPrimaryId === image.id
                                ? 'Đang cập nhật...'
                                : 'Đặt làm đại diện'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(!isEditing || existingImages.length < 6) && (
              <ProductImageUploader
                files={selectedImages}
                onChange={setSelectedImages}
                disabled={isBusy}
                maxImages={6 - (isEditing ? existingImages.length : 0)}
              />
            )}
          </div>

          {/* Fixed footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={
                isBusy ||
                optionsLoading ||
                Boolean(optionsError) ||
                brands.length === 0 ||
                categories.length === 0
              }
              className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {saving
                ? 'Đang lưu...'
                : isEditing
                  ? 'Lưu thay đổi'
                  : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
