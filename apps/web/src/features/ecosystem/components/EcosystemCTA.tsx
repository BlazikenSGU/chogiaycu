import { ArrowRight } from 'lucide-react';

interface Props {
    contactUrl?: string;
}

export default function EcosystemCTA({
    contactUrl,
}: Props) {
    return (
        <div
            className="mt-8 flex flex-col items-start
        justify-between gap-6 rounded-2xl
        bg-black p-6 text-white md:flex-row
        md:items-center md:p-8"
        >
            <div>
                <h3 className="mb-2 text-xl font-bold">
                    Bạn cần giải pháp riêng cho doanh nghiệp?
                </h3>

                <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
                    Liên hệ để trao đổi về giải pháp phần mềm,
                    tùy chỉnh tính năng, triển khai hệ thống riêng
                    và chuyển giao mã nguồn.
                </p>
            </div>

            {contactUrl && (
                <a
                    href={contactUrl}
                    className="inline-flex shrink-0 items-center
            gap-2 rounded-lg bg-white px-5 py-3
            text-sm font-semibold text-black
            transition hover:bg-neutral-200"
                >
                    Liên hệ hợp tác
                    <ArrowRight size={18} />
                </a>
            )}
        </div>
    );
}