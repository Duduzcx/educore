"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, Clock, Loader2, Trash2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// TODO: Refatorar para usar o Firebase.
// A lógica de agendamento de lives foi mocada.

const mockInitialLives = [
    {
        id: 'live1',
        title: 'Revisão de Véspera - Humanas',
        description: 'Uma revisão completa dos tópicos mais importantes de história, geografia e filosofia.',
        start_time: new Date(Date.now() + 86400000 * 2).toISOString(), // Em 2 dias
        youtube_id: 'rfscVS0vtbw',
        teacher_id: 'teacher1',
        teacher_name: 'Mentor',
        status: 'scheduled'
    },
    {
        id: 'live2',
        title: 'Aulão de Matemática Básica',
        description: 'Vamos passar pelas operações fundamentais e resolver problemas clássicos do ENEM.',
        start_time: new Date(Date.now() + 86400000 * 5).toISOString(), // Em 5 dias
        youtube_id: 'rfscVS0vtbw',
        teacher_id: 'teacher1',
        teacher_name: 'Mentor',
        status: 'scheduled'
    }
];

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

  const fetchLives = () => {
    setLoading(true);
    setTimeout(() => {
        setLives(mockInitialLives);
        setLoading(false);
    }, 800);
  };

  useEffect(() => {
    if (user) {
        fetchLives();
    }
  }, [user]);

  const handleCreateLive = () => {
    if (!formData.title || !formData.date || !formData.time || !user) {
      toast({ title: "Dados Incompletos", description: "Título, data e horário são obrigatórios.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const start_time = new Date(`${formData.date}T${formData.time}`).toISOString();

    const newLive = {
        id: `live_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        youtube_id: formData.youtube_id || "rfscVS0vtbw",
        start_time,
        teacher_id: user.id,
        teacher_name: user.user_metadata?.full_name || "Mentor",
        status: "scheduled"
    };
    
    setTimeout(() => {
        setLives(prev => [newLive, ...prev].sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
        toast({ title: "Live Agendada!", description: "A transmissão já está na agenda dos alunos." });
        setIsCreateOpen(false);
        setFormData({ title: "", description: "", date: "", time: "", youtube_id: "" });
        setIsSubmitting(false);
    }, 1000);
  };

  const handleDelete = (id: string) => {
    setLives(prev => prev.filter(live => live.id !== id));
    toast({ title: "Live removida" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Studio Core</h1>
          <p className="text-muted-foreground font-medium">Controle suas transmissões e aulas em tempo real.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
              <PlusCircle className="h-6 w-6" /> Agendar Aula Master
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-10 bg-white max-w-lg border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic text-primary">Configurar Transmissão</DialogTitle>
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
                <Label className="text-[10px] font-black uppercase opacity-40">ID do YouTube</Label>
                <Input placeholder="rfscVS0vtbw" value={formData.youtube_id} onChange={(e) => setFormData({...formData, youtube_id: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-medium" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateLive} disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl">
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar na Agenda Oficial"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sincronizando Agenda...</p>
          </div>
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
                  <div className="h-24 w-24 rounded-3xl bg-primary text-white flex flex-col items-center justify-center shadow-lg shrink-0">
                    <span className="text-[10px] font-black uppercase opacity-60">{new Date(live.start_time).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    <span className="text-3xl font-black italic">{new Date(live.start_time).getDate()}</span>
                  </div>
                  <div className="space-y-2 overflow-hidden">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(live.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CardTitle className="text-2xl font-black text-primary italic leading-none truncate">{live.title}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(live.id)} className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all shrink-0">
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
