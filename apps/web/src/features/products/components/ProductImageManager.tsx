import { useEffect, useRef, useState } from 'react';
import { productsApi } from '../api/product.api';
import type { ProductImage } from '../types/product.types';
import { getApiErrorMessage } from '../../../lib/api-error';
import {
    UploadCloud,
    ImagePlus,
    ImageOff,
    Star,
    Trash2,
    LoaderCircle,
    X,
} from 'lucide-react';

interface ProductImageManagerProps {
    productId: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

type PreviewImage = {
    id: string;
    file: File;
    previewUrl: string;
};

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
    const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
    const previewImagesRef = useRef<PreviewImage[]>([]);

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

    function updatePreviewImages(nextImages: PreviewImage[]) {
        const removedImages = previewImagesRef.current.filter(
            (oldImage) =>
                !nextImages.some((image) => image.id === oldImage.id),
        );

        removedImages.forEach((image) => {
            URL.revokeObjectURL(image.previewUrl);
        });

        previewImagesRef.current = nextImages;
        setPreviewImages(nextImages);
    }

    function handleSelectImages(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) return;

        setError('');
        setSuccess('');

        const invalidFile = files.find(
            (file) =>
                !ALLOWED_TYPES.includes(file.type) ||
                file.size > MAX_FILE_SIZE,
        );

        if (invalidFile) {
            setError(
                `Ảnh "${invalidFile.name}" không hợp lệ. Chỉ hỗ trợ JPG, PNG, WebP tối đa 5MB.`,
            );
            event.target.value = '';
            return;
        }

        const newImages: PreviewImage[] = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        updatePreviewImages([
            ...previewImagesRef.current,
            ...newImages,
        ]);

        event.target.value = '';
    }

    function handleRemovePreview(imageId: string) {
        updatePreviewImages(
            previewImagesRef.current.filter(
                (image) => image.id !== imageId,
            ),
        );
    }

    useEffect(() => {
        return () => {
            previewImagesRef.current.forEach((image) => {
                URL.revokeObjectURL(image.previewUrl);
            });

            previewImagesRef.current = [];
        };
    }, []);


    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        Hình ảnh sản phẩm
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                        {images.length} hình ảnh
                    </p>
                </div>
                <ImagePlus size={22} className="text-gray-400" />
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                    {success}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                    <LoaderCircle size={18} className="animate-spin" />
                    Đang tải hình ảnh...
                </div>
            ) : images.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
                    <ImageOff size={30} className="text-gray-400" />
                    <p className="mt-3 text-sm font-medium text-gray-700">
                        Chưa có hình ảnh
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        Tải ảnh sản phẩm lên để bắt đầu.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {images
                        .slice()
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((image) => (
                            <div
                                key={image.id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                            >
                                <div className="relative aspect-square bg-gray-100">
                                    <img
                                        src={image.url}
                                        alt={image.alt ?? 'Ảnh sản phẩm'}
                                        loading="lazy"
                                        className="h-full w-full object-cover"
                                    />

                                    {image.isPrimary && (
                                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-black px-2 py-1 text-xs font-medium text-white">
                                            <Star size={12} />
                                            Ảnh chính
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 p-3">
                                    {!image.isPrimary && (
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() =>
                                                void handleSetPrimary(image.id)
                                            }
                                            className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <Star size={14} />
                                            Đặt ảnh chính
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() =>
                                            void handleDelete(image)
                                        }
                                        className="flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {busyImageId === image.id ? (
                                            <LoaderCircle
                                                size={14}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                        Xóa ảnh
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}


            <div className="mt-5 space-y-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={busy || loading}
                    onChange={handleSelectImages}
                    className="hidden"
                    aria-label="Chọn ảnh sản phẩm"
                />

                <button
                    type="button"
                    disabled={busy || loading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <UploadCloud size={30} className="text-gray-500" />

                    <span className="mt-3 text-sm font-semibold text-gray-800">
                        Nhấn để tải hình ảnh sản phẩm
                    </span>

                    <span className="mt-1 text-xs text-gray-500">
                        JPG, PNG, WebP — tối đa 5MB mỗi ảnh
                    </span>

                    <span className="mt-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white">
                        <ImagePlus size={15} />
                        Chọn hình ảnh
                    </span>
                </button>

                {previewImages.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-800">
                                Ảnh đã chọn ({previewImages.length})
                            </h4>

                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => updatePreviewImages([])}
                                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                            >
                                Xóa tất cả
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {previewImages.map((image) => (
                                <div
                                    key={image.id}
                                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                                >
                                    <div className="aspect-square bg-gray-100">
                                        <img
                                            src={image.previewUrl}
                                            alt={image.file.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => handleRemovePreview(image.id)}
                                        aria-label={`Xóa ${image.file.name}`}
                                        className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white hover:bg-red-600 disabled:opacity-50"
                                    >
                                        <X size={15} />
                                    </button>

                                    <p
                                        title={image.file.name}
                                        className="truncate px-2 py-2 text-xs text-gray-600"
                                    >
                                        {image.file.name}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-500">
                            Ảnh đang được lưu tạm trên trình duyệt, chưa tải lên ImageKit.
                        </p>
                    </div>
                )}
            </div>

        </section>
    );
}
