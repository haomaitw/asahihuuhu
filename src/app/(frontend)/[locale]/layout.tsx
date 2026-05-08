import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Noto_Sans_TC, Noto_Sans_JP, Noto_Serif_TC, Averia_Sans_Libre } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';
import { CartProvider } from '@/components/CartProvider';
import { LoginModal } from '@/components/LoginModal';
import { getSiteSettings } from '@/lib/cms';
import '@/app/globals.css';

const notoTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-tc',
  display: 'swap',
});

const notoJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-jp',
  display: 'swap',
});

const notoSerifTC = Noto_Serif_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-serif-tc',
  display: 'swap',
});

// Decorative EN display font — matches original asahihuuhu.com "Averia Sans Libre"
// Used for eyebrow labels, "See More" text, section EN sub-labels
const averia = Averia_Sans_Libre({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-averia',
  display: 'swap',
});

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FoodEstablishment',
  name: '朝日夫婦 ASAHI HUUHU',
  description: '職人堅持的日式刨冰',
  url: 'https://www.asahihuuhu.com',
  image: 'https://www.asahihuuhu.com/asahi/hero-home-poster.jpg',
  servesCuisine: 'Japanese',
  priceRange: '$$',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '18:00',
    },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, siteSettings] = await Promise.all([
    getMessages(),
    getSiteSettings(locale).catch(() => null),
  ]);

  const facebookUrl  = (siteSettings as any)?.facebookUrl  ?? null;
  const instagramUrl = (siteSettings as any)?.instagramUrl ?? null;
  const copyright    = (siteSettings as any)?.copyright    ?? null;

  return (
    <html
      lang={locale}
      className={`${notoTC.variable} ${notoJP.variable} ${notoSerifTC.variable} ${averia.variable}`}
    >
      {/* overflow-x-hidden: prevents marquee + any negative-margin element from
          causing horizontal scroll on iOS / Android */}
      <body className="overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <PageTransition />
            <LoginModal />
            <div className="flex min-h-dvh flex-col bg-paper-50 text-ink overflow-x-hidden">
              <Header facebookUrl={facebookUrl} instagramUrl={instagramUrl} />
              <main className="flex-1 overflow-x-hidden">{children}</main>
              <Footer facebookUrl={facebookUrl} instagramUrl={instagramUrl} copyright={copyright} />
            </div>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
