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
    <section className="relative h-[60dvh] min-h-[360px] md:min-h-[420px] w-full overflow-hidden">
      {media.kind === 'video' ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
      <div className="relative z-10 container-content h-full flex items-end pb-16 md:pb-20">
        <div className="text-white max-w-md space-y-2 md:space-y-3">
          <span className="text-[10px] tracking-[0.4em] uppercase opacity-90">
            {eyebrow}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl tracking-[0.2em] md:tracking-[0.3em]">
            {title}
          </h1>
          {description ? (
            <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] opacity-80 leading-loose">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
