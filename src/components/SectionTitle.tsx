/*
  SectionTitle — editorial layout inspired by the brand's Japanese-Taiwanese aesthetic.

  Replaces the plain centered dash with a two-tone horizon rule that echoes
  the brand's "horizon between Okinawa and Tamsui" motif used in the Hero.
*/
export function SectionTitle({
  eyebrow,
  title,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  align?: 'left' | 'center';
}) {
  const isCenter = align === 'center';

  return (
    <div className={`flex flex-col gap-3 ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}>

      {/* Eyebrow label — wide-tracked, brand blue */}
      <span className="section-eyebrow">{eyebrow}</span>

      {/*
        Two-tone horizon rule:
        - Opaque left segment  →  foreground (the harbour, where you stand)
        - Faded right segment  →  distance  (the open sea / other shore)
        Mirrors the horizon motif from the hero section.
      */}
      <div className="flex items-center gap-1" aria-hidden>
        <div className="h-px w-8 bg-sea-400/60" />
        <div className="h-px w-4 bg-sea-300/30" />
      </div>

      {/* Section heading */}
      <h2 className="section-heading mt-1">{title}</h2>
    </div>
  );
}
