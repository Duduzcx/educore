
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  ChevronLeft, 
  Trash2, 
  FileText, 
  Loader2, 
  Layout, 
  Youtube, 
  Sparkles,
  Globe,
  Settings2,
  CheckCircle2,
  Eye,
  Link as LinkIcon,
  BookOpen,
  Flame
} from "lucide-react";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, increment } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateQuiz } from "@/ai/flows/quiz-generator";

export default function TrailManagementPage() {
  const params = useParams();
  const trailId = params.id as string;
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isEditTrailOpen, setIsEditTrailOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  const [moduleForm, setModuleForm] = useState({ title: "" });
  const [contentForm, setContentForm] = useState({ title: "", type: "video", url: "", description: "" });
  const [publishForm, setPublishForm] = useState({ targetAudience: "both" });
  const [editTrailForm, setEditTrailForm] = useState({ title: "", description: "", category: "", isFundamental: false });

  const trailRef = useMemoFirebase(() => {
    if (!firestore || !trailId) return null;
    return doc(firestore, "learning_trails", trailId);
  }, [firestore, trailId]);

  const { data: trail, isLoading: isTrailLoading } = useDoc(trailRef);

  const modulesQuery = useMemoFirebase(() => {
    if (!firestore || !trailId) return null;
    return collection(firestore, "learning_trails", trailId, "modules");
  }, [firestore, trailId]);

  const { data: modules, isLoading: isModulesLoading } = useCollection(modulesQuery);

  const handleAddModule = () => {
    if (!moduleForm.title.trim() || !modulesQuery) return;
    
    addDocumentNonBlocking(modulesQuery, {
      title: moduleForm.title,
      order: modules?.length || 0,
      createdAt: new Date().toISOString(),
    });

    if (trailRef) {
      updateDocumentNonBlocking(trailRef, {
        modulesCount: (trail?.modulesCount || 0) + 1
      });
    }

    toast({ title: "Módulo adicionado" });
    setModuleForm({ title: "" });
    setIsModuleDialogOpen(false);
  };

  const handleAddContent = () => {
    if (!activeModuleId || !firestore || !trailRef) return;
    
    const contentsRef = collection(firestore, "learning_trails", trailId, "modules", activeModuleId, "contents");
    addDocumentNonBlocking(contentsRef, {
      title: contentForm.title,
      type: contentForm.type,
      url: contentForm.url,
      description: contentForm.description,
      order: 0,
      createdAt: new Date().toISOString(),
    });

    updateDocumentNonBlocking(trailRef, {
      totalContents: increment(1)
    });

    toast({ title: "Material anexado!" });
    setContentForm({ title: "", type: "video", url: "", description: "" });
    setIsContentDialogOpen(false);
    setActiveModuleId(null);
  };

  const handleUpdateTrail = () => {
    if (trailRef) {
      updateDocumentNonBlocking(trailRef, editTrailForm);
      toast({ title: "Trilha atualizada" });
      setIsEditTrailOpen(false);
    }
  };

  const handleGenerateAIQuiz = async (modId: string, modTitle: string) => {
    setIsGeneratingQuiz(true);
    try {
      const result = await generateQuiz({ topic: modTitle });
      if (result && result.questions && trailRef) {
        const contentsRef = collection(firestore!, "learning_trails", trailId, "modules", modId, "contents");
        addDocumentNonBlocking(contentsRef, {
          title: `Quiz IA: ${modTitle}`,
          type: "quiz",
          description: `Mini-avaliação gerada automaticamente sobre ${modTitle}.`,
          questions: result.questions,
          order: 99,
          createdAt: new Date().toISOString(),
        });

        updateDocumentNonBlocking(trailRef, {
          totalContents: increment(1)
        });

        toast({ title: "Quiz Gerado pela Aurora!" });
      }
    } catch (error) {
      toast({ title: "Erro na IA", variant: "destructive" });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handlePublishTrail = () => {
    if (trailRef) {
      updateDocumentNonBlocking(trailRef, {
        status: "active",
        targetAudience: publishForm.targetAudience
      });
      toast({ title: "Trilha Publicada!" });
      setIsPublishDialogOpen(false);
    }
  };

  if (isTrailLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-accent" /></div>;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-12 w-12"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-primary italic leading-none">{trail?.title}</h1>
              <Badge className={trail?.status === 'active' ? 'bg-green-600' : 'bg-orange-500'}>
                {trail?.status === 'active' ? 'PUBLICADA' : 'RASCUNHO'}
              </Badge>
              {trail?.isFundamental && (
                <Badge className="bg-accent text-accent-foreground border-none font-black text-[10px] px-3 flex items-center gap-1">
                  <Flame className="h-3 w-3 fill-accent-foreground" /> RECORRENTE
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{trail?.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => {
            setEditTrailForm({ 
              title: trail.title, 
              description: trail.description || "", 
              category: trail.category,
              isFundamental: !!trail.isFundamental
            });
            setIsEditTrailOpen(true);
          }} className="rounded-xl h-12"><Settings2 className="h-5 w-5 mr-2" /> Editar Meta-dados</Button>
          <Button onClick={() => setIsPublishDialogOpen(true)} className="bg-accent text-accent-foreground font-black rounded-xl shadow-xl h-12 px-8">
            <Globe className="h-5 w-5 mr-2" /> Publicar na Rede
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl rounded-[2rem] bg-muted/10 p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Descrição da Trilha</h3>
            <p className="text-sm text-primary leading-relaxed font-medium">{trail?.description || "Nenhuma descrição adicionada. Clique em 'Editar Meta-dados' para descrever os objetivos desta trilha."}</p>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary italic">Módulos da Jornada</h2>
            <Button onClick={() => setIsModuleDialogOpen(true)} variant="outline" className="rounded-xl border-dashed h-10 font-bold"><Plus className="h-4 w-4 mr-2" /> Novo Módulo</Button>
          </div>

          <div className="space-y-6">
            {isModulesLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
            ) : modules && modules.length > 0 ? (
              modules.sort((a, b) => a.order - b.order).map((mod, idx) => (
                <Card key={mod.id} className="border-none shadow-lg bg-white overflow-hidden rounded-[2.5rem]">
                  <CardHeader className="bg-muted/5 p-8 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic shadow-lg">{idx + 1}</div>
                      <CardTitle className="text-xl font-black text-primary italic">{mod.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" disabled={isGeneratingQuiz} onClick={() => handleGenerateAIQuiz(mod.id, mod.title)} className="text-accent font-black text-[10px] uppercase">
                        {isGeneratingQuiz ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Quiz IA
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm("Remover módulo?")) { const r = doc(firestore!, "learning_trails", trailId, "modules", mod.id); deleteDocumentNonBlocking(r); }}} className="text-muted-foreground hover:text-red-500 rounded-full"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ModuleContentsList trailId={trailId} moduleId={mod.id} trailRef={trailRef} />
                  </CardContent>
                  <CardFooter className="p-6 border-t bg-muted/5">
                    <Button variant="ghost" className="w-full h-12 text-xs font-black uppercase text-accent tracking-widest" onClick={() => { setActiveModuleId(mod.id); setIsContentDialogOpen(true); }}>
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Material Digital
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="py-32 border-4 border-dashed rounded-[3rem] flex flex-col items-center opacity-30">
                <Layout className="h-16 w-16 mb-4" />
                <p className="font-black italic text-xl">Adicione módulos para começar</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-[2.5rem] p-10 overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4"><Settings2 className="h-8 w-8 text-accent" /><CardTitle className="text-2xl font-black italic">Status da Rede</CardTitle></div>
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/10 border border-white/5">
                  <span className="text-[10px] font-black uppercase block opacity-60 tracking-widest mb-2">Itens Totais</span>
                  <span className="text-xl font-black italic">{trail?.totalContents || 0} Atividades</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-accent text-accent-foreground rounded-2xl">
                  <Eye className="h-5 w-5" /><p className="text-xs font-black uppercase">{trail?.status === 'active' ? 'AO VIVO NA REDE' : 'VISÍVEL APENAS PARA VOCÊ'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isEditTrailOpen} onOpenChange={setIsEditTrailOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-lg bg-white">
          <DialogHeader><DialogTitle className="text-2xl font-black text-primary italic">Editar Metadados</DialogTitle></DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Título da Trilha</Label>
              <Input value={editTrailForm.title} onChange={(e) => setEditTrailForm({...editTrailForm, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
            </div>

            <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-accent/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-black text-primary italic flex items-center gap-2">
                  <Flame className="h-4 w-4 text-accent" />
                  Alta Recorrência?
                </Label>
                <p className="text-[10px] text-muted-foreground font-medium">Temas fundamentais para aprovação.</p>
              </div>
              <Switch 
                checked={editTrailForm.isFundamental} 
                onCheckedChange={(v) => setEditTrailForm({ ...editTrailForm, isFundamental: v })} 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Categoria</Label>
              <Input value={editTrailForm.category} onChange={(e) => setEditTrailForm({...editTrailForm, category: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Descrição Objetiva</Label>
              <Textarea value={editTrailForm.description} onChange={(e) => setEditTrailForm({...editTrailForm, description: e.target.value})} className="min-h-[150px] rounded-xl bg-muted/30 border-none font-medium p-4" />
            </div>
          </div>
          <Button onClick={handleUpdateTrail} className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl shadow-xl">Salvar Alterações</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black text-primary italic">Novo Módulo</DialogTitle></DialogHeader>
          <div className="py-6">
            <Input placeholder="Título do Bloco" value={moduleForm.title} onChange={(e) => setModuleForm({title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold italic text-lg" />
          </div>
          <Button onClick={handleAddModule} className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl">Adicionar Módulo</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-md">
          <DialogHeader><DialogTitle className="text-2xl font-black text-primary italic">Anexar Material</DialogTitle></DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Tipo de Recurso</Label>
              <Select value={contentForm.type} onValueChange={(v) => setContentForm({...contentForm, type: v})}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="video">🎥 Videoaula (YouTube)</SelectItem>
                  <SelectItem value="pdf">📄 Documento PDF</SelectItem>
                  <SelectItem value="link">🔗 Link Externo/Artigo</SelectItem>
                  <SelectItem value="text">📝 Explicação em Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Título do Material</Label>
              <Input placeholder="Ex: Guia de Estudo" value={contentForm.title} onChange={(e) => setContentForm({...contentForm, title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none" />
            </div>
            {contentForm.type !== 'text' ? (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">URL do Recurso</Label>
                <Input placeholder="Cole o link aqui..." value={contentForm.url} onChange={(e) => setContentForm({...contentForm, url: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Conteúdo do Artigo</Label>
                <Textarea placeholder="Escreva aqui..." value={contentForm.description} onChange={(e) => setContentForm({...contentForm, description: e.target.value})} className="min-h-[150px] rounded-xl bg-muted/30 border-none" />
              </div>
            )}
          </div>
          <Button onClick={handleAddContent} className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl shadow-xl">Confirmar Material</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10">
          <DialogHeader><DialogTitle className="text-3xl font-black text-primary italic">Ativar na Rede</DialogTitle></DialogHeader>
          <div className="py-8 space-y-4">
            <Label className="text-[10px] font-black uppercase opacity-40">Público da Trilha</Label>
            <Select value={publishForm.targetAudience} onValueChange={(v) => setPublishForm({targetAudience: v})}>
              <SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-none text-lg font-black italic px-6"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="etec" className="font-bold py-3">🏢 Alunos ETEC</SelectItem>
                <SelectItem value="uni" className="font-bold py-3">🎓 Vestibulandos</SelectItem>
                <SelectItem value="both" className="font-bold py-3">🌟 Toda a Comunidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePublishTrail} className="w-full h-16 bg-accent text-accent-foreground font-black text-xl rounded-2xl shadow-xl border-none">
            <CheckCircle2 className="h-6 w-6 mr-2" /> Ativar Trilha Agora
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModuleContentsList({ trailId, moduleId, trailRef }: { trailId: string, moduleId: string, trailRef: any }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const contentsQuery = useMemoFirebase(() => {
    if (!firestore || !trailId || !moduleId) return null;
    return collection(firestore, "learning_trails", trailId, "modules", moduleId, "contents");
  }, [firestore, trailId, moduleId]);
  const { data: contents, isLoading } = useCollection(contentsQuery);

  const handleDelete = (contentId: string) => {
    if (!confirm("Remover material?")) return;
    const r = doc(firestore!, "learning_trails", trailId, "modules", moduleId, "contents", contentId);
    deleteDocumentNonBlocking(r);
    
    if (trailRef) {
      updateDocumentNonBlocking(trailRef, {
        totalContents: increment(-1)
      });
    }
    toast({ title: "Material removido" });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/20" /></div>;

  return (
    <div className="flex flex-col">
      {contents && contents.length > 0 ? (
        contents.map((content) => (
          <div key={content.id} className="group flex items-center justify-between p-8 hover:bg-muted/5 border-b last:border-0 border-muted/10 transition-colors">
            <div className="flex items-center gap-6">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                content.type === 'video' ? 'bg-red-50 text-red-600' : 
                content.type === 'quiz' ? 'bg-accent/10 text-accent' : 
                content.type === 'link' ? 'bg-purple-50 text-purple-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {content.type === 'video' ? <Youtube className="h-6 w-6" /> : 
                 content.type === 'quiz' ? <Sparkles className="h-6 w-6" /> : 
                 content.type === 'link' ? <LinkIcon className="h-6 w-6" /> :
                 <FileText className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-lg font-black text-primary leading-tight italic">{content.title}</p>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{content.type === 'link' ? 'Link/Artigo' : content.type}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(content.id)} className="opacity-0 group-hover:opacity-100 rounded-full hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))
      ) : (
        <div className="p-12 text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-widest">Sem materiais</p></div>
      )}
    </div>
  );
}
