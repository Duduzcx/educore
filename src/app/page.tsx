'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Página raiz que gerencia o fluxo de entrada.
 * Redireciona para o login de forma estável no cliente para evitar erros 404.
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Uso do replace no cliente para garantir que a rota /login seja encontrada
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <div className="animate-pulse font-black italic text-white text-2xl tracking-tighter">
        EduCore...
      </div>
    </div>
  );
}