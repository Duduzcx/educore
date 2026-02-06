'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Página raiz resiliente para a apresentação EduCore.
 * Redireciona para o login via cliente para evitar erros 404 durante o boot.
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Força o carregamento da tela de login
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a2c4b]">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="h-16 w-16 bg-white/10 rounded-3xl border border-white/20" />
        <div className="font-black italic text-white text-3xl tracking-tighter">
          EduCore...
        </div>
      </div>
    </div>
  );
}
