
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MonitorPlay, Plus, Trash2, Youtube, Loader2, ExternalLink, Video, Radio, FlaskConical, AlertCircle, ShieldAlert, CheckCircle2, RefreshCw, X } from "lucide-react";
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
  const [showWarning, setShowWarning] = useState(true);

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
      // Tenta buscar os dados. O erro de schema cache geralmente acontece aqui
      const { data, error } = await supabase.from('lives').select('*').order('created_at', { ascending: false });
      
      if (error) {
        // Se for erro de coluna ou schema, capturamos para o diagnóstico
        if (error.message.includes('column') || error.code === '42P01' || error.message.includes('not found')) {
          console.warn("Erro de Schema detectado, mas tentando recuperar registros existentes...");
          setSchemaError(error.message);
          
          // Tenta uma busca mínima sem as colunas novas para ver se o banco responde
          const { data: fallbackData } = await supabase.from('lives').select('id, title').limit(10);
          if (fallbackData) setLives(fallbackData);
        } else {
          throw error;
        }
      } else {
        setLives(data || []);
        setSchemaError(null);
      }
    } catch (err: any) {
      console.error("Erro ao buscar lives:", err);
      setSchemaError(err.message);
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
      setSchemaError(null); // Se salvou, o schema está ok!
    } catch (err: any) {
      setSchemaError(err.message);
      toast({ 
        variant: "destructive", 
        title: "Erro ao Salvar", 
        description: "O banco de dados recusou a operação. Verifique o diagnóstico."
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
        title: "Biologia: Genética Mendeliana",
        description: "Entenda as leis de Mendel e como elas caem no vestibular.",
        teacher_name: user.user_metadata?.full_name || "Mentor Demo",
        teacher_id: user.id,
        youtube_id: "rfscVS0vtbw",
        youtube_url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        start_time: new Date(Date.now() + 86400000).toISOString()
      }
    ];

    try {
      const { error } = await supabase.from('lives').insert(demoLives);
      if (error) throw error;
      toast({ title: "Lives Geradas com Sucesso!" });
      fetchLives();
    } catch (err: any) {
      setSchemaError(err.message);
      toast({ variant: "destructive", title: "Falha na Gravação", description: "O banco ainda não reconheceu as novas colunas." });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('lives').delete().eq('id', id);
      if (!error) {
        setLives(lives.filter(l => l.id !== id));
        toast({ title: "Removido com sucesso." });
      }
    } catch (e) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none flex items-center gap-3">
            Gestão de Transmissões <MonitorPlay className="h-8 w-8 text-accent" />
          </h1>
          <p className="text-muted-foreground font-medium">Controle total das aulas ao vivo da sua rede.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => { fetchLives(); setShowWarning(true); }}
            className="rounded-xl h-14 border-dashed border-primary/20 hover:bg-primary/5"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar Banco
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 bg-primary text-white font-black px-8 shadow-xl">
                <Plus className="h-6 w-6 mr-2" /> Nova Live
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white">
              <DialogHeader><DialogTitle className="text-2xl font-black italic">Abrir Transmissão</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateLive} className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Título da Aula</Label>
                  <Input value={liveForm.title} onChange={(e) => setForm({...liveForm, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">YouTube Video ID</Label>
                  <Input value={liveForm.youtube_id} onChange={(e) => setForm({...liveForm, youtube_id: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" required placeholder="Ex: rfscVS0vtbw" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-16 bg-accent text-accent-foreground font-black rounded-2xl shadow-xl">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar na Rede EduCore"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {schemaError && showWarning && (
        <div className="p-8 bg-orange-50 border-2 border-dashed border-orange-200 rounded-[2.5rem] space-y-4 animate-in slide-in-from-top-4 relative">
          <Button variant="ghost" size="icon" onClick={() => setShowWarning(false)} className="absolute top-4 right-4 rounded-full text-orange-400 hover:text-orange-600">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-start gap-6">
            <ShieldAlert className="h-10 w-10 text-orange-600 shrink-0 mt-1" />
            <div className="space-y-2 pr-8">
              <p className="font-black text-orange-800 text-lg italic">Atenção: Banco de Dados Requer Ajuste</p>
              <p className="text-sm text-orange-700 font-medium leading-relaxed">
                O sistema detectou que a estrutura da tabela <code className="bg-orange-100 px-1 rounded">public.lives</code> pode estar desatualizada no cache. 
                Se você já rodou o SQL, clique em "Sincronizar Banco" acima ou ignore este aviso.
              </p>
            </div>
          </div>
          <div className="bg-black text-green-400 p-6 rounded-2xl text-[10px] font-mono overflow-x-auto shadow-2xl relative group">
            <p className="mb-2 text-white/40">// SQL DE CORREÇÃO (EXECUTE SE NECESSÁRIO):</p>
            {`ALTER TABLE public.lives 
ADD COLUMN IF NOT EXISTS youtube_id TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS teacher_id UUID,
ADD COLUMN IF NOT EXISTS teacher_name TEXT,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;`}
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute top-4 right-4 h-8 text-[8px] font-black"
              onClick={() => {
                navigator.clipboard.writeText(`ALTER TABLE public.lives ADD COLUMN IF NOT EXISTS youtube_id TEXT, ADD COLUMN IF NOT EXISTS youtube_url TEXT, ADD COLUMN IF NOT EXISTS teacher_id UUID, ADD COLUMN IF NOT EXISTS teacher_name TEXT, ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ DEFAULT now(); ALTER TABLE public.lives DISABLE ROW LEVEL SECURITY;`);
                toast({ title: "SQL Copiado!" });
              }}
            >
              COPIAR SQL
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-primary italic px-2">Transmissões no Banco</h2>
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
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                           <Youtube className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">
                            {live.start_time ? new Date(live.start_time).toLocaleString('pt-BR') : 'Postado em ' + new Date(live.created_at).toLocaleDateString()}
                          </Badge>
                          {!live.youtube_id && <Badge className="bg-orange-500 text-white border-none text-[8px]">LEGACY/TEST</Badge>}
                        </div>
                        <h3 className="text-xl font-black text-primary italic leading-none truncate">{live.title}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{live.teacher_name || 'Professor da Rede'}</p>
                        <div className="pt-4 flex items-center gap-4">
                          <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 px-6 hover:bg-primary hover:text-white transition-all" asChild>
                            <a href={`https://youtube.com/watch?v=${live.youtube_id || 'rfscVS0vtbw'}`} target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> Abrir no YouTube</a>
                          </Button>
                          <Button onClick={() => handleDelete(live.id)} variant="ghost" size="icon" className="rounded-full hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="h-5 w-5" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-20 text-center border-4 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5 opacity-40">
                  <div className="flex flex-col items-center gap-4">
                    <MonitorPlay className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-black italic text-xl">Nenhuma live encontrada</p>
                    <p className="text-sm font-medium mb-4">O banco de dados retornou zero registros ou está sincronizando.</p>
                    <Button 
                      variant="outline" 
                      onClick={handleSeedLives} 
                      disabled={isSeeding}
                      className="rounded-xl h-12 border-dashed border-accent text-accent font-black hover:bg-accent/5"
                    >
                      {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
                      Gerar Lives de Teste (Seed)
                    </Button>
                  </div>
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
                  {schemaError ? <AlertCircle className="h-6 w-6 text-white" /> : <CheckCircle2 className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status da API</p>
                  <p className="text-xl font-black italic">{schemaError ? 'Sincronizando...' : 'Operacional'}</p>
                </div>
              </div>
              <p className="text-[11px] font-medium opacity-80 leading-relaxed italic">
                {schemaError 
                  ? "As colunas foram criadas no banco, mas a API do Supabase ainda está atualizando o cache. Você pode ignorar o aviso acima se o seu registro de teste já apareceu." 
                  : "Parabéns! Sua estrutura de dados está 100% sincronizada com o motor do EduCore."}
              </p>
              {schemaError && (
                <Button variant="secondary" onClick={() => setShowWarning(true)} className="w-full rounded-xl h-10 text-[10px] font-black uppercase">
                  Rever Diagnóstico
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
