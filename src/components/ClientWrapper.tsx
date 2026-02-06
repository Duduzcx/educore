
'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Carregamento dinâmico dos widgets que só rodam no cliente para evitar erros de hidratação
const AccessibilityWidget = dynamic(() => 
  import('@/components/AccessibilityWidget').then(mod => mod.AccessibilityWidget),
  { ssr: false }
);

const Vlibras = dynamic(() => 
  import('@/components/Vlibras').then(mod => mod.Vlibras),
  { ssr: false }
);

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Regra para não renderizar os widgets em páginas de login/registro
  const shouldRenderWidgets = !['/login', '/register', '/'].includes(pathname);

  return (
    <>
      {children}
      {shouldRenderWidgets && (
        <>
          <AccessibilityWidget />
          <Vlibras />
        </>
      )}
    </>
  );
}
