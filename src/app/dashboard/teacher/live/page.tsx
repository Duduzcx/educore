"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MonitorPlay, PlusCircle, Video, Calendar, Clock, Loader2, Trash2, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

  const fetchLives = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('lives')
      .select('*')
      .eq('teacher_id', user.id)
      .order('start_time', { ascending: true });
    
    if (!error) setLives(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLives();
  }, [user]);

  const handleCreateLive = async () => {
    if (!formData.title || !formData.date || !formData.time || !user) {
      toast({ title: "Dados Incompletos", description: "Por favor, preencha o título, a data e o horário.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const start_time = new Date(`${formData.date}T${formData.time}`).toISOString();

    const { error } = await supabase.from('lives').insert({
      title: formData.title,
      description: formData.description,
      youtube_id: formData.youtube_id || "rfscVS0vtbw",
      start_time,
      teacher_id: user.id,
      teacher_name: user.user_metadata?.full_name || "Mentor",
      status: "scheduled"
    });

    if (!error) {
      toast({ title: "Live Agendada!", description: "Os alunos já podem ver na agenda." });
      setIsCreateOpen(false);
      setFormData({ title: "", description: "", date: "", time: "", youtube_id: "" });
      fetchLives();
    } else {
      toast({ title: "Erro ao agendar", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lives').delete().eq('id', id);
    if (!error) {
      toast({ title: "Live removida" });
      fetchLives();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Gerenciar Studio Core</h1>
          <p className="text-muted-foreground font-medium">Controle suas transmissões e interaja em tempo real.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl shadow-accent/20 hover:scale-105 transition-all">
              <PlusCircle className="h-6 w-6 mr-2" /> Agendar Nova Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-10 bg-white max-w-lg border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic text-primary">Configurar Transmissão</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Título da Aula</Label>
                <Input placeholder="Ex: Revisão de Álgebra" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
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
                <Label className="text-[10px] font-black uppercase opacity-40">ID do YouTube</Label>
                <Input placeholder="Ex: rfscVS0vtbw" value={formData.youtube_id} onChange={(e) => setFormData({...formData, youtube_id: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Descrição</Label>
                <Textarea placeholder="O que será abordado?" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-xl bg-muted/30 border-none min-h-[100px]" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateLive} disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar na Agenda"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Sincronizando Studio...</p>
          </div>
        ) : lives.length === 0 ? (
          <Card className="border-4 border-dashed border-muted/20 bg-muted/5 rounded-[2.5rem] p-20 text-center opacity-40">
            <Video className="h-16 w-16 mx-auto mb-4" />
            <p className="text-xl font-black italic">Nenhuma live agendada</p>
            <p className="text-sm font-medium mt-2">Clique em "Agendar Nova Aula" para começar.</p>
          </Card>
        ) : (
          lives.map((live) => (
            <Card key={live.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8 flex-1">
                  <div className="h-24 w-24 rounded-3xl bg-primary text-white flex flex-col items-center justify-center shadow-lg shrink-0">
                    <span className="text-[10px] font-black uppercase opacity-60">{new Date(live.start_time).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    <span className="text-3xl font-black italic">{new Date(live.start_time).getDate()}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase px-2">Studio Master</Badge>
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(live.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <CardTitle className="text-2xl font-black text-primary italic leading-none">{live.title}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-1 italic">{live.description || "Sem descrição informada."}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(live.id)} className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all shrink-0">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button className="flex-1 md:flex-none h-14 px-8 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/10 gap-3 group/btn" asChild>
                    <Link href={`/dashboard/teacher/live/${live.id}`}>
                      Entrar no Estúdio
                      <Radio className="h-4 w-4 group-hover/btn:animate-pulse" />
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