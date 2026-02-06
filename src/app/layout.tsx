
import type { Metadata, Viewport } from 'next';
import { Inter, Lexend } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ClientWrapper } from '@/components/ClientWrapper';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EduCore | Smart Education',
  description: 'Um portal de educação moderno, acessível e inteligente para gestão municipal e vestibular.',
};

export const viewport: Viewport = {
  themeColor: '#1a2c4b',
  initialScale: 1,
  width: 'device-width',
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lexend.variable}`}>
      <body suppressHydrationWarning={true}>
        <FirebaseClientProvider>
          <FirebaseErrorListener />
          <ClientWrapper>
            {children}
          </ClientWrapper>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
