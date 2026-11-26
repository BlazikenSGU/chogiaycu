import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    message?: string;
    onRetry: () => void;
}

export default function ErrorState({
    message = 'Không thể tải dữ liệu',
    onRetry,
}: Props) {
    return (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle
                size={32}
                className="text-neutral-500"
            />

            <p className="text-sm text-neutral-600">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm"
            >
                <RefreshCw size={15} />
                Thử lại
            </button>
        </div>
    );
}