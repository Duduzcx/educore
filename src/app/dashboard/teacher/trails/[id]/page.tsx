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
  AlertCircle,
  FileVideo,
  FileType,
  Settings2,
  ListPlus
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
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trailId);
    
    if (!isUuid) {
      setLoading(false);
      return;
    }

    try {
      const [trailRes, modulesRes] = await Promise.all([
        supabase.from('learning_trails').select('id, title, category, status').eq('id', trailId).single(),
        supabase.from('learning_modules').select('id, title, order_index').eq('trail_id', trailId).order('order_index', { ascending: true })
      ]);

      if (trailRes.data) setTrail(trailRes.data);
      const modulesData = modulesRes.data || [];
      setModules(modulesData);

      if (modulesData.length > 0) {
        const moduleIds = modulesData.map(m => m.id);
        const { data: contentsData } = await supabase
          .from('learning_contents')
          .select('id, module_id, title, type, url, description')
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
      const { error } = await supabase.from('learning_modules').insert({
        trail_id: trailId,
        title: moduleForm.title,
        order_index: modules.length,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({ title: "Módulo Adicionado!" });
      setModuleForm({ title: "" });
      setIsModuleDialogOpen(false);
      loadData(); 
    } catch (err: any) {
      toast({ title: "Erro ao Adicionar", variant: "destructive" });
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
      toast({ title: "Erro ao Anexar", variant: "destructive" });
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

  const handleDeleteContent = async (id: string) => {
    const { error } = await supabase.from('learning_contents').delete().eq('id', id);
    if (!error) {
      toast({ title: "Conteúdo removido" });
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
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-12 w-12 bg-white shadow-sm border border-muted/20 hover:scale-110 transition-transform"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary italic leading-none">{trail?.title || "Gerenciador de Trilha"}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-accent text-accent">{trail?.category || "Categoria"}</Badge>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">• {modules.length} Capítulos Planejados</span>
            </div>
          </div>
        </div>
        {!isDemoTrail && (
          <Button onClick={() => setIsModuleDialogOpen(true)} className="bg-accent text-accent-foreground font-black rounded-xl shadow-xl h-12 px-8 hover:scale-105 active:scale-95 transition-all">
            <Plus className="h-5 w-5 mr-2" /> Novo Capítulo
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
              <Card key={mod.id} className="border-none shadow-lg bg-white overflow-hidden rounded-[2.5rem] border-l-8 border-l-primary/10 group/card">
                <CardHeader className="bg-muted/5 p-8 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic shadow-lg">{idx + 1}</div>
                    <div>
                      <CardTitle className="text-xl font-black text-primary italic">{mod.title}</CardTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Unidade Pedagógica</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(mod.id)} className="text-muted-foreground hover:text-red-500 rounded-full transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => { setActiveModuleId(mod.id); setIsContentDialogOpen(true); }} className="bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase rounded-xl h-10 px-4 transition-all shadow-md gap-2">
                      <ListPlus className="h-4 w-4" /> Add Conteúdo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {contents[mod.id]?.length > 0 ? (
                    <div className="space-y-3">
                      {contents[mod.id].map((content) => (
                        <div key={content.id} className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 hover:bg-white hover:shadow-xl transition-all group border-2 border-transparent hover:border-accent/20">
                          <div className="flex items-center gap-5 overflow-hidden">
                            <div className={`h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0`}>
                              {content.type === 'video' ? <Youtube className="h-6 w-6 text-red-600" /> : content.type === 'pdf' ? <FileText className="h-6 w-6 text-blue-600" /> : <FileType className="h-6 w-6 text-orange-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-sm text-primary truncate">{content.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[7px] font-black uppercase bg-white border-none px-2">{content.type}</Badge>
                                <p className="text-[10px] text-muted-foreground font-medium truncate italic line-clamp-1">{content.description || "Sem resumo informado."}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary hover:text-white shadow-sm" onClick={() => window.open(content.url, '_blank')}><ExternalLink className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-red-500 hover:text-white shadow-sm" onClick={() => handleDeleteContent(content.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-10 text-[10px] font-black uppercase text-muted-foreground/40 italic border-2 border-dashed border-muted/20 rounded-2xl">Nenhum material vinculado a esta unidade.</p>
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
                <div className="h-14 w-14 rounded-3xl bg-white/10 flex items-center justify-center shadow-lg"><Settings2 className="h-8 w-8 text-accent" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Configuração de Trilha</p>
                  <p className="text-2xl font-black italic">{trail?.status === 'active' ? 'Publicada' : 'Rascunho'}</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Dica Docente</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed italic opacity-80">"Adicione resumos detalhados às aulas para que a Aurora IA possa orientar melhor o estudo dos alunos."</p>
              </div>
              {!isDemoTrail && (
                <Button 
                  onClick={() => supabase.from('learning_trails').update({ status: 'active' }).eq('id', trailId).then(() => loadData())} 
                  disabled={trail?.status === 'active'} 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black h-14 rounded-2xl shadow-xl transition-all border-none"
                >
                  {trail?.status === 'active' ? 'Trilha Publicada' : 'Publicar para a Rede'}
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
              <Label className="text-[10px] font-black uppercase opacity-40 mb-2 block">Título da Unidade</Label>
              <Input placeholder="Ex: Introdução ao Cálculo" value={moduleForm.title} onChange={(e) => setModuleForm({title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold italic text-lg focus:ring-accent" />
            </div>
          </div>
          <Button onClick={handleAddModule} disabled={isSubmitting || !moduleForm.title} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all">
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Criar Unidade"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic text-primary flex items-center gap-3">
              <Plus className="h-6 w-6 text-accent" /> Configurar Aula
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6 overflow-y-auto max-h-[70vh] scrollbar-hide pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Tipo de Recurso</Label>
                <Select value={contentForm.type} onValueChange={(v) => setContentForm({...contentForm, type: v})}>
                  <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="video" className="font-bold">🎞️ Videoaula</SelectItem>
                    <SelectItem value="pdf" className="font-bold">📄 Documento PDF</SelectItem>
                    <SelectItem value="text" className="font-bold">📝 Resumo / Texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Título da Aula</Label>
                <Input placeholder="Ex: Derivadas Parte 1" value={contentForm.title} onChange={(e) => setContentForm({...contentForm, title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Link do Recurso (YouTube/Drive)</Label>
              <div className="relative">
                <Input placeholder="https://..." value={contentForm.url} onChange={(e) => setContentForm({...contentForm, url: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-medium pl-12" />
                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Resumo / Objetivo Pedagógico</Label>
              <Textarea 
                placeholder="Descreva o que o aluno aprenderá ou o que deve ser focado neste material..." 
                value={contentForm.description} 
                onChange={(e) => setContentForm({...contentForm, description: e.target.value})} 
                className="min-h-[150px] rounded-2xl bg-muted/30 border-none resize-none p-5 font-medium leading-relaxed" 
              />
            </div>
          </div>
          <Button onClick={handleAddContent} disabled={isSubmitting || !contentForm.title} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all">
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar Material Digital"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
