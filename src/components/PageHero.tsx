type Media =
  | { kind: 'image'; src: string }
  | { kind: 'video'; mp4: string; webm?: string; poster: string };

export function PageHero({
  eyebrow,
  title,
  description,
  media,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  media: Media;
}) {
  return (
    <section className="relative h-[65dvh] min-h-[400px] md:min-h-[460px] w-full overflow-hidden">
      {/* ── Background ───────────────────────────────────────────────── */}
      {media.kind === 'video' ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay muted loop playsInline
          poster={media.poster}
        >
          {media.webm && <source src={media.webm} type="video/webm" />}
          <source src={media.mp4} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${media.src}')` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/35" />

      {/* ── Text — bottom-left ────────────────────────────────────────── */}
      <div className="relative z-10 container-content h-full flex items-end pb-16 md:pb-24">
        <div className="text-white space-y-3 md:space-y-4">
          {/* Averia eyebrow label */}
          <span className="block font-averia text-sm tracking-[0.35em] uppercase opacity-80">
            {eyebrow}
          </span>
          <h1
            className="font-sans text-3xl md:text-4xl lg:text-5xl tracking-[0.18em] font-light leading-snug"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.3)' }}
          >
            {title}
          </h1>
          {description && (
            <p className="font-averia text-sm md:text-base tracking-[0.15em] opacity-75 leading-relaxed max-w-md">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
