interface Props {
  description: string | null;
  conditionNote?: string | null;
  compact?: boolean;
}

export default function ProductDescription({
  description,
  conditionNote,
  compact = false,
}: Props) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 text-sm font-bold">
          Mô tả sản phẩm
        </h3>

        <p
          className={`whitespace-pre-wrap break-words text-sm leading-6 text-neutral-500
            ${compact ? 'line-clamp-3' : ''}`}
        >
          {description ||
            'Mô tả sản phẩm đang được cập nhật.'}
        </p>
      </section>

      {conditionNote && (
        <section>
          <h3 className="mb-2 text-sm font-bold">
            Tình trạng thực tế
          </h3>

          <p
            className={`whitespace-pre-wrap break-words text-sm leading-6 text-neutral-500
              ${compact ? 'line-clamp-3' : ''}`}
          >
            {conditionNote}
          </p>
        </section>
      )}
    </div>
  );
}