
import { useEffect, useRef, useState } from 'react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 6;

const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

type ProductImageUploaderProps = {
    files: File[];
    onChange: (files: File[]) => void;
    disabled?: boolean;
};

type PreviewItem = {
    file: File;
    url: string;
};

export default function ProductImageUploader({
    files,
    onChange,
    disabled = false,
}: ProductImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');
    const [previews, setPreviews] = useState<PreviewItem[]>([]);

    useEffect(() => {
        const items = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setPreviews(items);

        return () => {
            items.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [files]);

    function handleSelect(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const selected = Array.from(event.target.files ?? []);
        event.target.value = '';

        if (selected.length === 0) return;

        setError('');

        // Kiểm tra tổng số ảnh
        if (files.length + selected.length > MAX_IMAGES) {
            setError(
                `Mỗi sản phẩm chỉ được tối đa ${MAX_IMAGES} ảnh. Hiện đã chọn ${files.length} ảnh.`,
            );
            return;
        }

        // Kiểm tra định dạng và dung lượng
        const invalid = selected.find(
            (file) =>
                !ALLOWED_TYPES.includes(file.type) ||
                file.size > MAX_FILE_SIZE,
        );

        if (invalid) {
            setError(
                `Ảnh "${invalid.name}" không hợp lệ. Chỉ hỗ trợ JPG, PNG, WebP tối đa 5MB.`,
            );
            return;
        }

        onChange([...files, ...selected]);
    }

    function removeAt(index: number) {
        onChange(files.filter((_, i) => i !== index));
    }

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                    Hình ảnh sản phẩm
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                    Đã chọn {files.length}/{MAX_IMAGES} ảnh
                </p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={disabled}
                onChange={handleSelect}
                className="hidden"
                aria-label="Chọn ảnh sản phẩm"
            />

            <button
                type="button"
                disabled={disabled || files.length >= MAX_IMAGES}
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <UploadCloud size={30} className="text-gray-500" />

                <span className="mt-3 text-sm font-semibold text-gray-800">
                    Nhấn để chọn hình ảnh sản phẩm
                </span>

                <span className="mt-1 text-xs text-gray-500">
                    JPG, PNG, WebP — tối đa 5MB/ảnh — tối đa 6 ảnh
                </span>

                <span className="mt-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white">
                    <ImagePlus size={15} />
                    Chọn hình ảnh
                </span>
            </button>

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {previews.length > 0 && (
                <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">
                            Ảnh đã chọn ({previews.length})
                        </h4>

                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange([])}
                            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                            Xóa tất cả
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {previews.map((item, index) => (
                            <div
                                key={`${item.file.name}-${index}`}
                                className="relative overflow-hidden rounded-xl border border-gray-200"
                            >
                                <div className="aspect-square bg-gray-100">
                                    <img
                                        src={item.url}
                                        alt={item.file.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => removeAt(index)}
                                    aria-label={`Xóa ${item.file.name}`}
                                    className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    <X size={15} />
                                </button>

                                <p
                                    title={item.file.name}
                                    className="truncate px-2 py-2 text-xs text-gray-600"
                                >
                                    {item.file.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
