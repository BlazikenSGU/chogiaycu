import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';

import { X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  className = 'max-w-4xl',
}: Props) {
  const dialogRef =
    useRef<HTMLDialogElement>(null);

  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || !open) return;

    const previousOverflow =
      document.body.style.overflow;

    const previousFocus =
      document.activeElement;

    if (!dialog.open) {
      dialog.showModal();
    }

    document.body.style.overflow = 'hidden';

    return () => {
      if (dialog.open) {
        dialog.close();
      }

      document.body.style.overflow =
        previousOverflow;

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({
          preventScroll: true,
        });
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
      className={`fixed inset-0 m-auto max-h-[90dvh]
        w-[calc(100%-2rem)] overflow-y-auto
        rounded-[28px] bg-white p-0
        text-[#171717] shadow-2xl
        backdrop:bg-black/50
        ${className}`}
    >
      <div className="p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2
            id={titleId}
            className="text-base font-semibold"
          >
            {title}
          </h2>

          <button
            type="button"
            aria-label="Đóng cửa sổ"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </dialog>
  );
}