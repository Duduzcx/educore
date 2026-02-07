
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, Radio, Calendar, ExternalLink, Signal, Users, Clock } from 'lucide-react';
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
  url?: string;
}

const DEFAULT_VIDEO_ID = 'rfscVS0vtbw';

export default function LivePage() {
  const { user } = useAuth();
  const [lives, setLives] = useState<Live[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLives() {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lives')
          .select('*')
          .order('start_time', { ascending: false });

        if (!error) {
          setLives(data || []);
        }
      } catch (err: any) {
        console.error("Erro ao carregar lives:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLives();
  }, [user]);

  const getLiveLink = (live: Live) => {
    if (live.youtube_url) return live.youtube_url;
    if (live.url) return live.url;
    if (live.youtube_id) return `https://www.youtube.com/watch?v=${live.youtube_id}`;
    return `https://www.youtube.com/watch?v=${DEFAULT_VIDEO_ID}`;
  };

  const now = new Date();
  const liveNow = lives.filter(l => {
    const start = new Date(l.start_time);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); 
    return now >= start && now <= end;
  });

  const upcomingLives = lives.filter(l => {
    const start = new Date(l.start_time);
    return start > now;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-3xl bg-red-600 flex items-center justify-center shadow-[0_10px_30px_rgba(220,38,38,0.3)]">
            <Radio className="h-7 w-7 text-white animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-primary italic leading-none tracking-tighter">CENTRO DE TRANSMISSÕES</h1>
            <p className="text-muted-foreground font-medium italic text-sm md:text-lg">Conecte-se em tempo real com os melhores mentores da rede.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="font-black text-primary uppercase text-[10px] tracking-widest animate-pulse">Sintonizando Estúdio...</p>
        </div>
      ) : (
        <>
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                <h2 className="text-2xl font-black text-primary italic uppercase tracking-tighter">NO AR AGORA</h2>
              </div>
              <Badge variant="outline" className="border-red-200 text-red-600 font-black text-[10px] px-4 py-1">
                {liveNow.length} CANAIS ATIVOS
              </Badge>
            </div>
            
            {liveNow.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {liveNow.map(live => (
                  <Card key={live.id} className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden group hover:shadow-[0_30px_80px_-15px_hsl(var(--accent)/0.3)] transition-all duration-700">
                    <CardHeader className="p-10 pb-6">
                      <div className="flex justify-between items-start gap-6">
                        <div className="min-w-0">
                          <CardTitle className="text-2xl md:text-3xl font-black text-primary italic truncate leading-tight group-hover:text-red-600 transition-colors">{live.title}</CardTitle>
                          <div className="flex items-center gap-3 mt-3 text-muted-foreground">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest">{live.teacher_name || 'Docente da Rede'}</p>
                          </div>
                        </div>
                        <Badge className="bg-red-600 text-white font-black animate-pulse px-6 h-10 border-none shrink-0 text-xs shadow-lg rounded-2xl flex items-center gap-2">
                          <Signal className="h-4 w-4" /> AO VIVO
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-10 pb-10">
                       <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl group-hover:scale-[1.02] transition-transform duration-700 ring-8 ring-primary/5">
                         <iframe 
                           width="100%" 
                           height="100%" 
                           src={`https://www.youtube.com/embed/${live.youtube_id || DEFAULT_VIDEO_ID}?modestbranding=1&rel=0&autoplay=0&showinfo=0`} 
                           title={live.title} 
                           frameBorder="0" 
                           allowFullScreen
                         ></iframe>
                       </div>
                       <div className="mt-8">
                         <Button className="w-full bg-primary text-white h-16 rounded-2xl font-black text-sm uppercase group shadow-xl shadow-primary/20 hover:bg-red-600 transition-all active:scale-95" asChild>
                           <a href={getLiveLink(live)} target="_blank" rel="noopener noreferrer">
                             Expandir para Tela Cheia
                             <ExternalLink className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                           </a>
                         </Button>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-24 text-center border-4 border-dashed border-muted/20 rounded-[4rem] bg-muted/5">
                <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                  <PlayCircle className="h-12 w-12 text-muted-foreground opacity-40" />
                </div>
                <p className="font-black italic text-2xl text-primary">O estúdio está em silêncio...</p>
                <p className="text-muted-foreground font-medium mt-3 italic max-w-md mx-auto">Não há transmissões acontecendo neste exato momento. Que tal revisar o cronograma abaixo?</p>
              </div>
            )}
          </section>

          <section className="space-y-8 pt-10">
            <div className="flex items-center gap-3 px-2">
              <Calendar className="h-6 w-6 text-accent" />
              <h2 className="text-2xl font-black text-primary italic uppercase tracking-tighter">AGENDA DE ENCONTROS</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingLives.length > 0 ? (
                upcomingLives.map((live) => (
                  <Card key={live.id} className="border-none shadow-xl rounded-[2.5rem] bg-white hover:shadow-2xl transition-all group hover:-translate-y-2 duration-500 overflow-hidden flex flex-col">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-primary text-white flex flex-col items-center justify-center shrink-0 shadow-xl group-hover:bg-red-600 transition-colors">
                          <span className="text-[10px] font-black uppercase opacity-60">
                            {new Date(live.start_time).toLocaleDateString('pt-BR', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-black italic leading-none">
                            {new Date(live.start_time).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-accent">
                            <Clock className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {new Date(live.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h3 className="font-black text-lg text-primary italic truncate mt-1">{live.title}</h3>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 mt-auto">
                      <p className="text-xs text-muted-foreground line-clamp-2 italic mb-6 font-medium">"{live.description || 'Sessão oficial de mentoria da rede.'}"</p>
                      <Button variant="outline" className="w-full rounded-xl font-black text-[10px] uppercase border-2 border-dashed border-primary/10 hover:bg-primary hover:text-white transition-all h-12" asChild>
                        <a href={getLiveLink(live)} target="_blank" rel="noopener noreferrer">ATIVAR LEMBRETE</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center opacity-40 border-2 border-dashed border-muted/30 rounded-[3rem]">
                  <p className="font-bold italic text-muted-foreground uppercase tracking-widest text-xs">Nenhuma live agendada para os próximos dias.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
