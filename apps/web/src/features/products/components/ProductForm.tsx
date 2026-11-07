import { useState, type FormEvent } from "react";
import { ProductStatus } from "../types/product.types";
import type { CreateProductDto, Product } from '../types/product.types';
import { getApiErrorMessage } from "../../../lib/api-error";

type ProductFormProps = {
    initialValues?: Partial<CreateProductDto> | Product;
    onSubmit: (data: CreateProductDto) => Promise<void>;
    submitLabel?: string;
};

type FormValues = {
    name: string;
    slug: string;
    description: string;
    price: string;
    originalPrice: string;
    size: string;
    conditionPercent: string;
    conditionNote: string,
    stock: string,
    status: ProductStatus,
    brandId: string,
    categoryId: string,
};

function toSlug(value: string) {
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

export default function ProductForm({
    initialValues,
    onSubmit,
    submitLabel = 'Lưu sản phẩm'
}: ProductFormProps) {
    const [values, setValues] = useState<FormValues>({
        name: initialValues?.name ?? '',
        slug: initialValues?.slug ?? '',
        description: initialValues?.description ?? '',
        price: String(initialValues?.price ?? ''),
        originalPrice: String(initialValues?.originalPrice ?? ''),
        size: initialValues?.size ?? '',
        conditionPercent: String(initialValues?.conditionPercent ?? ''),
        conditionNote: initialValues?.conditionNote ?? '',
        stock: String(initialValues?.stock ?? 1),
        status: initialValues?.status ?? ProductStatus.DRAFT,
        brandId: initialValues?.brandId ?? '',
        categoryId: initialValues?.categoryId ?? '',
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    function setField<K extends keyof FormValues>(
        field: K,
        value: FormValues[K],
    ) {
        setValues((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        if (!values.name.trim() || !values.slug.trim()) {
            setError('Vui lòng nhập tên và slug sản phẩm');
            return;
        }

        if (!values.brandId || !values.categoryId) {
            setError('Vui lòng chọn thương hiệu hoặc danh mục');
            return;
        }

        const price = Number(values.price);
        const stock = Number(values.stock);

        if (
            !values.price.trim() ||
            !Number.isSafeInteger(price) ||
            price < 0 ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            setError('Giá và số lượng phải là số nguyên không âm');
            return;
        }

        const payload: CreateProductDto = {
            name: values.name.trim(),
            slug: values.slug.trim(),
            description: values.description.trim(),
            price,
            size: values.size.trim(),
            stock,
            status: values.status,
            brandId: values.brandId,
            categoryId: values.categoryId,
            ...(values.originalPrice.trim() && {
                originalPrice: Number(values.originalPrice),
            }),
            ...(values.conditionPercent.trim() && {
                conditionPercent: Number(values.conditionPercent),
            }),
            ...(values.conditionNote.trim() && {
                conditionNote: values.conditionNote,
            }),
        };

        if (!payload.size) {
            setError('Vui lòng nhập size giày.');
            return;
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
            setError('Slug chỉ được chứa chữ thường, số và dấu gạch ngang.');
            return;
        }

        if (payload.originalPrice !== undefined && (!Number.isSafeInteger(payload.originalPrice) || payload.originalPrice < 0)) {
            setError('Giá gốc phải là số nguyên không âm.');
            return;
        }

        if (
            payload.conditionPercent !== undefined &&
            (!Number.isInteger(payload.conditionPercent) ||
                payload.conditionPercent < 0 ||
                payload.conditionPercent > 100)
        ) {
            setError('Độ mới phải là số nguyên từ 0 đến 100.');
            return;
        }


        try {
            setSaving(true);
            await onSubmit(payload);
        } catch (error) {
            setError(getApiErrorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="product-form">
            {error && <p role="alert" className="error">{error}</p>}

            <label>
                Tên sản phẩm *
                <input
                    required
                    maxLength={200}
                    value={values.name}
                    onChange={(event) => {
                        const name = event.target.value;
                        setField('name', name);

                        if (!initialValues?.slug) {
                            setField('slug', toSlug(name));
                        }
                    }}
                />
            </label>

            <label>
                Slug *
                <input
                    required
                    maxLength={220}
                    value={values.slug}
                    onChange={(event) => setField('slug', event.target.value)}
                />
            </label>

            <label>
                Giá bán (VNĐ) *
                <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={values.price}
                    onChange={(event) => setField('price', event.target.value)}
                />
            </label>

            <label>
                Giá gốc (VNĐ)
                <input
                    type="number"
                    min="0"
                    step="1"
                    value={values.originalPrice}
                    onChange={(event) => setField('originalPrice', event.target.value)}
                />
            </label>

            <label>
                Size *
                <input
                    required
                    maxLength={20}
                    value={values.size}
                    onChange={(event) => setField('size', event.target.value)}
                />
            </label>

            <label>
                Độ mới (%)
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={values.conditionPercent}
                    onChange={(event) => setField('conditionPercent', event.target.value)}
                />
            </label>

            <label>
                Số lượng
                <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={values.stock}
                    onChange={(event) => setField('stock', event.target.value)}
                />
            </label>

            <label>
                Trạng thái
                <select
                    value={values.status}
                    onChange={(event) =>
                        setField('status', event.target.value as ProductStatus)
                    }
                >
                    <option value={ProductStatus.DRAFT}>Bản nháp</option>
                    <option value={ProductStatus.ACTIVE}>Đang bán</option>
                    <option value={ProductStatus.SOLD_OUT}>Hết hàng</option>
                    <option value={ProductStatus.HIDDEN}>Đã ẩn</option>
                </select>
            </label>

            <label>
                Brand ID *
                <input
                    required
                    value={values.brandId}
                    onChange={(event) => setField('brandId', event.target.value)}
                    placeholder="UUID thương hiệu"
                />
            </label>

            <label>
                Category ID *
                <input
                    required
                    value={values.categoryId}
                    onChange={(event) => setField('categoryId', event.target.value)}
                    placeholder="UUID danh mục"
                />
            </label>

            <label>
                Mô tả sản phẩm
                <textarea
                    value={values.description}
                    onChange={(event) => setField('description', event.target.value)}
                />
            </label>

            <label>
                Ghi chú tình trạng
                <textarea
                    value={values.conditionNote}
                    onChange={(event) => setField('conditionNote', event.target.value)}
                />
            </label>

            <div className="product-form-actions">
                <button type="submit" disabled={saving}>
                    {saving ? 'Đang lưu...' : submitLabel}
                </button>
            </div>
        </form>
    );
}