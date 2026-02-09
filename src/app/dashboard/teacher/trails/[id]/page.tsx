
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
  FileType,
  Settings2,
  ListPlus,
  Info,
  Link as LinkIcon,
  AlignLeft,
  Eye,
  CheckCircle2,
  Globe,
  BrainCircuit,
  X
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateQuiz, type QuizGeneratorOutput } from "@/ai/flows/quiz-generator";
import Link from "next/link";

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
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isAiQuizDialogOpen, setIsAiQuizDialogOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  const [moduleForm, setModuleForm] = useState({ title: "" });
  const [contentForm, setContentForm] = useState({ 
    title: "", 
    type: "video", 
    url: "", 
    description: "" 
  });

  const [aiQuizData, setAiQuizData] = useState<QuizGeneratorOutput | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const loadData = useCallback(async () => {
    if (!user || !trailId) return;
    
    setLoading(true);
    try {
      const [trailRes, modulesRes] = await Promise.all([
        supabase.from('learning_trails').select('*').eq('id', trailId).single(),
        supabase.from('learning_modules').select('*').eq('trail_id', trailId).order('order_index', { ascending: true })
      ]);

      if (trailRes.data) setTrail(trailRes.data);
      const modulesData = modulesRes.data || [];
      setModules(modulesData);

      if (modulesData.length > 0) {
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
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [user, trailId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePublish = async () => {
    if (!trailId || !user) return;
    setIsPublishing(true);
    
    const { error } = await supabase
      .from('learning_trails')
      .update({ status: 'active' })
      .eq('id', trailId);

    if (!error) {
      toast({ title: "Trilha Publicada!", description: "O conteúdo agora está visível para a rede." });
      loadData();
    } else {
      toast({ title: "Falha na Publicação", variant: "destructive" });
    }
    setIsPublishing(false);
  };

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
      toast({ title: "Capítulo Criado!" });
      setModuleForm({ title: "" });
      setIsModuleDialogOpen(false);
      loadData(); 
    } catch (err) {
      toast({ title: "Erro ao criar capítulo", variant: "destructive" });
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
      toast({ title: "Aula Anexada!" });
      setContentForm({ title: "", type: "video", url: "", description: "" });
      setIsContentDialogOpen(false);
      setActiveModuleId(null);
      loadData(); 
    } catch (err) {
      toast({ title: "Erro ao anexar aula", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAiQuiz = async (modId: string, modTitle: string) => {
    setActiveModuleId(modId);
    setIsAiQuizDialogOpen(true);
    setIsGeneratingQuiz(true);
    setAiQuizData(null);

    try {
      const contextText = contents[modId]?.map(c => c.title).join(", ") || "";
      const result = await generateQuiz({ 
        topic: modTitle, 
        description: `Esta unidade aborda os seguintes tópicos: ${contextText}` 
      });
      setAiQuizData(result);
    } catch (err) {
      toast({ title: "Erro Aurora IA", description: "Não foi possível gerar o quiz no momento.", variant: "destructive" });
      setIsAiQuizDialogOpen(false);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSaveAiQuiz = async () => {
    if (!activeModuleId || !aiQuizData || !user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('learning_contents').insert({
        module_id: activeModuleId,
        title: "Quiz IA: " + modules.find(m => m.id === activeModuleId)?.title,
        type: "quiz",
        description: JSON.stringify(aiQuizData.questions),
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      toast({ title: "Avaliação IA Publicada!" });
      setIsAiQuizDialogOpen(false);
      loadData();
    } catch (err) {
      toast({ title: "Erro ao salvar quiz", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    const { error } = await supabase.from('learning_modules').delete().eq('id', id);
    if (!error) {
      toast({ title: "Capítulo removido" });
      loadData();
    }
  };

  const handleDeleteContent = async (id: string) => {
    const { error } = await supabase.from('learning_contents').delete().eq('id', id);
    if (!error) {
      toast({ title: "Aula removida" });
      loadData();
    }
  };

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sincronizando Estrutura...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-12 w-12 bg-white shadow-sm border hover:scale-110 transition-transform"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary italic leading-none">{trail?.title || "Gestão da Trilha"}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={trail?.status === 'active' ? 'default' : 'outline'} className={`text-[10px] font-black uppercase tracking-widest ${trail?.status === 'active' ? 'bg-green-600 border-none' : 'border-orange-500 text-orange-500'}`}>
                {trail?.status === 'active' ? 'PÚBLICA NA REDE' : 'RASCUNHO PRIVADO'}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">• {modules.length} Capítulos</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="rounded-xl h-12 border-accent text-accent font-black hover:bg-accent/5 px-6 shadow-sm group" asChild>
            <Link href={`/dashboard/classroom/${trailId}`}>
              <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" /> Ver como Aluno
            </Link>
          </Button>
          <Button onClick={() => setIsModuleDialogOpen(true)} className="bg-accent text-accent-foreground font-black rounded-xl shadow-xl h-12 px-8 hover:scale-105 transition-all">
            <Plus className="h-5 w-5 mr-2" /> Novo Capítulo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {modules.length === 0 ? (
            <div className="p-20 text-center border-4 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5 opacity-40">
              <BookOpen className="h-16 w-16 mx-auto mb-4" />
              <p className="font-black italic text-xl">Nenhuma unidade criada</p>
              <p className="text-sm font-medium mt-2">Clique em "Novo Capítulo" para iniciar o roteiro pedagógico.</p>
            </div>
          ) : (
            modules.map((mod, idx) => (
              <Card key={mod.id} className="border-none shadow-lg bg-white overflow-hidden rounded-[2.5rem] border-l-8 border-l-primary/10">
                <CardHeader className="bg-muted/5 p-8 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic shadow-lg">{idx + 1}</div>
                    <div>
                      <CardTitle className="text-xl font-black text-primary italic">{mod.title}</CardTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Unidade Curricular</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(mod.id)} className="text-muted-foreground hover:text-red-500 rounded-full">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleGenerateAiQuiz(mod.id, mod.title)} className="bg-accent text-accent-foreground hover:bg-accent/90 font-black text-[9px] uppercase rounded-xl h-10 px-4 shadow-md gap-2">
                      <Sparkles className="h-3 w-3" /> Gerar Quiz IA
                    </Button>
                    <Button onClick={() => { setActiveModuleId(mod.id); setIsContentDialogOpen(true); }} className="bg-primary text-white hover:bg-primary/90 font-black text-[9px] uppercase rounded-xl h-10 px-4 shadow-md gap-2">
                      <Plus className="h-3 w-3" /> Add Aula
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {contents[mod.id]?.length > 0 ? (
                    <div className="space-y-3">
                      {contents[mod.id].map((content) => (
                        <div key={content.id} className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 hover:bg-white hover:shadow-xl transition-all group border-2 border-transparent hover:border-accent/20">
                          <div className="flex items-center gap-5 overflow-hidden">
                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
                              {content.type === 'video' ? <Youtube className="h-6 w-6 text-red-600" /> : content.type === 'quiz' ? <BrainCircuit className="h-6 w-6 text-accent" /> : <FileText className="h-6 w-6 text-blue-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-sm text-primary truncate">{content.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[7px] font-black uppercase bg-white border-none px-2">{content.type}</Badge>
                                <p className="text-[10px] text-muted-foreground font-medium truncate italic line-clamp-1">{content.type === 'quiz' ? 'Avaliação gerada por Aurora IA' : content.description || "Sem resumo informado."}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {content.type !== 'quiz' && (
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary hover:text-white" onClick={() => window.open(content.url, '_blank')}><ExternalLink className="h-5 w-5" /></Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-red-500 hover:text-white" onClick={() => handleDeleteContent(content.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-10 text-[10px] font-black uppercase text-muted-foreground/40 italic border-2 border-dashed border-muted/20 rounded-2xl">Nenhuma aula vinculada.</p>
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
                <div className="h-14 w-14 rounded-3xl bg-white/10 flex items-center justify-center shadow-lg">
                  {trail?.status === 'active' ? <Globe className="h-8 w-8 text-green-400 animate-pulse" /> : <Settings2 className="h-8 w-8 text-accent" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status da Trilha</p>
                  <p className="text-2xl font-black italic uppercase">{trail?.status === 'active' ? 'Ativa na Rede' : 'Em Construção'}</p>
                </div>
              </div>
              <Button 
                onClick={handlePublish} 
                disabled={isPublishing || trail?.status === 'active'} 
                className={`w-full font-black h-14 rounded-2xl shadow-xl transition-all border-none ${trail?.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
              >
                {isPublishing ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : trail?.status === 'active' ? <CheckCircle2 className="h-5 w-5 mr-2" /> : <Globe className="h-5 w-5 mr-2" />}
                {trail?.status === 'active' ? 'Publicada para Alunos' : 'Publicar Agora'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* DIÁLOGO MÓDULO */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 bg-white border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black italic text-primary">Novo Capítulo</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40 mb-2 block">Título da Unidade</Label>
              <Input placeholder="Ex: Fundamentos da Matéria" value={moduleForm.title} onChange={(e) => setModuleForm({title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold italic text-lg" />
            </div>
          </div>
          <Button onClick={handleAddModule} disabled={isSubmitting || !moduleForm.title} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all">
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Criar Capítulo"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO CONTEÚDO */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black italic text-primary">Anexar Material</DialogTitle></DialogHeader>
          <div className="space-y-6 py-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Formato</Label>
              <Select value={contentForm.type} onValueChange={(v) => setContentForm({...contentForm, type: v})}>
                <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="video">🎞️ Videoaula (YouTube)</SelectItem>
                  <SelectItem value="pdf">📄 PDF / Apostila</SelectItem>
                  <SelectItem value="text">📝 Resumo Escrito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Título da Aula</Label>
              <Input value={contentForm.title} onChange={(e) => setContentForm({...contentForm, title: e.target.value})} className="h-14 rounded-xl bg-muted/30 border-none font-bold" />
            </div>
            {contentForm.type !== 'text' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Link Externo</Label>
                <Input value={contentForm.url} onChange={(e) => setContentForm({...contentForm, url: e.target.value})} className="h-14 rounded-xl bg-muted/30 border-none font-medium" />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Resumo / Detalhes</Label>
              <Textarea value={contentForm.description} onChange={(e) => setContentForm({...contentForm, description: e.target.value})} className="min-h-[150px] rounded-xl bg-muted/30 border-none resize-none p-4" />
            </div>
          </div>
          <Button onClick={handleAddContent} disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl">
            {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar Material"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO CURADORIA QUIZ IA */}
      <Dialog open={isAiQuizDialogOpen} onOpenChange={setIsAiQuizDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-2xl bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic text-primary flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-accent" /> Curadoria Aurora IA
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
            {isGeneratingQuiz ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-accent" />
                <p className="font-black text-primary italic animate-pulse">Aurora formulando questões...</p>
              </div>
            ) : aiQuizData ? (
              <div className="space-y-8">
                {aiQuizData.questions.map((q, qIdx) => (
                  <Card key={qIdx} className="border-2 border-muted bg-slate-50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-primary text-white p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase">Questão {qIdx + 1}</span>
                        <Badge className="bg-accent text-accent-foreground border-none text-[8px]">{q.sourceStyle}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <p className="font-bold text-sm text-slate-800 leading-relaxed">{q.question}</p>
                      <div className="grid gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-3 ${oIdx === q.correctIndex ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-slate-200 text-slate-600'}`}>
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center font-black ${oIdx === q.correctIndex ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            {opt}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-medium text-amber-800 leading-relaxed">
                          <strong>Explicação Aurora:</strong> {q.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setIsAiQuizDialogOpen(false)} className="flex-1 h-14 rounded-2xl font-black uppercase text-xs">Descartar</Button>
            <Button onClick={handleSaveAiQuiz} disabled={isSubmitting || isGeneratingQuiz || !aiQuizData} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-xl">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Aprovar e Publicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
