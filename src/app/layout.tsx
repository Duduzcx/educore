
import { AuthProvider } from '@/lib/AuthProvider';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { ClientWrapper } from '@/components/ClientWrapper';
import { Suspense } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Compromisso | Educação Inteligente',
  description: 'Tecnologia a serviço da aprovação.',
};

function LoadingShell() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-[2rem] bg-primary/5 flex items-center justify-center animate-pulse">
          <BookOpen className="h-8 w-8 text-primary opacity-20" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-accent animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/20">Sincronizando Rede</p>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <body className="antialiased min-h-screen bg-background">
        <AuthProvider>
          <Suspense fallback={<LoadingShell />}>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </Suspense>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
