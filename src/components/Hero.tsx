import { useTranslations } from 'next-intl';
import { BrandMark } from './BrandMark';

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
    <section className="relative h-[100dvh] min-h-[600px] w-full overflow-hidden">
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

      {/* ── Gradient overlay ─────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/35" />

      {/* ── Text content — bottom-left (matches original) ─────────────── */}
      <div className="relative z-10 container-content h-full flex flex-col justify-end pb-16 md:pb-24">
        <div className="text-white space-y-4 max-w-xl">
          <h1
            className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[0.18em] md:tracking-[0.22em] leading-snug font-light"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.3)' }}
          >
            {tagline1 ?? t('tagline1')}
          </h1>
          <h2
            className="font-sans text-xl sm:text-2xl md:text-3xl tracking-[0.18em] md:tracking-[0.22em] leading-snug font-light opacity-90"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}
          >
            {tagline2 ?? t('tagline2')}
          </h2>
          {(lede || t('lede')) && (
            <p className="font-averia text-sm md:text-base tracking-[0.18em] opacity-75 pt-1 leading-relaxed">
              {lede ?? t('lede')}
            </p>
          )}
        </div>
      </div>

      {/* ── Brand mark — bottom-right (matches original) ───────────────── */}
      <div className="absolute bottom-10 right-6 md:right-10 z-10 opacity-80">
        <BrandMark variant="white" className="h-14 md:h-18" />
      </div>
    </section>
  );
}
