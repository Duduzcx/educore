
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Youtube, Calendar, Clock, PlayCircle, Sparkles, MonitorPlay, Radio } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

interface Live {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  startTime: { seconds: number };
  youtubeId: string;
  youtubeUrl: string;
}

const DEMO_LIVES: Live[] = [
  {
    id: 'demo-live-1',
    title: 'Aulão Especial: Redação Nota 1000 para o ENEM',
    description: 'Análise profunda dos critérios de correção e como estruturar uma proposta de intervenção impecável.',
    teacherName: 'Prof. Marcos Mendes',
    startTime: { seconds: Math.floor(Date.now() / 1000) - 1800 },
    youtubeId: 'rfscVS0vtbw',
    youtubeUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw'
  }
];

export default function LivePage() {
  const firestore = useFirestore();
  
  const livesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "lives"), orderBy("startTime", "desc"));
  }, [firestore]);

  const { data: dbLives, isLoading } = useCollection(livesQuery);

  const allLives = useMemo(() => {
    const lives = dbLives || [];
    // Se não houver lives reais, usamos a demo para apresentação
    if (lives.length === 0) return DEMO_LIVES;
    return lives;
  }, [dbLives]);

  const now = new Date();

  const liveNow = allLives.filter(l => {
    if (!l.startTime) return false;
    const start = new Date(l.startTime.seconds * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); 
    return now >= start && now <= end;
  });

  const upcomingLives = allLives.filter(l => {
    if (!l.startTime) return false;
    const start = new Date(l.startTime.seconds * 1000);
    return start > now;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-primary italic leading-none">Aulas ao Vivo</h1>
        <p className="text-muted-foreground font-medium">Acompanhe transmissões em tempo real e interaja com os mentores.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="font-black text-muted-foreground uppercase text-[10px] tracking-widest animate-pulse">Sincronizando Rede...</p>
        </div>
      ) : (
        <>
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <h2 className="text-xl font-black text-primary italic">No Ar Agora</h2>
            </div>
            
            {liveNow.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {liveNow.map(live => (
                  <Card key={live.id} className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="p-6 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-black text-primary italic">{live.title}</CardTitle>
                          <p className="text-xs font-bold text-muted-foreground mt-1">{live.teacherName}</p>
                        </div>
                        <Badge className="bg-red-600 text-white font-black animate-pulse px-3 h-6 border-none">AO VIVO</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                       <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg group-hover:scale-[1.02] transition-transform duration-500">
                         <iframe 
                           width="100%" 
                           height="100%" 
                           src={`https://www.youtube.com/embed/${live.youtubeId}?modestbranding=1&rel=0&autoplay=0`} 
                           title={live.title} 
                           frameBorder="0" 
                           allowFullScreen
                         ></iframe>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-4 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5 opacity-40">
                <PlayCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="font-black italic">Nenhuma aula acontecendo agora.</p>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-primary italic px-2">Agenda de Encontros</h2>
            <div className="grid gap-4">
              {upcomingLives.length > 0 ? (
                upcomingLives.map((live) => (
                  <Card key={live.id} className="border-none shadow-md rounded-2xl bg-white hover:shadow-lg transition-all group hover:-translate-y-1 duration-300">
                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="h-16 w-16 rounded-2xl bg-primary text-white flex flex-col items-center justify-center shrink-0 shadow-lg">
                          <span className="text-[8px] font-black uppercase opacity-60">
                            {new Date(live.startTime.seconds * 1000).toLocaleDateString('pt-BR', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-black italic leading-none">
                            {new Date(live.startTime.seconds * 1000).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-lg text-primary italic truncate">{live.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{live.teacherName}</span>
                            <span className="text-[10px] text-accent font-black">
                              {new Date(live.startTime.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full md:w-auto rounded-xl font-black text-[10px] uppercase border-dashed hover:bg-primary hover:text-white transition-all" asChild>
                        <a href={live.youtubeUrl} target="_blank" rel="noopener noreferrer">Lembrar-me</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground font-medium italic py-10 opacity-40">Nenhuma aula futura agendada.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
