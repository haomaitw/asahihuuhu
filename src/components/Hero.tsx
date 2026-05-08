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

      {/* ── Gradient overlay: stronger at top for text legibility ─────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/20" />

      {/* ── Text content — top-left ───────────────────────────────────── */}
      <div className="relative z-10 container-content h-full flex flex-col justify-start items-start pt-20 md:pt-24 lg:pt-28">
        <div className="text-white text-left space-y-3 md:max-w-md lg:max-w-lg">
          {/* Main tagline — large, light weight */}
          <h1
            className="font-sans font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[0.1em] leading-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.55)' }}
          >
            {tagline1 ?? t('tagline1')}
          </h1>
          {/* Sub tagline — clearly smaller, de-emphasised */}
          <h2
            className="font-sans font-light text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.1em] leading-snug opacity-75"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.45)' }}
          >
            {tagline2 ?? t('tagline2')}
          </h2>
          {/* Lede — smallest, most subtle */}
          {(lede || t('lede')) && (
            <p
              className="font-sans font-light text-xs sm:text-sm tracking-[0.12em] opacity-60 pt-1 leading-relaxed"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.35)' }}
            >
              {lede ?? t('lede')}
            </p>
          )}
        </div>
      </div>

      {/* ── Brand mark — bottom-right ─────────────────────────────────── */}
      <div className="absolute bottom-8 right-5 md:right-10 z-10 opacity-75">
        <BrandMark variant="white" className="h-12 md:h-16" />
      </div>
    </section>
  );
}
