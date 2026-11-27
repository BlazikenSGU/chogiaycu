interface Props {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
}: Props) {
  return (
    <div className="mb-10 text-center">
      <span className="pf-badge uppercase tracking-wider">
        {eyebrow}
      </span>

      <h2 className="mt-3 text-3xl font-bold
        tracking-tight md:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="pf-text-muted mx-auto mt-3
          max-w-xl text-sm leading-6">
          {description}
        </p>
      )}
    </div>
  );
}