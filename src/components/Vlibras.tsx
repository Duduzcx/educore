"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Componente Client-Side para inicialização segura do VLibras.
 * OTIMIZAÇÃO: Usando data-attributes para evitar erros de tipagem no TypeScript do Next.js 15.
 */
export function Vlibras() {
  useEffect(() => {
    const initVlibras = () => {
      try {
        if (typeof window !== "undefined" && (window as any).VLibras) {
          new (window as any).VLibras.Widget("https://vlibras.gov.br/app");
        }
      } catch (e) {
        // Falha silenciosa para não quebrar a UI
      }
    };

    const timer = setTimeout(initVlibras, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Script 
        src="https://vlibras.gov.br/app/vlibras-plugin.js" 
        strategy="lazyOnload"
      />
      <div data-vw="true" className="enabled">
        <div data-vw-access-button="true" className="active"></div>
        <div data-vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>
    </>
  );
}
