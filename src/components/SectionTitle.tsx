export function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {/* Averia Sans Libre eyebrow — matches original asahihuuhu.com style */}
      <span className="section-eyebrow">{eyebrow}</span>
      {/* Decorative dash divider */}
      <span className="section-dash" aria-hidden />
      {/* Chinese section title */}
      <h2 className="section-heading mt-1">{title}</h2>
    </div>
  );
}
