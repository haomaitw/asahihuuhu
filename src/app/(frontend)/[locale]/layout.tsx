import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Noto_Sans_TC, Noto_Sans_JP, Noto_Serif_TC } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';
import { CartProvider } from '@/components/CartProvider';
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
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${notoTC.variable} ${notoJP.variable} ${notoSerifTC.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <PageTransition />
            <div className="flex min-h-dvh flex-col bg-paper-50 text-ink">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
