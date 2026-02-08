
"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Componente Client-Side para inicialização segura do VLibras.
 * OTIMIZAÇÃO: Usando lazyOnload para não travar o carregamento inicial da página.
 */
export function Vlibras() {
  useEffect(() => {
    const initVlibras = () => {
      try {
        if (typeof window !== "undefined" && (window as any).VLibras) {
          new (window as any).VLibras.Widget("https://vlibras.gov.br/app");
        }
      } catch (e) {
        // Falha silenciosa
      }
    };

    // Delay maior para garantir que o portal carregue primeiro
    const timer = setTimeout(initVlibras, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Script 
        src="https://vlibras.gov.br/app/vlibras-plugin.js" 
        strategy="lazyOnload"
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
