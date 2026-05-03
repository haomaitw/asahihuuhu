import type { Metadata } from 'next';

const siteUrl = 'https://www.asahihuuhu.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | 朝日夫婦 ASAHI HUUHU',
    default: 'ASAHI HUUHU 朝日夫婦 — 職人堅持的日式刨冰',
  },
  description: '台灣最具職人精神的日式刨冰店。精選食材、手工製作，每一碗都是一段午後的沁涼記憶。',
  keywords: ['刨冰', '日式刨冰', '台灣', '朝日夫婦', 'kakigori', 'shaved ice', 'Taiwan', '朝日'],
  authors: [{ name: '朝日夫婦 ASAHI HUUHU' }],
  creator: '朝日夫婦 ASAHI HUUHU',
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    alternateLocale: ['en_US', 'ja_JP'],
    url: siteUrl,
    siteName: '朝日夫婦 ASAHI HUUHU',
    title: 'ASAHI HUUHU 朝日夫婦 — 職人堅持的日式刨冰',
    description: '台灣最具職人精神的日式刨冰店。精選食材、手工製作，每一碗都是一段午後的沁涼記憶。',
    images: [
      {
        url: '/asahi/hero-home-poster.jpg',
        width: 1200,
        height: 630,
        alt: '朝日夫婦 ASAHI HUUHU — 日式刨冰',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASAHI HUUHU 朝日夫婦',
    description: '職人堅持的日式刨冰 — 台灣',
    images: ['/asahi/hero-home-poster.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/asahi/favicon.ico',
    apple: '/asahi/favicon.ico',
  },
};

// Root layout passes through — each route group owns its <html>/<body>
// (payload)/admin/layout.tsx provides Payload's RootLayout with html+body
// (frontend)/[locale]/layout.tsx provides the frontend html+body
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactNode;
}
