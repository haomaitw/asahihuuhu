import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { getAboutPageGlobal } from '@/lib/cms'
import { PageHero } from '@/components/PageHero'
import { WaveDivider } from '@/components/WaveDivider'
import { AnimateIn } from '@/components/AnimateIn'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('title'), description: t('description') }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const cms = await getAboutPageGlobal(locale)

  const heroVideo = cms?.heroVideo ?? '/asahi/hero-about.mp4'
  const heroPoster = cms?.heroPoster ?? '/asahi/hero-about-poster.jpg'
  const p1 = cms?.storyP1 || t('story.p1')
  const p2 = cms?.storyP2 || t('story.p2')
  const p3 = cms?.storyP3 || t('story.p3')
  const img1 = cms?.storyImage1 ?? '/asahi/img-about-1.png'
  const img2 = cms?.storyImage2 ?? '/asahi/img-about-2.png'
  const img3 = cms?.storyImage3 ?? '/asahi/img-about-3.png'
  const img4 = cms?.storyImage4 ?? '/asahi/img-about-4.png'

  return (
    <>
      <PageHero
        eyebrow="About"
        title={t('title')}
        description={cms?.heroSubtitle || t('description')}
        media={{ kind: 'video', mp4: heroVideo, poster: heroPoster }}
      />

      <WaveDivider fill="#faf8f4" />

      {/* Brand Story */}
      <section className="bg-paper-50 py-16 md:py-24">
        <div className="container-content">
          <AnimateIn>
            <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20">
              <span className="section-eyebrow">{t('story.eyebrow')}</span>
              <div className="flex justify-center items-center gap-1 my-3" aria-hidden>
                <div className="h-px w-8 bg-sea-400/60" />
                <div className="h-px w-4 bg-sea-300/30" />
              </div>
              <h2 className="section-heading mt-1">{t('story.title')}</h2>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            {/* Text */}
            <AnimateIn className="space-y-6 text-base leading-relaxed text-ink/75 font-averia tracking-wide">
              {p1 && <p>{p1}</p>}
              {p2 && <p>{p2}</p>}
              {p3 && <p>{p3}</p>}
            </AnimateIn>

            {/* Images grid */}
            <AnimateIn delay={150} className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md col-span-2">
                <Image src={img1} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md">
                <Image src={img2} alt="" fill className="object-cover" sizes="25vw" />
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md">
                <Image src={img3} alt="" fill className="object-cover" sizes="25vw" />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      <WaveDivider fill="#d5e9f7" />

      {/* Location & Hours */}
      <section className="bg-sea-100 py-14 md:py-20">
        <div className="container-content">
          <AnimateIn>
            <div className="grid sm:grid-cols-2 gap-8 md:gap-16 max-w-3xl mx-auto">
              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold tracking-[0.18em] uppercase text-sea-700">{t('location.title')}</h3>
                <div className="h-px w-8 bg-sea-400/40 mb-3" />
                <p className="font-averia text-sm leading-relaxed text-ink/70">{t('location.body')}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold tracking-[0.18em] uppercase text-sea-700">{t('hours.title')}</h3>
                <div className="h-px w-8 bg-sea-400/40 mb-3" />
                <p className="font-averia text-sm leading-relaxed text-ink/70 whitespace-pre-line">{t('hours.body')}</p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Extra image if available */}
      {img4 && (
        <>
          <WaveDivider fill="#faf8f4" />
          <section className="bg-paper-50 py-12">
            <div className="container-content max-w-2xl">
              <AnimateIn>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <Image src={img4} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 672px" />
                </div>
              </AnimateIn>
            </div>
          </section>
        </>
      )}
    </>
  )
}
