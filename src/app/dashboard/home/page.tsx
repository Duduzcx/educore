"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Library,
  Bot,
  ShieldCheck,
  Loader2,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider"; 
import { supabase } from "@/lib/supabase"; 

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function DashboardHome() {
  const { user, loading: isUserLoading } = useAuth();
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);

  useEffect(() => {
    const fetchLibraryItems = async () => {
      setLoadingLibrary(true);
      try {
        const { data, error } = await supabase
          .from('library_items')
          .select('id, title, description, category')
          .limit(4);

        if (!error) {
          setLibraryItems(data as LibraryItem[]);
        }
      } catch (err) {
        console.error("Erro ao buscar itens da biblioteca:", err);
      } finally {
        setLoadingLibrary(false);
      }
    };

    fetchLibraryItems();
  }, []);

  if (isUserLoading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sintonizando Portal...</p>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Estudante';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      <section className="bg-primary p-8 md:p-12 rounded-[2.5rem] text-primary-foreground relative overflow-hidden shadow-2xl">
         <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
         <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-3">
             <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight">Olá, {userName}! 👋</h1>
             <Badge className="bg-accent text-accent-foreground border-none font-black px-3 py-1 shadow-lg animate-bounce">
               <Bot className="h-3 w-3 mr-1.5" /> IA ATIVA
             </Badge>
           </div>
           <p className="text-sm md:text-lg text-primary-foreground/80 font-medium leading-relaxed italic max-w-2xl">
             Transforme dedicação em conquistas reais. O futuro começa com o que você aprende hoje.
           </p>
         </div>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-primary italic flex items-center gap-2 px-2">
              <Library className="h-5 w-5 text-accent" /> Acervo em Destaque
            </h2>
            
            {loadingLibrary ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-[2.5rem] bg-white/50">
                <Loader2 className="animate-spin text-accent h-10 w-10" />
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Consultando Acervo Digital...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {libraryItems && libraryItems.length > 0 ? (
                  libraryItems.map((item) => (
                    <Link key={item.id} href="/dashboard/library" className="group block">
                        <Card className="border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white rounded-[2rem] flex items-center gap-5 p-5">
                            <div className='w-20 h-20 shrink-0 relative rounded-2xl overflow-hidden shadow-md'>
                                <Image 
                                  src={`https://picsum.photos/seed/${item.id}/150/150`} 
                                  alt={item.title} 
                                  width={150}
                                  height={150}
                                  className="object-cover"
                                  data-ai-hint="educational cover"
                                />
                            </div>
                            <div className='flex-1 space-y-1.5 overflow-hidden'>
                                <Badge variant='secondary' className='font-black text-[7px] uppercase tracking-widest bg-accent/10 text-accent border-none'>{item.category}</Badge>
                                <h3 className='font-black text-sm leading-tight text-primary truncate italic'>{item.title}</h3>
                                <p className='text-[10px] text-muted-foreground line-clamp-2 font-medium'>{item.description}</p>
                            </div>
                        </Card>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center opacity-40 italic text-sm border-2 border-dashed rounded-[2.5rem]">
                    Nenhum item em destaque no momento.
                  </div>
                )}
              </div>
            )}
        </div>

        <div className="space-y-6">
            <h3 className="text-xl font-black text-primary italic px-2">Sistema Monitorado</h3>
            <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-8 overflow-hidden relative group">
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-3xl bg-white/10 flex items-center justify-center shadow-lg"><ShieldCheck className="h-8 w-8 text-accent" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Rede Educore</p>
                    <p className="text-xl font-black italic">Status: Operacional</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-accent">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Dica da Aurora</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed italic opacity-80">"Complete seus simulados semanais para ganhar badges de elite."</p>
                </div>
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black h-12 rounded-2xl shadow-xl transition-all border-none">
                  <Link href="/dashboard/chat">Falar com Mentor</Link>
                </Button>
              </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
