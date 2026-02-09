
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
  Zap,
  Clock,
  Signal,
  Calendar as CalendarIcon,
  ChevronRight,
  Eye,
  History
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
    trail_id: "none"
  });

  const [liveDate, setLiveDate] = useState("");
  const [liveTime, setLiveTime] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLivesLoading(true);
    try {
      const { data: livesData } = await supabase.from('lives').select('*').order('start_time', { ascending: false });
      setLives(livesData || []);
      
      const { data: trailsData } = await supabase.from('learning_trails').select('id, title').eq('teacher_id', user.id);
      setTrails(trailsData || []);
    } catch (err) {
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
    if (!user || !liveForm.title || !liveForm.youtube_id || !liveDate || !liveTime) {
      toast({ variant: "destructive", title: "Campos Obrigatórios", description: "Defina título, link, data e horário." });
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanYid = liveForm.youtube_id.includes('v=') 
        ? liveForm.youtube_id.split('v=')[1]?.split('&')[0] 
        : liveForm.youtube_id.split('/').pop() || liveForm.youtube_id;

      const combinedStartTime = new Date(`${liveDate}T${liveTime}`).toISOString();

      const { data, error } = await supabase.from('lives').insert({
        title: liveForm.title,
        description: liveForm.description,
        teacher_name: user.user_metadata?.full_name || "Mentor",
        teacher_id: user.id,
        youtube_id: cleanYid,
        youtube_url: `https://www.youtube.com/watch?v=${cleanYid}`,
        start_time: combinedStartTime,
        trail_id: liveForm.trail_id === 'none' ? null : liveForm.trail_id
      }).select().single();

      if (error) throw error;

      setLives([data, ...lives]);
      toast({ title: "Sinal Agendado!", description: "A live já está configurada no cronograma." });
      setIsAddOpen(false);
      setForm({ title: "", description: "", youtube_id: "", trail_id: "none" });
      setLiveDate("");
      setLiveTime("");
    } catch (err) {
      toast({ variant: "destructive", title: "Erro no Agendamento" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lives').delete().eq('id', id);
    if (!error) {
      setLives(lives.filter(l => l.id !== id));
      toast({ title: "Live Removida" });
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      <div className="relative bg-slate-950 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl border-b-8 border-red-600">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse">
                <Signal className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Studio Core</h1>
                <p className="text-red-500 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Centro de Monitoramento Ativo</p>
              </div>
            </div>
            <p className="text-slate-400 font-medium max-w-xl italic text-sm md:text-lg">
              Gerencie transmissões agendadas e interaja com a rede em tempo real.
            </p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 bg-red-600 text-white font-black px-8 shadow-xl hover:bg-red-700 transition-all">
                <Plus className="h-6 w-6 mr-2" /> Agendar Nova Live
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic text-primary">Configurar Transmissão</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLive} className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Título da Aula</Label>
                  <Input 
                    placeholder="Ex: Revisão ENEM Química" 
                    value={liveForm.title}
                    onChange={(e) => setForm({...liveForm, title: e.target.value})}
                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Data da Aula</Label>
                    <Input 
                      type="date"
                      value={liveDate}
                      onChange={(e) => setLiveDate(e.target.value)}
                      className="h-14 rounded-2xl bg-muted/30 border-none font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Horário de Início</Label>
                    <Input 
                      type="time"
                      value={liveTime}
                      onChange={(e) => setLiveTime(e.target.value)}
                      className="h-14 rounded-2xl bg-muted/30 border-none font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">ID do Vídeo YouTube</Label>
                  <Input 
                    placeholder="Ex: rfscVS0vtbw" 
                    value={liveForm.youtube_id}
                    onChange={(e) => setForm({...liveForm, youtube_id: e.target.value})}
                    className="h-14 rounded-2xl bg-muted/30 border-none font-medium"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-red-600 text-white font-black text-lg rounded-2xl shadow-xl">
                  {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Agendar Agora"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          {livesLoading ? (
            <div className="py-32 flex justify-center"><Loader2 className="animate-spin h-12 w-12 text-red-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {lives.map((live) => (
                <Card key={live.id} className="group border-none bg-white rounded-[2.5rem] overflow-hidden shadow-xl transition-all duration-500 hover:border-red-600 border-t-4 border-transparent flex flex-col">
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img 
                      src={`https://img.youtube.com/vi/${live.youtube_id}/maxresdefault.jpg`} 
                      className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
                      alt={live.title}
                      onError={(e) => { (e.target as any).src = `https://img.youtube.com/vi/${live.youtube_id}/mqdefault.jpg` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                       <h3 className="text-2xl font-black text-white italic leading-tight">{live.title}</h3>
                       <div className="flex items-center gap-4 mt-2 text-white/60">
                         <div className="flex items-center gap-1.5">
                           <CalendarIcon className="h-3.5 w-3.5 text-red-500" />
                           <span className="text-[10px] font-bold uppercase">{new Date(live.start_time).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                           <Clock className="h-3.5 w-3.5 text-red-500" />
                           <span className="text-[10px] font-bold uppercase">{new Date(live.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-8 flex flex-col gap-6 bg-white mt-auto">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-slate-200 text-slate-600 font-bold uppercase text-[8px]">Agendada</Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(live.id)} className="rounded-full text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <Button asChild className="w-full bg-slate-900 text-white hover:bg-red-600 font-black h-14 rounded-2xl shadow-xl gap-3">
                      <Link href={`/dashboard/teacher/live/${live.id}`}>Monitorar Estúdio <ChevronRight className="h-5 w-5" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none bg-white rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Zap className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black uppercase opacity-40">Status Rede</p>
                <p className="text-xl font-black italic">Operacional</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
