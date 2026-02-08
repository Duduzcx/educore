
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MonitorPlay, 
  Plus, 
  Trash2, 
  Youtube, 
  Loader2, 
  Video, 
  Radio, 
  MessageCircle,
  Users,
  Zap,
  Clock,
  Signal,
  Activity,
  History,
  ExternalLink,
  Eye,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function TeacherLiveManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [lives, setLives] = useState<any[]>([]);
  const [trails, setTrails] = useState<any[]>([]);
  const [livesLoading, setLivesLoading] = useState(true);

  const [liveForm, setForm] = useState({
    title: "",
    description: "",
    youtube_id: "",
    start_time: "",
    trail_id: "none"
  });

  const fetchData = async () => {
    if (!user) return;
    setLivesLoading(true);
    try {
      const { data: livesData, error: lError } = await supabase.from('lives').select('*').order('start_time', { ascending: false });
      if (!lError) setLives(livesData || []);
      
      const { data: trailsData } = await supabase.from('learning_trails').select('id, title').eq('teacher_id', user.id);
      setTrails(trailsData || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLivesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !liveForm.title || !liveForm.youtube_id) return;

    setIsSubmitting(true);
    try {
      const cleanYid = liveForm.youtube_id.includes('v=') 
        ? liveForm.youtube_id.split('v=')[1]?.split('&')[0] 
        : liveForm.youtube_id.split('/').pop() || liveForm.youtube_id;

      const { data, error } = await supabase.from('lives').insert({
        title: liveForm.title,
        description: liveForm.description,
        teacher_name: user.user_metadata?.full_name || "Docente da Rede",
        teacher_id: user.id,
        youtube_id: cleanYid,
        youtube_url: `https://www.youtube.com/watch?v=${cleanYid}`,
        url: `https://www.youtube.com/watch?v=${cleanYid}`,
        start_time: liveForm.start_time || new Date().toISOString(),
        trail_id: liveForm.trail_id === 'none' ? null : liveForm.trail_id
      }).select().single();

      if (error) throw error;

      setLives([data, ...lives]);
      toast({ title: "Transmissão Agendada!", description: "O sinal já está configurado no portal." });
      setForm({ title: "", description: "", youtube_id: "", start_time: "", trail_id: "none" });
      setIsAddOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro no Estúdio", description: "Verifique os dados ou se as tabelas existem." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedLives = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const demoLives = [
        {
          title: "Aulão de Redação: Nota 1000",
          description: "Técnicas de argumentação para o ENEM.",
          teacher_name: user.user_metadata?.full_name || "Mentor",
          teacher_id: user.id,
          youtube_id: "rfscVS0vtbw",
          youtube_url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
          url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
          start_time: new Date().toISOString()
        }
      ];
      const { error } = await supabase.from('lives').insert(demoLives);
      if (error) throw error;
      toast({ title: "Estúdio Populado!", description: "Transmissões de demonstração criadas." });
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao gerar demos" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lives').delete().eq('id', id);
    if (!error) {
      setLives(lives.filter(l => l.id !== id));
      toast({ title: "Sinal Encerrado", description: "A transmissão foi removida do sistema." });
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      <div className="relative bg-slate-950 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl border-b-8 border-red-600">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse">
                <Signal className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Studio Core</h1>
                <p className="text-red-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Master Control Room • Ativo</p>
              </div>
            </div>
            <p className="text-slate-400 font-medium max-w-xl italic text-sm md:text-lg">
              Gerencie transmissões e interaja com alunos em tempo real através do monitoramento de estúdio integrado.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleSeedLives} 
              disabled={isSeeding}
              className="rounded-2xl h-14 border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 px-6 font-black uppercase text-[10px] tracking-widest transition-all"
            >
              {isSeeding ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <History className="h-4 w-4 mr-2 text-red-500" />}
              Restaurar Demos
            </Button>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl h-14 bg-red-600 text-white font-black px-8 shadow-[0_10px_40px_rgba(220,38,38,0.4)] hover:bg-red-700 hover:scale-105 active:scale-95 transition-all">
                  <Plus className="h-6 w-6 mr-2" /> Agendar Nova Live
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic text-primary flex items-center gap-3">
                    <Video className="h-6 w-6 text-red-600" /> Configurar Sinal
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateLive} className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Vincular à Trilha (Opcional)</Label>
                    <Select value={liveForm.trail_id} onValueChange={(v) => setForm({...liveForm, trail_id: v})}>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                        <SelectValue placeholder="Selecione uma trilha" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="none">Live Geral (Mural de Lives)</SelectItem>
                        {trails.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Título da Live</Label>
                    <Input 
                      placeholder="Ex: Revisão de Cálculo" 
                      value={liveForm.title}
                      onChange={(e) => setForm({...liveForm, title: e.target.value})}
                      className="h-14 rounded-2xl bg-muted/30 border-none font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Link ou ID do YouTube</Label>
                    <div className="relative">
                      <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                      <Input 
                        placeholder="youtube.com/watch?v=..." 
                        value={liveForm.youtube_id}
                        onChange={(e) => setForm({...liveForm, youtube_id: e.target.value})}
                        className="h-14 pl-12 rounded-2xl bg-muted/30 border-none font-medium"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-red-600 text-white font-black text-lg rounded-2xl shadow-xl">
                    {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Iniciar Agendamento"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-primary italic flex items-center gap-3">
              <MonitorPlay className="h-6 w-6 text-red-600" />
              Monitoramento de Sinais
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sistema Operacional</span>
            </div>
          </div>

          {livesLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin h-12 w-12 text-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Sincronizando Estúdio...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {lives.map((live) => (
                <Card key={live.id} className="group border-none bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(220,38,38,0.2)] transition-all duration-500 flex flex-col border-t-4 border-transparent hover:border-red-600">
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img 
                      src={`https://img.youtube.com/vi/${live.youtube_id}/maxresdefault.jpg`} 
                      className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
                      alt={live.title}
                      onError={(e) => { (e.target as any).src = `https://img.youtube.com/vi/${live.youtube_id}/mqdefault.jpg` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-90" />
                    
                    <div className="absolute bottom-6 left-6 right-6">
                       <h3 className="text-2xl font-black text-white italic leading-tight line-clamp-1">{live.title}</h3>
                       <div className="flex items-center gap-4 mt-3 text-white/60">
                         <div className="flex items-center gap-1.5">
                           <Clock className="h-3.5 w-3.5 text-red-500" />
                           <span className="text-[10px] font-bold uppercase">{new Date(live.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <Users className="h-3.5 w-3.5 text-blue-400" />
                           <span className="text-[10px] font-bold uppercase">Monitorando</span>
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-8 flex flex-col gap-6 bg-white mt-auto">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-slate-200 text-slate-600 font-bold">
                        {trails.find(t => t.id === live.trail_id)?.title || 'Geral'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => window.open(live.youtube_url || live.url, '_blank')} className="rounded-full text-slate-400 hover:text-primary" title="Ver como Aluno"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(live.id)} className="rounded-full text-slate-400 hover:text-red-600" title="Remover Sinal"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full bg-slate-900 text-white hover:bg-red-600 font-black h-14 rounded-2xl shadow-xl gap-3 transition-all">
                      <Link href={`/dashboard/teacher/live/${live.id}`}>
                        Monitorar Estúdio <ChevronRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none bg-white rounded-[2.5rem] p-8 shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Zap className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40">Status Rede</p>
                  <p className="text-xl font-black italic">Operacional</p>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-green-500" />
              </div>
            </div>
          </Card>

          <Card className="border-none bg-slate-900 text-white rounded-[2.5rem] p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400"><MessageCircle className="h-5 w-5" /></div>
                <p className="font-black italic">Fluxo de Interação</p>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed italic">As perguntas dos alunos aparecem instantaneamente no seu monitor de estúdio. Clique em "Monitorar" para interagir.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
