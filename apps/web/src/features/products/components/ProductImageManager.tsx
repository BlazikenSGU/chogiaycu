import { useEffect, useRef, useState } from 'react';
import { productsApi } from '../api/product.api';
import type { ProductImage } from '../types/product.types';
import { getApiErrorMessage } from '../../../lib/api-error';
import './product-image-manager.css';

interface ProductImageManagerProps {
    productId: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

export default function ProductImageManager({
    productId,
}: ProductImageManagerProps) {
    const [images, setImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [busyImageId, setBusyImageId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadImages() {
            setLoading(true);
            setError('');

            try {
                const product = await productsApi.getById(productId);

                if (!cancelled) {
                    setImages(product.images ?? []);
                }
            } catch (error) {
                if (!cancelled) {
                    setError(getApiErrorMessage(error));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadImages();

        return () => {
            cancelled = true;
        };
    }, [productId]);


    async function refreshImages() {
        const product = await productsApi.getById(productId);
        setImages(product.images ?? []);
    }

    async function handleUpload(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) return;

        setError('');
        setSuccess('');

        const invalid = files.find(
            (file) => !ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE,
        );

        if (invalid) {
            setError(
                `File "${invalid.name}" không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP tối đa 5MB.`,
            );
            event.target.value = '';
            return;
        }

        setUploading(true);

        let uploadedCount = 0;

        try {
            for (const file of files) {
                await productsApi.uploadImage(productId, file);
                uploadedCount++;
            }

            setSuccess(`Đã upoad ${uploadedCount} ảnh thành công`);
        } catch (error) {
            setError(
                `Đã upload ${uploadedCount}/${files.length} ảnh. ` +
                getApiErrorMessage(error),
            );
        } finally {
            try {
                await refreshImages();
            } catch (err) {
                setError(getApiErrorMessage(err));
            }

            setUploading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

    async function handleSetPrimary(imageId: string) {
        setBusyImageId(imageId);
        setError('');
        setSuccess('');

        try {
            await productsApi.setPrimaryImage(productId, imageId);
            await refreshImages();
            setSuccess('Đã cập nhật ảnh đại diện');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusyImageId(null);
        }
    }

    async function handleDelete(image: ProductImage) {
        const confirmed = window.confirm(
            'Bạn có chắc xóa ảnh này? Ảnh có thể bị xóa khỏi ImageKit'
        );

        if (!confirmed) return;
        setBusyImageId(image.id);
        setError('');
        setSuccess('');

        try {
            await productsApi.deleteImage(productId, image.id)
            await refreshImages();
            setSuccess('Đã xóa ảnh thành công');
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setBusyImageId(null);
        }
    }

    const busy = uploading || busyImageId !== null;

    return (
        <section className="product-images-manager">
            <div className="product-images-heading">
                <div>
                    <h2>Hình ảnh sản phẩm</h2>
                    <p>{images.length} hình ảnh</p>
                </div>
            </div>

            {error && (
                <p className="image-manager-error" role="alert">
                    {error}
                </p>
            )}

            {success && (
                <p className="image-manager-success" role="status">
                    {success}
                </p>
            )}

            {loading ? (
                <p>Đang tải hình ảnh...</p>
            ) : (
                <div className="product-images-grid">
                    {images
                        .slice()
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((image) => (
                            <div className="product-image-card" key={image.id}>
                                <div className="product-image-preview">
                                    <img
                                        src={image.url}
                                        alt={image.alt ?? 'Ảnh sản phẩm'}
                                        loading="lazy"
                                    />

                                    {image.isPrimary && (
                                        <span className="primary-image-badge">
                                            Ảnh đại diện
                                        </span>
                                    )}
                                </div>

                                <div className="product-image-actions">
                                    {!image.isPrimary && (
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() =>
                                                void handleSetPrimary(image.id)
                                            }
                                        >
                                            Đặt làm ảnh chính
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="delete-image-btn"
                                        disabled={busy}
                                        onClick={() => void handleDelete(image)}
                                    >
                                        {busyImageId === image.id
                                            ? 'Đang xử lý...'
                                            : 'Xóa'}
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            <div className="product-image-upload">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={busy || loading}
                    onChange={(event) => void handleUpload(event)}
                />

                <p>
                    {uploading
                        ? 'Đang upload hình ảnh...' 
                        : 'Chọn ảnh JPG, PNG hoặc WebP (tối đa 5MB/ảnh)'}
                </p>
            </div>
        </section>
    );
}