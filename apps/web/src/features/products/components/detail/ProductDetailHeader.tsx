import { useState } from 'react';

import {
  ArrowLeft,
  Share2,
} from 'lucide-react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

interface Props {
  productName?: string;
}

export default function ProductDetailHeader({
  productName,
}: Props) {
  const navigate = useNavigate();

  const [shareMessage, setShareMessage] =
    useState('');

  function handleBack() {
    const historyIndex =
      window.history.state?.idx;

    if (
      typeof historyIndex === 'number' &&
      historyIndex > 0
    ) {
      navigate(-1);
      return;
    }

    navigate('/');
  }

  async function handleShare() {
    setShareMessage('');

    try {
      if (navigator.share) {
        await navigator.share({
          title: productName || '72Market',
          url: window.location.href,
        });

        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          window.location.href,
        );

        setShareMessage(
          'Đã sao chép đường dẫn',
        );

        return;
      }

      setShareMessage(
        'Bạn có thể sao chép URL trên thanh địa chỉ.',
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'AbortError'
      ) {
        return;
      }

      setShareMessage(
        'Không thể chia sẻ đường dẫn.',
      );
    }
  }

  return (
    <header className="bg-[#f3f3f3] md:border-b md:border-neutral-100 md:bg-white">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">

        <button
          type="button"
          aria-label="Quay lại"
          onClick={handleBack}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-neutral-200"
        >
          <ArrowLeft size={23} />
        </button>

        <Link
          to="/"
          className="hidden text-xl font-extrabold tracking-tight md:block"
        >
          72Market
        </Link>

        <button
          type="button"
          aria-label="Chia sẻ sản phẩm"
          onClick={() => void handleShare()}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-neutral-200"
        >
          <Share2 size={20} />
        </button>

        {shareMessage && (
          <p
            role="status"
            className="absolute right-5 top-full z-40 rounded-xl bg-[#171717] px-4 py-3 text-xs text-white"
          >
            {shareMessage}
          </p>
        )}
      </div>
    </header>
  );
}