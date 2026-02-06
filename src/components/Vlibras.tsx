
"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Componente Client-Side para inicialização segura do VLibras.
 * Evita erros de serialização de eventos no layout.tsx.
 */
export function Vlibras() {
  useEffect(() => {
    const initVlibras = () => {
      try {
        if (typeof window !== "undefined" && (window as any).VLibras) {
          new (window as any).VLibras.Widget("https://vlibras.gov.br/app");
        }
      } catch (e) {
        // Falha silenciosa se o widget não carregar
      }
    };

    // Tenta inicializar após um pequeno delay para garantir o carregamento do script
    const timer = setTimeout(initVlibras, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Script 
        src="https://vlibras.gov.br/app/vlibras-plugin.js" 
        strategy="afterInteractive"
      />
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>
    </>
  );
}
