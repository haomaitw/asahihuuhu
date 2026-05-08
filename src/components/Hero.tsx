import { useTranslations } from 'next-intl';

type HeroProps = {
  videoSrc?: string
  poster?: string
  tagline1?: string
  tagline2?: string
  lede?: string
}

export function Hero({ videoSrc, poster, tagline1, tagline2, lede }: HeroProps = {}) {
  const t = useTranslations('home.hero');

  return (
    <section className="relative h-[100dvh] min-h-[640px] w-full overflow-hidden">

      {/* ── Video background ──────────────────────────────────────────── */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={poster ?? '/asahi/hero-home-poster.jpg'}
      >
        {videoSrc ? (
          <source src={videoSrc} />
        ) : (
          <>
            <source src="/asahi/hero-home.webm" type="video/webm" />
            <source src="/asahi/hero-home.mp4"  type="video/mp4" />
          </>
        )}
      </video>

      {/*
        ── Gradient layers ──────────────────────────────────────────────
        Two overlaid gradients:
        1. Diagonal bottom-left→top-right: dark lower-left (the harbour
           shade where we stand), open upper-right (morning sun / sea)
        2. Thin top bar so the transparent header stays legible
      */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'linear-gradient(to top right, rgba(8,6,4,0.84) 0%, rgba(8,6,4,0.50) 38%, rgba(8,6,4,0.14) 62%, transparent 78%)',
            'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, transparent 26%)',
          ].join(', '),
        }}
      />

      {/* ── Main content — anchored bottom-left ───────────────────────── */}
      <div className="relative z-10 h-full container-content flex flex-col justify-end pb-16 sm:pb-20 md:pb-24 lg:pb-28">
        <div className="max-w-xl lg:max-w-2xl">

          {/*
            Eyebrow — a tiny brand sigil above the headline.
            The leading dash echoes the horizon-rule motif.
          */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-px bg-white/40" />
            <span className="font-sans font-light text-[10px] tracking-[0.42em] uppercase text-white/45 select-none">
              Asahi Huuhu · 朝日夫婦
            </span>
          </div>

          {/*
            Main tagline — large, commanding.
            Tracking kept tight (0.08em) so CJK characters read as a
            cohesive mass; text-shadow diffuses the edges like morning
            mist on water.
          */}
          <h1
            className="font-sans font-light text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-[0.07em] text-white"
            style={{ textShadow: '0 3px 36px rgba(0,0,0,0.45)' }}
          >
            {tagline1 ?? t('tagline1')}
          </h1>

          {/*
            Horizon rule — the symbolic divide between Okinawa and Tamsui,
            Pacific sea and Tamsui River. Two segments at different
            opacity mimic a distant shoreline.
          */}
          <div className="flex items-center gap-1.5 mt-7 mb-6">
            <div className="h-px w-10 bg-white/45" />
            <div className="h-px w-5 bg-white/20" />
          </div>

          {/* Sub tagline */}
          <h2
            className="font-sans font-light text-base sm:text-lg md:text-xl tracking-[0.12em] text-white/70 leading-relaxed mb-5"
            style={{ textShadow: '0 1px 18px rgba(0,0,0,0.40)' }}
          >
            {tagline2 ?? t('tagline2')}
          </h2>

          {/* Lede — whisper text, for those who linger */}
          {(lede ?? t('lede')) && (
            <p
              className="font-sans font-light text-xs sm:text-sm tracking-[0.05em] text-white/40 leading-[1.9] max-w-sm"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.30)' }}
            >
              {lede ?? t('lede')}
            </p>
          )}
        </div>
      </div>

      {/*
        ── Scroll indicator — far right edge ────────────────────────────
        Positioned as a counterweight to the left-anchored text block;
        the vertical line echoes the mast of a fishing-harbour boat.
      */}
      <div className="absolute right-6 md:right-10 bottom-10 z-10 flex flex-col items-center gap-2 text-white/30 select-none">
        <span className="font-sans font-light text-[9px] tracking-[0.45em] uppercase">
          scroll
        </span>
        <div className="w-px h-14 bg-current animate-pulse" />
      </div>

    </section>
  );
}
