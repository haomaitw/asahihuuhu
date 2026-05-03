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
    <section className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden">
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
            <source src="/asahi/hero-home.mp4" type="video/mp4" />
          </>
        )}
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />

      <div className="relative z-10 container-content h-full flex flex-col justify-between py-24">
        <div className="text-white max-w-md space-y-3 pt-12 md:pt-20">
          <h1 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">
            {tagline1 ?? t('tagline1')}
          </h1>
          <h2 className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">
            {tagline2 ?? t('tagline2')}
          </h2>
          <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] opacity-80 pt-2 leading-loose">
            {lede ?? t('lede')}
          </p>
        </div>

        <div className="self-end">
          <BrandMark variant="white" className="h-16 md:h-20" />
        </div>
      </div>
    </section>
  );
}
