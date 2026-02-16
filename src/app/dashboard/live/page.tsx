
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Video, MonitorPlay, Calendar, Clock, Loader2, ArrowRight, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function LiveClassesPage() {
  const [lives, setLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLives() {
      setLoading(true);
      const { data, error } = await supabase
        .from('lives')
        .select(`
          *,
          teacher:profiles(name)
        `)
        .neq('status', 'finished')
        .order('start_time', { ascending: true });

      if (!error && data) {
        setLives(data);
      }
      setLoading(false);
    }

    fetchLives();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  const liveNow = lives.filter(l => l.status === 'live');
  const upcoming = lives.filter(l => l.status === 'scheduled');

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="space-y-1 px-1">
        <h1 className="text-3xl font-black text-primary italic leading-none">Centro de Transmissões</h1>
        <p className="text-muted-foreground font-medium italic">Aprenda em tempo real com os melhores mentores.</p>
      </div>

      {liveNow.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-xl font-black text-red-600 uppercase tracking-widest italic">Acontecendo Agora</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveNow.map((live) => (
              <Card key={live.id} className="border-none shadow-2xl bg-slate-950 text-white rounded-[2.5rem] overflow-hidden group">
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-red-600 text-white border-none px-4 py-1.5 font-black flex items-center gap-2 animate-pulse">
                      <Signal className="h-3 w-3" /> AO VIVO
                    </Badge>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mentor</p>
                      <p className="font-bold italic text-blue-400">{live.teacher?.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic leading-tight group-hover:text-blue-400 transition-colors">{live.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 italic">{live.description}</p>
                  </div>
                  <Button asChild className="w-full bg-white text-slate-950 hover:bg-blue-400 hover:text-white font-black h-14 rounded-2xl shadow-xl transition-all">
                    <Link href={`/dashboard/live/${live.id}`}>Entrar na Aula <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section> section>
      )}

      <section className="space-y-6">
        <h2 className="text-xl font-black text-primary italic px-2">Próximas Sessões</h2>
        {upcoming.length === 0 && liveNow.length === 0 ? (
          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-12 text-center opacity-50">
            <MonitorPlay className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="font-black italic text-lg text-primary">Nenhuma aula agendada no momento.</p>
            <p className="text-sm font-medium mt-1">Fique atento ao mural de avisos para novas datas!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {upcoming.map((live) => (
              <Card key={live.id} className="border-none shadow-lg bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[8px] font-black uppercase">{format(new Date(live.start_time), 'MMM', { locale: ptBR })}</span>
                      <span className="text-xl font-black italic">{format(new Date(live.start_time), 'dd')}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-primary italic text-lg leading-none">{live.title}</h3>
                      <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Com {live.teacher?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 text-primary font-black italic">
                        <Clock className="h-4 w-4 text-accent" />
                        {format(new Date(live.start_time), 'HH:mm')}
                      </div>
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Início Estimado</span>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-2 font-black">
                      <Link href={`/dashboard/live/${live.id}`}>Ver Detalhes</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
