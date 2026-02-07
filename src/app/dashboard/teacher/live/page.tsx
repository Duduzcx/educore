
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MonitorPlay, Plus, Trash2, Youtube, Loader2, ExternalLink, Video, Radio, FlaskConical } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function TeacherLiveManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [lives, setLives] = useState<any[]>([]);
  const [livesLoading, setLivesLoading] = useState(true);

  const [liveForm, setForm] = useState({
    title: "",
    description: "",
    youtube_id: "",
    start_time: ""
  });

  const fetchLives = async () => {
    if (!user) return;
    setLivesLoading(true);
    try {
      const { data, error } = await supabase.from('lives').select('*').order('start_time', { ascending: false });
      if (error) throw error;
      setLives(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar lives:", err);
    } finally {
      setLivesLoading(false);
    }
  };

  useEffect(() => {
    fetchLives();
  }, [user]);

  const handleCreateLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !liveForm.title || !liveForm.youtube_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from('lives').insert({
        title: liveForm.title,
        description: liveForm.description,
        teacher_name: user.user_metadata?.full_name || "Docente da Rede",
        teacher_id: user.id,
        youtube_id: liveForm.youtube_id,
        youtube_url: `https://www.youtube.com/watch?v=${liveForm.youtube_id}`,
        start_time: liveForm.start_time || new Date().toISOString()
      }).select().single();

      if (error) throw error;

      setLives([data, ...lives]);
      toast({ title: "Aula Agendada!" });
      setForm({ title: "", description: "", youtube_id: "", start_time: "" });
      setIsAddOpen(false);
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao Agendar", 
        description: err.message.includes('teacher_id') 
          ? "Coluna 'teacher_id' não encontrada. Execute o SQL de emergência no Supabase." 
          : err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLives = async () => {
    if (!user) return;
    setIsSeeding(true);
    
    const demoLives = [
      {
        title: "Revisão Final: Redação ENEM",
        description: "Dicas de ouro para a estrutura da dissertação argumentativa.",
        teacher_name: user.user_metadata?.full_name || "Mentor Demo",
        teacher_id: user.id,
        youtube_id: "rfscVS0vtbw",
        youtube_url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        start_time: new Date().toISOString()
      },
      {
        title: "Biologia: Genética e Mendel",
        description: "Tudo sobre as leis de Mendel e probabilidade genética.",
        teacher_name: user.user_metadata?.full_name || "Mentor Demo",
        teacher_id: user.id,
        youtube_id: "rfscVS0vtbw",
        youtube_url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        start_time: new Date(Date.now() + 86400000).toISOString()
      },
      {
        title: "Física: Leis de Newton",
        description: "Aplicações práticas de dinâmica para o vestibular.",
        teacher_name: user.user_metadata?.full_name || "Mentor Demo",
        teacher_id: user.id,
        youtube_id: "rfscVS0vtbw",
        youtube_url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        start_time: new Date(Date.now() + 172800000).toISOString()
      }
    ];

    try {
      const { error } = await supabase.from('lives').insert(demoLives);
      if (error) throw error;
      toast({ title: "Lives Geradas!", description: "3 novas transmissões foram adicionadas." });
      fetchLives();
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro no Seed", 
        description: "Verifique se as colunas 'teacher_id' e 'teacher_name' existem na tabela 'lives'." 
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lives').delete().eq('id', id);
    if (!error) {
      setLives(lives.filter(l => l.id !== id));
      toast({ title: "Transmissão removida." });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none flex items-center gap-3">
            Gerenciar Lives <MonitorPlay className="h-8 w-8 text-accent" />
          </h1>
          <p className="text-muted-foreground font-medium">Controle as aulas ao vivo no Supabase.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSeedLives} 
            disabled={isSeeding}
            className="rounded-xl h-14 border-dashed border-accent text-accent font-black hover:bg-accent/5 px-6 shadow-sm"
          >
            {isSeeding ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
            Gerar Lives de Teste
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 bg-primary text-white font-black px-8 shadow-xl">
                <Plus className="h-6 w-6 mr-2" /> Nova Transmissão
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white">
              <DialogHeader><DialogTitle className="text-2xl font-black italic">Abrir Live</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateLive} className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Título do Aulão</Label>
                  <Input value={liveForm.title} onChange={(e) => setForm({...liveForm, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">YouTube ID</Label>
                  <Input value={liveForm.youtube_id} onChange={(e) => setForm({...liveForm, youtube_id: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" required placeholder="Ex: rfscVS0vtbw" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Data e Hora</Label>
                  <Input type="datetime-local" value={liveForm.start_time} onChange={(e) => setForm({...liveForm, start_time: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Descrição</Label>
                  <Textarea value={liveForm.description} onChange={(e) => setForm({...liveForm, description: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30 border-none resize-none p-4" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-16 bg-accent text-accent-foreground font-black rounded-2xl shadow-xl">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar na Rede"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-primary italic px-2">Suas Transmissões</h2>
          {livesLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-accent" /></div>
          ) : (
            <div className="grid gap-6">
              {lives.map((live) => (
                <Card key={live.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
                  <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative aspect-video w-full md:w-48 bg-black rounded-2xl overflow-hidden shadow-lg shrink-0">
                      <img src={`https://img.youtube.com/vi/${live.youtube_id}/mqdefault.jpg`} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">{new Date(live.start_time).toLocaleString('pt-BR')}</Badge>
                      <h3 className="text-xl font-black text-primary italic leading-none">{live.title}</h3>
                      <div className="pt-4 flex items-center gap-4">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 px-6" asChild>
                          <a href={live.youtube_url} target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> Assistir</a>
                        </Button>
                        <Button onClick={() => handleDelete(live.id)} variant="ghost" size="icon" className="rounded-full hover:text-red-500 transition-all"><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {lives.length === 0 && (
                <div className="p-20 text-center border-4 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5 opacity-40">
                  <MonitorPlay className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black italic text-xl">Nenhuma live ativa</p>
                  <p className="text-sm font-medium mt-2">Clique em "Gerar Lives de Teste" para popular a rede.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
