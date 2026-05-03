export function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="section-eyebrow">{eyebrow}</span>
      <span className="h-px w-10 bg-sea-200" />
      <h2 className="section-heading">{title}</h2>
    </div>
  );
}
