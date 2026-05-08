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

      {/* ── Gradient: heavier top (header) + centre (text) ───────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-black/20" />

      {/* ── Centred hero content ──────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">

        {/* Large brand mark — the visual anchor */}
        <div className="mb-6 md:mb-8">
          <BrandMark variant="white" className="h-20 sm:h-24 md:h-28 lg:h-32 opacity-90" />
        </div>

        {/* Thin rule */}
        <div className="w-10 h-px bg-white/35 mb-7 md:mb-8" />

        {/* Taglines */}
        <div className="space-y-3 max-w-xl">
          <h1
            className="font-sans font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.1em] text-white leading-tight"
            style={{ textShadow: '0 2px 28px rgba(0,0,0,0.6)' }}
          >
            {tagline1 ?? t('tagline1')}
          </h1>
          <h2
            className="font-sans font-light text-base sm:text-lg md:text-xl tracking-[0.1em] text-white/70 leading-snug"
            style={{ textShadow: '0 1px 14px rgba(0,0,0,0.5)' }}
          >
            {tagline2 ?? t('tagline2')}
          </h2>
        </div>

        {/* Lede — subtle, a step below */}
        {(lede || t('lede')) && (
          <p
            className="font-sans font-light text-sm tracking-[0.1em] text-white/50 mt-5 max-w-md leading-loose"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.35)' }}
          >
            {lede ?? t('lede')}
          </p>
        )}

        {/* Scroll indicator */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40 text-white">
          <span className="font-sans font-light text-[10px] tracking-[0.35em] uppercase">scroll</span>
          <div className="w-px h-8 bg-current animate-pulse" />
        </div>
      </div>
    </section>
  );
}
