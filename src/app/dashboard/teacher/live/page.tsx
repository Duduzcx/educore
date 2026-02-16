"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, Clock, Loader2, Trash2, Radio, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ManageLivePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lives, setLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    youtube_id: ""
  });

  async function fetchLives() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('lives')
      .select('*')
      .order('start_time', { ascending: false });

    if (!error && data) {
      setLives(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLives();
  }, [user]);

  const handleCreateLive = async () => {
    if (!formData.title || !formData.date || !formData.time || !user || !formData.youtube_id) {
      toast({ title: "Dados Incompletos", description: "Título, data, horário e ID do YouTube são obrigatórios.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const start_time = new Date(`${formData.date}T${formData.time}`).toISOString();

    const { error } = await supabase
      .from('lives')
      .insert({
        title: formData.title,
        description: formData.description,
        youtube_id: formData.youtube_id,
        start_time,
        teacher_id: user.id,
        status: "scheduled"
      });

    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Live Agendada!", description: "A transmissão já está na agenda oficial." });
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", date: "", time: "", youtube_id: "" });
      fetchLives();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lives').delete().eq('id', id);
    if (!error) {
      setLives(prev => prev.filter(live => live.id !== id));
      toast({ title: "Live removida" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 px-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Studio Core</h1>
          <p className="text-muted-foreground font-medium italic">Gerencie transmissões da rede em tempo real.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
              <PlusCircle className="h-6 w-6" /> Agendar Transmissão
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-10 bg-white max-w-lg border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic text-primary">Configurar Aula ao Vivo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Título da Aula</Label>
                <Input placeholder="Ex: Revisão de Véspera - Humanas" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Data</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Horário</Label>
                  <Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">ID do Vídeo YouTube</Label>
                <Input placeholder="Ex: rfscVS0vtbw" value={formData.youtube_id} onChange={(e) => setFormData({...formData, youtube_id: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-medium" />
                <p className="text-[8px] font-bold text-muted-foreground uppercase px-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Use apenas o código final da URL do vídeo.</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateLive} disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl transition-all">
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar Aula na Rede"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-accent" /></div>
        ) : lives.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed rounded-[3rem] bg-white/50 opacity-40">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p className="font-black italic">Nenhuma live agendada.</p>
          </div>
        ) : (
          lives.map((live) => (
            <Card key={live.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8 flex-1">
                  <div className={`h-24 w-24 rounded-3xl flex flex-col items-center justify-center shadow-lg shrink-0 ${live.status === 'live' ? 'bg-red-600 text-white animate-pulse' : 'bg-primary text-white'}`}>
                    <span className="text-[10px] font-black uppercase opacity-60">{format(new Date(live.start_time), 'MMM', { locale: ptBR })}</span>
                    <span className="text-3xl font-black italic">{format(new Date(live.start_time), 'dd')}</span>
                  </div>
                  <div className="space-y-2 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> {format(new Date(live.start_time), 'HH:mm')}</span>
                      <Badge variant="secondary" className="text-[8px] font-black uppercase px-2">{live.status}</Badge>
                    </div>
                    <CardTitle className="text-2xl font-black text-primary italic leading-none truncate">{live.title}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(live.id)} className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button className="flex-1 md:flex-none h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/10 gap-3 group/btn" asChild>
                    <Link href={`/dashboard/teacher/live/${live.id}`}>
                      Entrar no Estúdio <Radio className="h-4 w-4 group-hover/btn:animate-pulse" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
