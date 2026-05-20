import type {Metadata, Viewport} from 'next';
import { Noto_Kufi_Arabic } from 'next/font/google';
import './globals.css';

const notoArabic = Noto_Kufi_Arabic({ 
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-arabic'
});

export const metadata: Metadata = {
  title: 'Tomezy - نظام الطابور الذكي',
  description: 'نظام طابور افتراضي ذكي لصالونات الحلاقة',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={notoArabic.variable}>
      <body className="font-sans antialiased min-h-screen selection:bg-gold-primary selection:text-bg-primary" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
