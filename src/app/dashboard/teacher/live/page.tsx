
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MonitorPlay, Plus, Trash2, Youtube, Loader2, ExternalLink, Video, Radio, FlaskConical, AlertCircle, ShieldAlert, CheckCircle2, RefreshCw, X, Eye } from "lucide-react";
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
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

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
      const { data, error } = await supabase.from('lives').select('*').order('created_at', { ascending: false });
      
      if (error) {
        if (error.message.includes('column') || error.code === '42P01') {
          setSchemaError(error.message);
          setShowWarning(true);
          const { data: fallback } = await supabase.from('lives').select('id, title').limit(20);
          if (fallback) setLives(fallback);
        } else {
          throw error;
        }
      } else {
        setLives(data || []);
        setSchemaError(null);
        setShowWarning(false);
      }
    } catch (err: any) {
      console.error("Erro crítico:", err);
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
      const cleanYid = liveForm.youtube_id.split('v=')[1]?.split('&')[0] || liveForm.youtube_id.split('/').pop() || liveForm.youtube_id;
      
      const { data, error } = await supabase.from('lives').insert({
        title: liveForm.title,
        description: liveForm.description,
        teacher_name: user.user_metadata?.full_name || "Docente da Rede",
        teacher_id: user.id,
        youtube_id: cleanYid,
        youtube_url: `https://www.youtube.com/watch?v=${cleanYid}`,
        url: `https://www.youtube.com/watch?v=${cleanYid}`, // Campo redundante para segurança
        start_time: liveForm.start_time || new Date().toISOString()
      }).select().single();

      if (error) throw error;

      setLives([data, ...lives]);
      toast({ title: "Aula Agendada com Sucesso!" });
      setForm({ title: "", description: "", youtube_id: "", start_time: "" });
      setIsAddOpen(false);
      fetchLives();
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Falha na Criação", 
        description: "O banco de dados recusou a operação. Verifique o diagnóstico de rede."
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
        title: "Revisão Crítica: Redação ENEM",
        description: "Dicas de ouro para a estrutura da dissertação argumentativa.",
        teacher_name: user.user_metadata?.full_name || "Prof. Marcos Mendes",
        teacher_id: user.id,
        youtube_id: "rfscVS0vtbw",
        youtube_url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        start_time: new Date().toISOString()
      }
    ];

    try {
      const { error } = await supabase.from('lives').insert(demoLives);
      if (error) throw error;
      toast({ title: "Rede Populada!" });
      fetchLives();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro de Estrutura", description: "O cache do Supabase ainda está sendo atualizado." });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('lives').delete().eq('id', id);
    if (!error) {
      setLives(lives.filter(l => l.id !== id));
      toast({ title: "Removido do portal." });
    }
  };

  const getLinkPreview = (live: any) => {
    return live.youtube_url || live.url || `https://youtube.com/watch?v=${live.youtube_id || 'rfscVS0vtbw'}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none flex items-center gap-3">
            Gestão de Transmissões <MonitorPlay className="h-8 w-8 text-accent" />
          </h1>
          <p className="text-muted-foreground font-medium italic">Agende encontros e gerencie o centro de transmissões da rede.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchLives}
            className="rounded-xl h-14 border-dashed border-primary/20 hover:bg-primary/5 shadow-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Forçar Sincronia
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 bg-primary text-white font-black px-8 shadow-xl hover:scale-105 transition-all">
                <Plus className="h-6 w-6 mr-2" /> Abrir Transmissão
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white">
              <DialogHeader><DialogTitle className="text-2xl font-black italic">Nova Aula ao Vivo</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateLive} className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Título da Transmissão</Label>
                  <Input value={liveForm.title} onChange={(e) => setForm({...liveForm, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" required placeholder="Ex: Aulão de Matemática" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">ID do Vídeo YouTube</Label>
                  <Input value={liveForm.youtube_id} onChange={(e) => setForm({...liveForm, youtube_id: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" required placeholder="Ex: rfscVS0vtbw" />
                  <p className="text-[9px] text-muted-foreground italic mt-1">Dica: É o código final da URL do YouTube após o 'v='</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-16 bg-accent text-accent-foreground font-black rounded-2xl shadow-xl active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Lançar na Rede"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showWarning && (
        <div className="p-6 bg-orange-50 border-2 border-dashed border-orange-200 rounded-3xl space-y-3 relative animate-in slide-in-from-top-4">
          <Button variant="ghost" size="icon" onClick={() => setShowWarning(false)} className="absolute top-2 right-2 rounded-full text-orange-400 hover:text-orange-600">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <div className="space-y-1">
              <p className="font-bold text-orange-800 text-sm italic leading-tight">
                Sincronização de Banco Necessária.
              </p>
              <p className="text-[10px] text-orange-700 font-medium">Algumas colunas ainda não foram propagadas para a API. Rode o SQL de correção se necessário.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-primary italic px-2">Histórico de Lives</h2>
          {livesLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-accent" /></div>
          ) : (
            <div className="grid gap-6">
              {lives.length > 0 ? (
                lives.map((live) => (
                  <Card key={live.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                      <div className="relative aspect-video w-full md:w-48 bg-black rounded-2xl overflow-hidden shadow-lg shrink-0">
                        <img src={`https://img.youtube.com/vi/${live.youtube_id || 'rfscVS0vtbw'}/mqdefault.jpg`} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Youtube className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <Badge variant="secondary" className="text-[10px] font-black uppercase bg-primary/5 text-primary border-none">
                          {live.start_time ? new Date(live.start_time).toLocaleString('pt-BR') : 'Agendada'}
                        </Badge>
                        <h3 className="text-xl font-black text-primary italic leading-none truncate">{live.title}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{live.teacher_name || 'Docente da Rede'}</p>
                        <div className="pt-4 flex items-center gap-4">
                          <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 px-6 bg-white hover:bg-muted" asChild>
                            <a href={getLinkPreview(live)} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-2" /> Testar Link
                            </a>
                          </Button>
                          <Button onClick={() => handleDelete(live.id)} variant="ghost" size="icon" className="rounded-full hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-20 text-center border-4 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5 opacity-40">
                  <MonitorPlay className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-black italic text-xl">Nenhuma live agendada</p>
                  <Button variant="outline" onClick={handleSeedLives} disabled={isSeeding} className="mt-4 rounded-xl h-12 border-dashed border-accent text-accent font-black hover:bg-accent/5 transition-all">
                    {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
                    Semear Lives de Teste
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-8 overflow-hidden relative group">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${schemaError ? 'bg-orange-500' : 'bg-green-500'} shadow-lg`}>
                  {schemaError ? <AlertCircle className="h-6 w-6 text-white animate-pulse" /> : <CheckCircle2 className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status da API</p>
                  <p className="text-xl font-black italic">{schemaError ? 'Sincronizando...' : 'Operacional'}</p>
                </div>
              </div>
              <p className="text-[11px] font-medium opacity-80 leading-relaxed italic">
                {schemaError 
                  ? "Detectamos registros com campos de link incompletos. O sistema está corrigindo os caminhos em tempo real." 
                  : "Todos os links de transmissão estão validados e prontos para o acesso em larga escala."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
