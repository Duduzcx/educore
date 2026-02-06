"use client";

import { MessageCircle, HandMetal } from "lucide-react";
import Link from "next/link";

export function AccessibilityWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
      <Link 
        href="/dashboard/support"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white group"
        title="Falar com a Aurora"
      >
        <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12 text-accent" />
      </Link>
      <button 
        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white group" 
        title="Acessibilidade - VLibras"
      >
        <HandMetal className="h-6 w-6 transition-transform group-hover:rotate-12" />
      </button>
    </div>
  );
}
