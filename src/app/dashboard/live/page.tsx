
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, Radio, Calendar, ExternalLink, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';

interface Live {
  id: string;
  title: string;
  description: string;
  teacher_name: string;
  start_time: string;
  youtube_id: string;
  youtube_url: string;
}

const DEMO_LIVES: Live[] = [
  {
    id: 'demo-live-1',
    title: 'Aulão Especial: Redação Nota 1000 para o ENEM',
    description: 'Análise profunda dos critérios de correção e como estruturar uma proposta de intervenção impecável.',
    teacher_name: 'Prof. Marcos Mendes',
    start_time: new Date().toISOString(),
    youtube_id: 'rfscVS0vtbw',
    youtube_url: 'https://www.youtube.com/watch?v=rfscVS0vtbw'
  }
];

export default function LivePage() {
  const { user } = useAuth();
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    async function fetchLives() {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lives')
          .select('*')
          .order('start_time', { ascending: false });

        if (error) {
          console.warn("Entrando em modo de resiliência (Demo Data)");
          setIsDemoMode(true);
          setLives(DEMO_LIVES);
        } else {
          setLives(data && data.length > 0 ? data : DEMO_LIVES);
          setIsDemoMode(data && data.length > 0 ? false : true);
        }
      } catch (err: any) {
        setIsDemoMode(true);
        setLives(DEMO_LIVES);
      } finally {
        setLoading(false);
      }
    }

    fetchLives();
  }, [user]);

  const now = new Date();
  const liveNow = lives.filter(l => {
    const start = new Date(l.start_time);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); 
    return now >= start && now <= end;
  });

  const upcomingLives = lives.filter(l => {
    const start = new Date(l.start_time);
    return start > now;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-primary italic leading-none">Aulas ao Vivo</h1>
          {isDemoMode && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-black text-[8px] animate-pulse">
              MODO RESILIÊNCIA ATIVO
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground font-medium italic">Acompanhe transmissões em tempo real da Rede EduCore.</p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="font-black text-primary uppercase text-[10px] tracking-widest animate-pulse">Sincronizando com o Satélite...</p>
        </div>
      ) : (
        <>
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
              <h2 className="text-xl font-black text-primary italic uppercase tracking-tighter">No Ar Agora</h2>
            </div>
            
            {liveNow.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {liveNow.map(live => (
                  <Card key={live.id} className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-[0_20px_80px_-15px_hsl(var(--accent)/0.3)] transition-all duration-700">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <CardTitle className="text-xl md:text-2xl font-black text-primary italic truncate leading-tight">{live.title}</CardTitle>
                          <p className="text-xs font-bold text-muted-foreground mt-1 opacity-60 uppercase tracking-widest">{live.teacher_name || 'Docente da Rede'}</p>
                        </div>
                        <Badge className="bg-red-600 text-white font-black animate-pulse px-4 h-7 border-none shrink-0 text-[10px] shadow-lg">LIVE</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                       <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl group-hover:scale-[1.01] transition-transform duration-500 ring-4 ring-primary/5">
                         <iframe 
                           width="100%" 
                           height="100%" 
                           src={`https://www.youtube.com/embed/${live.youtube_id || 'rfscVS0vtbw'}?modestbranding=1&rel=0&autoplay=0&showinfo=0`} 
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
              <div className="p-20 text-center border-4 border-dashed border-muted/20 rounded-[3rem] bg-muted/5 opacity-40">
                <PlayCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="font-black italic text-xl">O estúdio está em silêncio...</p>
                <p className="text-sm font-medium mt-2 italic">Nenhuma transmissão acontecendo neste minuto.</p>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-primary italic px-2 uppercase tracking-tighter">Agenda de Encontros</h2>
            <div className="grid gap-4">
              {upcomingLives.length > 0 ? (
                upcomingLives.map((live) => (
                  <Card key={live.id} className="border-none shadow-xl rounded-[2rem] bg-white hover:shadow-2xl transition-all group hover:-translate-y-1 duration-500 overflow-hidden">
                    <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-8 w-full md:w-auto">
                        <div className="h-20 w-20 rounded-[1.5rem] bg-primary text-white flex flex-col items-center justify-center shrink-0 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform">
                          <span className="text-[10px] font-black uppercase opacity-60">
                            {new Date(live.start_time).toLocaleDateString('pt-BR', { month: 'short' })}
                          </span>
                          <span className="text-3xl font-black italic leading-none">
                            {new Date(live.start_time).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-xl text-primary italic truncate group-hover:text-accent transition-colors">{live.title}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{live.teacher_name || 'Docente'}</span>
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="text-[10px] text-accent font-black uppercase tracking-widest">
                              {new Date(live.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full md:w-auto rounded-xl font-black text-[10px] uppercase border-dashed hover:bg-primary hover:text-white transition-all h-12 px-8" asChild>
                        <a href={live.youtube_url || `https://youtube.com/watch?v=${live.youtube_id}`} target="_blank" rel="noopener noreferrer">Ativar Lembrete</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground font-medium italic py-16 opacity-40 border-2 border-dashed rounded-[2rem]">Nenhum encontro agendado para os próximos dias.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
