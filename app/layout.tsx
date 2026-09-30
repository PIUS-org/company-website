import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const TITLE = 'PIUS — Build Your Growth';
const DESCRIPTION = 'PIUS는 기업의 업무를 이해하고, 그 업무에 맞는 시스템을 기획하고 개발하는 SI 회사입니다.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', siteName: 'PIUS', url: '/',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og/og-image.png', width: 1200, height: 630, alt: TITLE }],
    locale: 'ko_KR', alternateLocale: ['en_US', 'ja_JP'],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og/og-image.png'] },
  /* Search engine ownership. Google is verified by public/google4fcd0ab38f628a81.html (do not delete).
     Naver: paste the code from Search Advisor ("HTML 태그") and uncomment. */
  // verification: { other: { 'naver-site-verification': '네이버_코드' } },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#000000' };

/* Structured data for search engines — only facts already shown in the footer. */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'PIUS',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon.png`,
      description: DESCRIPTION,
      foundingDate: '2023-01-30',
      founder: { '@type': 'Person', name: '최시온' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '강남서로 9, 703호',
        addressLocality: '용인시',
        addressRegion: '경기도',
        addressCountry: 'KR',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'PIUS',
      url: `${SITE_URL}/`,
      inLanguage: 'ko',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* keep the site's own dark palette even when the browser forces a dark mode */}
        <meta name="color-scheme" content="dark only" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600&family=IBM+Plex+Sans+JP:wght@300;400;500;600&family=Unbounded:wght@200..900&display=swap" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
