
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
  FlaskConical, 
  MessageCircle,
  Users,
  Zap,
  Play,
  Clock,
  Settings2,
  Signal,
  Eye,
  ExternalLink,
  Activity
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
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
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
      toast({ variant: "destructive", title: "Erro no Estúdio", description: "Verifique os dados da transmissão." });
    } finally {
      setLoading(false);
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
      {/* Comand Center Header */}
      <div className="relative bg-primary rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl border-b-8 border-red-600">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse">
                <Signal className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Studio Core</h1>
            </div>
            <p className="text-white/60 font-medium max-w-xl italic text-sm md:text-lg">
              Gerencie transmissões e interaja com alunos em tempo real através do monitoramento de estúdio integrado.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleSeedLives} 
              disabled={isSeeding}
              className="rounded-2xl h-14 border-dashed border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 font-black uppercase text-[10px] tracking-widest"
            >
              {isSeeding ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <FlaskConical className="h-4 w-4 mr-2 text-red-500" />}
              Gerar Lives Demo
            </Button>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl h-14 bg-red-600 text-white font-black px-8 shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:bg-red-700 hover:scale-105 active:scale-95 transition-all">
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
                      <SelectContent className="rounded-2xl">
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
                  <Button type="submit" disabled={loading} className="w-full h-16 bg-red-600 text-white font-black text-lg rounded-2xl shadow-xl">
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Iniciar Agendamento"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-primary italic flex items-center gap-3">
              <MonitorPlay className="h-6 w-6 text-red-600" />
              Transmissões Ativas e Agendadas
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Sync On</span>
            </div>
          </div>

          {livesLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin h-12 w-12 text-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Sincronizando Sinal...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lives.map((live) => (
                <Card key={live.id} className="group border-none bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col">
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img 
                      src={`https://img.youtube.com/vi/${live.youtube_id}/maxresdefault.jpg`} 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                      alt={live.title}
                      onError={(e) => { (e.target as any).src = `https://img.youtube.com/vi/${live.youtube_id}/mqdefault.jpg` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-red-600 text-white border-none font-black text-[8px] uppercase px-3 py-1 shadow-lg">
                        {new Date(live.start_time) <= new Date() ? 'AO VIVO' : 'AGENDADA'}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                       <h3 className="text-xl font-black text-white italic leading-tight line-clamp-1">{live.title}</h3>
                       <div className="flex items-center gap-3 mt-2 text-white/60">
                         <div className="flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           <span className="text-[10px] font-bold uppercase">{new Date(live.start_time).toLocaleDateString()}</span>
                         </div>
                         <div className="h-1 w-1 rounded-full bg-white/20" />
                         <div className="flex items-center gap-1">
                           <Users className="h-3 w-3" />
                           <span className="text-[10px] font-bold uppercase">Interativo</span>
                         </div>
                       </div>
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col gap-4 bg-white mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Destino do Sinal</p>
                        <p className="text-xs font-bold text-primary truncate max-w-[150px]">
                          {trails.find(t => t.id === live.trail_id)?.title || 'Mural Geral'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(live.id)}
                          className="h-10 w-10 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black h-12 rounded-xl shadow-lg gap-2">
                      <Link href={`/dashboard/teacher/live/${live.id}`}>
                        <Activity className="h-4 w-4" /> Monitorar Estúdio
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {lives.length === 0 && (
                <div className="col-span-full p-20 text-center border-4 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5 opacity-40">
                  <MonitorPlay className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black italic text-xl">Estúdio em Silêncio</p>
                  <p className="text-sm font-medium mt-2">Clique em "Agendar Nova Live" para iniciar suas transmissões.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Status Panels */}
        <div className="space-y-8">
          <Card className="border-none bg-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-600/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Monitoramento</p>
                  <p className="text-xl font-black italic">Sinal Ativo</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase opacity-60">
                  <span>Qualidade</span>
                  <span className="text-green-600">4K Ultra HD</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-green-500" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none bg-primary text-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-red-600/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-red-500">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/40">Moderação Social</p>
                  <p className="text-xl font-black italic">Dúvidas Ativas</p>
                </div>
              </div>
              <p className="text-[11px] font-medium leading-relaxed italic text-white/60">
                O sistema de moderação prioriza as dúvidas enviadas pelo botão especial do aluno, permitindo que você responda as questões mais importantes primeiro.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
