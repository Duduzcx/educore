
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Loader2, 
  Search, 
  FileText, 
  Video,
  UploadCloud,
  Eye,
  FlaskConical,
  Sparkles,
  RadioTower // Ícone para a Live
} from "lucide-react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, deleteDoc } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeacherLibraryManagement() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false); // Estado para o botão da live

  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "PDF",
    category: "Geral",
    url: "",
    description: ""
  });

  // Buscar Pendentes (Sugestões de Alunos)
  const pendingQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "library_resources"), where("status", "==", "pending"));
  }, [firestore]);

  const { data: suggestions, isLoading: loadingSuggestions } = useCollection(pendingQuery);

  // Buscar Aprovados (Acervo Atual)
  const approvedQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "library_resources"), where("status", "==", "approved"));
  }, [firestore]);

  const { data: approved, isLoading: loadingApproved } = useCollection(approvedQuery);
  
  // EFEITO TEMPORÁRIO PARA REMOVER A LIVE DE TESTE
  useEffect(() => {
    if (firestore && approved) {
      const liveStreamToDelete = approved.find(item => item.title === "Aula ao Vivo Agora: Revisão ENEM");
      if (liveStreamToDelete) {
        const docRef = doc(firestore, "library_resources", liveStreamToDelete.id);
        deleteDocumentNonBlocking(docRef);
        toast({
          title: "Live de Teste Removida!",
          description: "O item problemático que causava o erro na biblioteca foi expurgado do acervo.",
          variant: "destructive"
        });
      }
    }
  }, [firestore, approved, toast]);


  const handleApprove = (id: string) => {
    if (!firestore) return;
    const ref = doc(firestore, "library_resources", id);
    updateDocumentNonBlocking(ref, { status: "approved", approvedAt: new Date().toISOString() });
    toast({ title: "Material Aprovado!", description: "Já está disponível para todos os alunos." });
  };

  const handleReject = (id: string) => {
    if (!firestore) return;
    if (confirm("Deseja rejeitar e excluir esta sugestão?")) {
      const ref = doc(firestore, "library_resources", id);
      deleteDocumentNonBlocking(ref);
      toast({ title: "Sugestão Rejeitada", variant: "destructive" });
    }
  };

  const handleAddOfficial = () => {
    if (!firestore || !user) return;
    
    addDocumentNonBlocking(collection(firestore, "library_resources"), {
      ...resourceForm,
      status: "approved",
      author: user.displayName || "Docente da Rede",
      userId: user.uid,
      userName: user.displayName || "Docente",
      createdAt: new Date().toISOString(),
      imageUrl: `https://picsum.photos/seed/${resourceForm.title}/400/250`
    });

    toast({ title: "Material Adicionado!", description: "Publicado oficialmente na biblioteca." });
    setIsAddOpen(false);
    setResourceForm({ title: "", type: "PDF", category: "Geral", url: "", description: "" });
  };

  const handleSeedExamples = () => {
    if (!firestore || !user) return;
    setIsSeeding(true);

    const examples = [
      { 
        title: "Guia Definitivo: Redação Nota 1000", 
        type: "PDF", 
        category: "Linguagens", 
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", 
        description: "Um manual completo com os critérios de correção do ENEM e exemplos de redações nota máxima comentadas por especialistas." 
      },
      { 
        title: "Dominando Python para Iniciantes", 
        type: "Video", 
        category: "Tecnologia", 
        url: "https://www.youtube.com/watch?v=rfscVS0vtbw", 
        description: "Curso intensivo de lógica de programação utilizando a linguagem Python, focado em alunos do curso técnico." 
      },
    ];

    setTimeout(() => {
      examples.forEach(ex => {
        addDocumentNonBlocking(collection(firestore!, "library_resources"), {
          ...ex,
          status: "approved",
          author: "Curadoria EduCore",
          userId: user.uid,
          userName: "Equipe Docente",
          createdAt: new Date().toISOString(),
          imageUrl: `https://picsum.photos/seed/${ex.title}/400/250`
        });
      });
      setIsSeeding(false);
      toast({ title: "Biblioteca Populada!", description: "Os exemplos funcionais foram injetados." });
    }, 1000);
  };
  
  // NOVA FUNÇÃO PARA INJETAR A LIVE
  const handleInjectLiveStream = () => {
    if (!firestore || !user) return;
    setIsInjecting(true);

    const liveStream = {
        title: "Aula ao Vivo Agora: Revisão ENEM", 
        type: "Video", // Mantemos "Video" para o player reconhecer
        category: "Live", // Categoria para fácil identificação
        url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", // URL de uma live 24/7 (Lofi Girl)
        description: "Clique para participar da nossa aula ao vivo. Tire suas dúvidas em tempo real com o professor!",
        status: "approved",
        author: "Curadoria EduCore",
        userId: user.uid,
        userName: "Equipe Docente",
        createdAt: new Date().toISOString(),
        imageUrl: `https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg` // Thumbnail da live
      };

    setTimeout(() => {
        addDocumentNonBlocking(collection(firestore!, "library_resources"), liveStream);
        setIsInjecting(false);
        toast({ title: "Live de Teste Adicionada!", description: "A live improvisada já aparece no acervo para todos." });
    }, 1000);
  };


  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Gestão da Biblioteca</h1>
          <p className="text-muted-foreground font-medium">Curadoria e controle do acervo digital (1.000 alunos).</p>
        </div>
        <div className="flex items-center gap-3">
          {/* BOTÃO DA LIVE */}
          <Button 
            variant="outline" 
            onClick={handleInjectLiveStream} 
            disabled={isInjecting}
            className="rounded-2xl h-14 border-dashed border-red-500/20 text-red-500 font-black px-6 hover:bg-red-500/5"
          >
            {isInjecting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RadioTower className="h-5 w-5 mr-2" />}
            Injetar Live de Teste
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl hover:bg-accent/90">
                <Plus className="h-6 w-6 mr-2" />
                Novo Material Oficial
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-primary italic">Upload Oficial</DialogTitle>
                <DialogDescription>Adicione materiais diretamente ao acervo sem passar pela fila.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Tipo</Label>
                    <Select value={resourceForm.type} onValueChange={(v) => setResourceForm({...resourceForm, type: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {["PDF", "Video", "E-book", "Artigo"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Categoria</Label>
                    <Input value={resourceForm.category} onChange={(e) => setResourceForm({...resourceForm, category: e.target.value})} placeholder="Ex: Matemática" className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Título</Label>
                  <Input value={resourceForm.title} onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})} className="h-14 rounded-xl bg-muted/30 border-none font-bold text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">URL do Recurso</Label>
                  <Input value={resourceForm.url} onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})} placeholder="Link do Drive, YouTube, etc." className="h-14 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Resumo Pedagógico</Label>
                  <Textarea value={resourceForm.description} onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30 border-none resize-none p-4" />
                </div>
              </div>
              <Button onClick={handleAddOfficial} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl">Publicar Agora</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Fila de Aprovação */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-primary italic flex items-center gap-3">
              <Clock className="h-6 w-6 text-accent" />
              Aguardando Sua Análise
            </h2>
            <Badge className="bg-accent text-accent-foreground font-black px-3">{suggestions?.length || 0}</Badge>
          </div>

          {loadingSuggestions ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-accent" /></div>
          ) : suggestions?.length === 0 ? (
            <Card className="border-4 border-dashed rounded-[3rem] p-20 text-center opacity-30 bg-white/50">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
              <p className="font-black italic text-xl">Tudo em dia! Sem pendências.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {suggestions?.map((item) => (
                <Card key={item.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center shrink-0">
                      {item.type === 'Video' ? <Video className="h-10 w-10" /> : <FileText className="h-10 w-10" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">{item.type} • {item.category}</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Sugerido por {item.userName}</span>
                      </div>
                      <h3 className="text-xl font-black text-primary italic leading-none">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2">{item.description}</p>
                      <div className="pt-4 flex items-center gap-4">
                        <Button onClick={() => handleApprove(item.id)} className="bg-green-600 hover:bg-green-700 text-white font-black rounded-xl px-6 h-11 shadow-lg shadow-green-600/20">
                          Aprovar Material
                        </Button>
                        <Button onClick={() => handleReject(item.id)} variant="ghost" className="text-red-500 hover:bg-red-50 font-bold rounded-xl h-11 px-6">
                          Rejeitar
                        </Button>
                        <Button variant="outline" size="icon" asChild className="rounded-xl h-11 w-11 border-dashed">
                          <a href={item.url} target="_blank"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas e Busca Rápida */}
        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-8 overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center"><BookOpen className="h-6 w-6 text-accent" /></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">Acervo Aprovado</p>
                  <p className="text-3xl font-black italic">{approved?.length || 0} Itens</p>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-accent flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Últimos Ativados
                </p>
                <div className="space-y-3">
                  {approved?.slice(-3).reverse().map((a) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      <span className="text-xs font-bold truncate opacity-80 italic">{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 px-2">Auditoria de Acervo</Label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input placeholder="Filtrar por título..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-14 bg-white border-none shadow-xl rounded-2xl font-medium italic" />
            </div>
            
            <div className="max-h-[400px] overflow-auto pr-2 space-y-3 scrollbar-hide">
              {approved?.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).reverse().map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm group hover:shadow-md transition-all border border-transparent hover:border-accent/10">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {item.type === 'Video' ? <Video className="h-4 w-4 text-primary/60" /> : <FileText className="h-4 w-4 text-primary/60" />}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-black text-primary italic leading-none truncate">{item.title}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">{item.type} • {item.category}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { if(confirm("Remover permanentemente?")) deleteDocumentNonBlocking(doc(firestore!, "library_resources", item.id)); }} className="opacity-0 group-hover:opacity-100 rounded-full text-muted-foreground hover:text-red-500 transition-all shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {approved?.length === 0 && (
                <div className="py-10 text-center opacity-20 italic text-xs font-bold uppercase">Nenhum item aprovado</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
