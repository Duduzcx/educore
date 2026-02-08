
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  ChevronLeft, 
  Trash2, 
  FileText, 
  Loader2, 
  Layout, 
  Youtube, 
  Sparkles,
  ExternalLink,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TrailManagementPage() {
  const params = useParams();
  const trailId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [trail, setTrail] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [contents, setContents] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  const [moduleForm, setModuleForm] = useState({ title: "" });
  const [contentForm, setContentForm] = useState({ title: "", type: "video", url: "", description: "" });

  const loadData = useCallback(async () => {
    if (!user || !trailId) return;
    
    // Se for um ID de exemplo (não UUID), não tenta buscar no banco real
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trailId);
    
    if (!isUuid) {
      setLoading(false);
      return;
    }

    try {
      const { data: trailData } = await supabase.from('learning_trails').select('*').eq('id', trailId).single();
      if (trailData) setTrail(trailData);

      const { data: modulesData } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('trail_id', trailId)
        .order('order_index', { ascending: true });
      
      setModules(modulesData || []);

      if (modulesData && modulesData.length > 0) {
        const moduleIds = modulesData.map(m => m.id);
        const { data: contentsData } = await supabase
          .from('learning_contents')
          .select('*')
          .in('module_id', moduleIds)
          .order('created_at', { ascending: true });
        
        const groupedContents: Record<string, any[]> = {};
        contentsData?.forEach(content => {
          if (!groupedContents[content.module_id]) groupedContents[content.module_id] = [];
          groupedContents[content.module_id].push(content);
        });
        setContents(groupedContents);
      }
    } catch (err) {
      console.error("Erro ao carregar dados da trilha:", err);
    } finally {
      setLoading(false);
    }
  }, [user, trailId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddModule = async () => {
    if (!moduleForm.title.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('learning_modules').insert({
        trail_id: trailId,
        title: moduleForm.title,
        order_index: modules.length,
        created_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;

      toast({ title: "Módulo Adicionado!" });
      setModuleForm({ title: "" });
      setIsModuleDialogOpen(false);
      loadData(); // Recarrega para garantir consistência
    } catch (err: any) {
      toast({ 
        title: "Erro ao Adicionar", 
        description: "Verifique se a tabela 'learning_modules' existe no Supabase.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddContent = async () => {
    if (!activeModuleId || !contentForm.title || !user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('learning_contents').insert({
        module_id: activeModuleId,
        title: contentForm.title,
        type: contentForm.type,
        url: contentForm.url,
        description: contentForm.description,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({ title: "Material Anexado!" });
      setContentForm({ title: "", type: "video", url: "", description: "" });
      setIsContentDialogOpen(false);
      setActiveModuleId(null);
      loadData(); 
    } catch (err: any) {
      toast({ 
        title: "Erro ao Anexar", 
        description: "Verifique se a tabela 'learning_contents' existe no Supabase.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    const { error } = await supabase.from('learning_modules').delete().eq('id', id);
    if (!error) {
      toast({ title: "Módulo removido" });
      loadData();
    }
  };

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sincronizando Estrutura...</p>
    </div>
  );

  const isDemoTrail = !trail && !loading;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {isDemoTrail && (
        <Card className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] flex items-center gap-4">
          <AlertCircle className="h-8 w-8 text-amber-600" />
          <div>
            <p className="font-black text-amber-900 italic uppercase text-xs">Modo Visualização (Trilha de Exemplo)</p>
            <p className="text-amber-700 text-sm font-medium">Esta é uma trilha de demonstração. Crie uma nova trilha para poder gerenciar módulos e conteúdos no banco de dados.</p>
          </div>
        </Card>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-12 w-12 bg-white shadow-sm border border-muted/20"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary italic leading-none">{trail?.title || "Gerenciador de Trilha"}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-accent text-accent">{trail?.category || "Categoria"}</Badge>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">• {modules.length} Blocos Configurados</span>
            </div>
          </div>
        </div>
        {!isDemoTrail && (
          <Button onClick={() => setIsModuleDialogOpen(true)} className="bg-accent text-accent-foreground font-black rounded-xl shadow-xl h-12 px-8 hover:scale-105 active:scale-95 transition-all">
            <Plus className="h-5 w-5 mr-2" /> Novo Módulo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {modules.length === 0 ? (
            <div className="p-20 text-center border-4 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5 opacity-40">
              <BookOpen className="h-16 w-16 mx-auto mb-4" />
              <p className="font-black italic text-xl">Estrutura Vazia</p>
              <p className="text-sm font-medium mt-2">Adicione o primeiro módulo para começar a organizar sua aula.</p>
            </div>
          ) : (
            modules.map((mod, idx) => (
              <Card key={mod.id} className="border-none shadow-lg bg-white overflow-hidden rounded-[2.5rem] border-l-8 border-l-primary/10">
                <CardHeader className="bg-muted/5 p-8 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic shadow-lg">{idx + 1}</div>
                    <div>
                      <CardTitle className="text-xl font-black text-primary italic">{mod.title}</CardTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Capítulo Pedagógico</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(mod.id)} className="text-muted-foreground hover:text-red-500 rounded-full transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => { setActiveModuleId(mod.id); setIsContentDialogOpen(true); }} className="bg-primary/5 text-primary hover:bg-primary hover:text-white font-black text-[10px] uppercase rounded-xl h-10 px-4 transition-all">
                      <Plus className="h-4 w-4 mr-2" /> Aula
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {contents[mod.id]?.length > 0 ? (
                    contents[mod.id].map((content) => (
                      <div key={content.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-accent/20">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                            {content.type === 'video' ? <Youtube className="h-5 w-5 text-red-600" /> : <FileText className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-primary">{content.title}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{content.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary hover:text-white" onClick={() => window.open(content.url, '_blank')}><ExternalLink className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-[10px] font-black uppercase text-muted-foreground/40 italic">Sem materiais vinculados</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-8 overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-3xl bg-white/10 flex items-center justify-center shadow-lg"><Layout className="h-8 w-8 text-accent" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status da Trilha</p>
                  <p className="text-2xl font-black italic">{trail?.status === 'active' ? 'Publicada' : 'Rascunho'}</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Dica Docente</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed italic opacity-80">"Trilhas bem estruturadas aumentam a taxa de aprovação em até 40%."</p>
              </div>
              {!isDemoTrail && (
                <Button 
                  onClick={() => supabase.from('learning_trails').update({ status: 'active' }).eq('id', trailId).then(() => loadData())} 
                  disabled={trail?.status === 'active'} 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black h-14 rounded-2xl shadow-xl transition-all border-none"
                >
                  Publicar para a Rede
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 bg-white border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black italic text-primary">Novo Capítulo</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 mb-2 block">Título do Bloco</Label>
              <Input placeholder="Ex: Introdução à Algebra" value={moduleForm.title} onChange={(e) => setModuleForm({title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold italic text-lg" />
            </div>
          </div>
          <Button onClick={handleAddModule} disabled={isSubmitting || !moduleForm.title} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all">
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Criar Capítulo"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-md bg-white border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black italic text-primary">Anexar Aula</DialogTitle></DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Tipo de Recurso</Label>
              <Select value={contentForm.type} onValueChange={(v) => setContentForm({...contentForm, type: v})}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="video" className="font-bold">🎞️ Videoaula</SelectItem>
                  <SelectItem value="pdf" className="font-bold">📄 Documento PDF</SelectItem>
                  <SelectItem value="text" className="font-bold">📝 Resumo / Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Título da Aula</Label>
              <Input placeholder="Ex: Regra de Três Composta" value={contentForm.title} onChange={(e) => setContentForm({...contentForm, title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Link do Material</Label>
              <Input placeholder="Ex: https://youtube.com/..." value={contentForm.url} onChange={(e) => setContentForm({...contentForm, url: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-medium" />
            </div>
          </div>
          <Button onClick={handleAddContent} disabled={isSubmitting || !contentForm.title} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar Aula"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
