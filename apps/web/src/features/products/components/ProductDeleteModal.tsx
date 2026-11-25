import { useEffect, useRef } from 'react';
import {
    AlertTriangle,
    Loader2,
    Trash2,
} from 'lucide-react';

import type { Product } from '../types/product.types';

interface ProductDeleteModalProps {
    product: Product | null;
    deleting: boolean;
    error: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ProductDeleteModal({
    product,
    deleting,
    error,
    onClose,
    onConfirm,
}: ProductDeleteModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        if (product && !dialog.open) {
            dialog.showModal();
        } else if (!product && dialog.open) {
            dialog.close();
        }
    }, [product]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="delete-product-title"
            aria-describedby="delete-product-description"
            onCancel={(event) => {
                event.preventDefault();

                if (!deleting) {
                    onClose();
                }
            }}
            className="
                fixed inset-0 m-auto
                w-[calc(100%-2rem)] max-w-md
                rounded-2xl border-0
                bg-white p-0 shadow-xl
                backdrop:bg-black/50
            "
        >
            {product && (
                <div className="p-6">

                    {/* Warning icon */}
                    <div className="
                        mb-4 flex h-12 w-12
                        items-center justify-center
                        rounded-full bg-red-100
                        text-red-600
                    ">
                        <AlertTriangle size={24} />
                    </div>

                    {/* Title */}
                    <h2
                        id="delete-product-title"
                        className="text-xl font-bold text-gray-900"
                    >
                        Xóa sản phẩm
                    </h2>

                    {/* Description */}
                    <p
                        id="delete-product-description"
                        className="mt-3 text-sm leading-6 text-gray-600"
                    >
                        Bạn có chắc chắn muốn xóa sản phẩm{' '}
                        <span className="font-semibold text-gray-900">
                            {product.name}
                        </span>
                        {' '}không?
                    </p>

                    {/* Warning message */}
                    <div className="
                        mt-4 rounded-xl border
                        border-red-100 bg-red-50
                        p-3 text-sm leading-6
                        text-red-600
                    ">
                        Sản phẩm và toàn bộ hình ảnh liên quan
                        sẽ được xóa vĩnh viễn.
                        Hành động này không thể hoàn tác.
                    </div>

                    {/* API error */}
                    {error && (
                        <div
                            role="alert"
                            className="
                                mt-4 rounded-xl border
                                border-red-200 bg-red-50
                                p-3 text-sm text-red-600
                            "
                        >
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="
                        mt-6 flex items-center
                        justify-end gap-3
                    ">
                        <button
                            type="button"
                            autoFocus
                            onClick={onClose}
                            disabled={deleting}
                            className="
                                rounded-xl border
                                border-gray-200
                                px-4 py-2.5
                                text-sm font-medium
                                text-gray-700
                                hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            Hủy bỏ
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={deleting}
                            className="
                                flex items-center gap-2
                                rounded-xl bg-red-600
                                px-4 py-2.5
                                text-sm font-medium
                                text-white
                                transition hover:bg-red-700
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {deleting ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Đang xóa...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Xóa sản phẩm
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </dialog>
    );
}