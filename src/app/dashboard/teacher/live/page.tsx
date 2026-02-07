
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MonitorPlay, 
  Plus, 
  Trash2, 
  Youtube, 
  Loader2, 
  ExternalLink, 
  Video, 
  Radio, 
  FlaskConical, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Eye, 
  Layers,
  MessageCircle,
  Users
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeacherLiveManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [lives, setLives] = useState<any[]>([]);
  const [trails, setTrails] = useState<any[]>([]);
  const [livesLoading, setLivesLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

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
      const { data: livesData, error: lError } = await supabase.from('lives').select('*').order('created_at', { ascending: false });
      if (lError) {
        if (lError.message.includes('column') || lError.code === '42P01') {
          setSchemaError(lError.message);
          setShowWarning(true);
        } else throw lError;
      } else {
        setLives(livesData || []);
        setSchemaError(null);
        setShowWarning(false);
      }

      const { data: trailsData } = await supabase.from('learning_trails').select('id, title').eq('teacher_id', user.id);
      setTrails(trailsData || []);
    } catch (err: any) {
      console.error("Erro crítico:", err);
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
      const cleanYid = liveForm.youtube_id.split('v=')[1]?.split('&')[0] || liveForm.youtube_id.split('/').pop() || liveForm.youtube_id;
      
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
      toast({ title: "Live Lançada!", description: "A sala de aula agora está conectada." });
      setForm({ title: "", description: "", youtube_id: "", start_time: "", trail_id: "none" });
      setIsAddOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro na Criação", description: "Verifique se a coluna 'trail_id' existe na tabela 'lives'." });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLives = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      const { error } = await supabase.from('lives').insert([{
        title: "Workshop de Revisão Integrada",
        description: "Unindo teoria e prática em tempo real.",
        teacher_name: user.user_metadata?.full_name || "Mentor",
        teacher_id: user.id,
        youtube_id: "rfscVS0vtbw",
        youtube_url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        start_time: new Date().toISOString()
      }]);
      if (error) throw error;
      toast({ title: "Dados Semeados!" });
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Erro no Seed" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lives').delete().eq('id', id);
    if (!error) {
      setLives(lives.filter(l => l.id !== id));
      toast({ title: "Removido" });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none flex items-center gap-3">
            Gestão de Transmissões <Radio className="h-8 w-8 text-red-600 animate-pulse" />
          </h1>
          <p className="text-muted-foreground font-medium italic">Conecte transmissões ao vivo direto nas trilhas de estudo.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSeedLives} disabled={isSeeding} className="rounded-xl h-14 border-dashed border-accent text-accent font-black hover:bg-accent/5">
            {isSeeding ? <Loader2 className="animate-spin h-5 w-5" /> : <FlaskConical className="h-5 w-5 mr-2" />}
            Popular Lives
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 bg-red-600 text-white font-black px-8 shadow-xl hover:bg-red-700">
                <Plus className="h-6 w-6 mr-2" /> Vincular Live à Trilha
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white">
              <DialogHeader><DialogTitle className="text-2xl font-black italic">Nova Sala ao Vivo</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateLive} className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Trilha Vinculada (Opcional)</Label>
                  <Select value={liveForm.trail_id} onValueChange={(v) => setForm({...liveForm, trail_id: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                      <SelectValue placeholder="Selecione uma trilha" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">Nenhuma (Live Geral)</SelectItem>
                      {trails.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Título da Transmissão</Label>
                  <Input value={liveForm.title} onChange={(e) => setForm({...liveForm, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">ID YouTube</Label>
                  <Input value={liveForm.youtube_id} onChange={(e) => setForm({...liveForm, youtube_id: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" required placeholder="rfscVS0vtbw" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-16 bg-red-600 text-white font-black rounded-2xl shadow-xl active:scale-95">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Abrir Sala na Trilha"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {livesLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-accent" /></div>
          ) : (
            <div className="grid gap-6">
              {lives.map((live) => (
                <Card key={live.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
                  <div className="p-8 flex items-center gap-8">
                    <div className="relative aspect-video w-48 bg-black rounded-2xl overflow-hidden shadow-lg shrink-0">
                      <img src={`https://img.youtube.com/vi/${live.youtube_id}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80" alt={live.title} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Youtube className="h-8 w-8 text-white" /></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase">
                          {trails.find(t => t.id === live.trail_id)?.title || 'Geral'}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(live.id)} className="rounded-full hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <h3 className="text-xl font-black text-primary italic leading-none truncate">{live.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">Chat Ativo</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-8 overflow-hidden relative">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ecossistema Social</p>
                  <p className="text-xl font-black italic">Chat Unificado</p>
                </div>
              </div>
              <p className="text-[11px] font-medium opacity-80 leading-relaxed italic">
                O chat das transmissões agora é alimentado pelo sistema de fórum, permitindo que as discussões continuem mesmo após o fim da live.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
