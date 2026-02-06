
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Search, 
  FileText, 
  Video, 
  Download, 
  ExternalLink, 
  Filter, 
  CheckCircle2, 
  X, 
  Loader2,
  Info,
  Eye,
  Sparkles,
  Bot,
  Send,
  ChevronLeft,
  Layout
} from "lucide-react";
import Image from "next/image";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conceptExplanationAssistant } from "@/ai/flows/concept-explanation-assistant";

const categories = ["Todos", "Matemática", "Física", "Tecnologia", "Linguagens", "História", "Saúde"];
const types = ["Todos", "PDF", "Video", "E-book", "Artigo"];

export default function LibraryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeType, setActiveType] = useState("Todos");
  
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [suggestionForm, setSuggestionForm] = useState({
    title: "",
    type: "PDF",
    url: "",
    description: "",
    category: "Geral"
  });

  const resourcesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "library_resources"),
      where("status", "==", "approved")
    );
  }, [firestore]);

  const { data: dbResources, isLoading: isLoadingResources } = useCollection(resourcesQuery);

  const filteredResources = (dbResources || []).filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resource.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || resource.category === activeCategory;
    const matchesType = activeType === "Todos" || resource.type === activeType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleDownload = async (resource: any) => {
    setIsDownloading(resource.id);
    
    try {
      if (resource.type === 'Video') {
        toast({
          title: "Acesso Online",
          description: "Vídeos do YouTube devem ser assistidos online. Clique no ícone de link externo para abrir o vídeo na plataforma.",
          variant: "destructive"
        });
        setIsDownloading(null);
        return;
      }

      try {
        const response = await fetch(resource.url);
        if (!response.ok) throw new Error('Cross-origin restriction');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${resource.type.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Download Iniciado!",
          description: `O arquivo "${resource.title}" foi processado com sucesso.`,
        });
      } catch (e) {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
        toast({
          title: "Abrindo Recurso",
          description: "O servidor de origem impede download direto. Abrindo o arquivo em uma nova janela para você salvar.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no Download",
        description: "Não foi possível baixar este arquivo no momento.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const openViewer = (resource: any) => {
    setSelectedResource(resource);
    setIsViewerOpen(true);
    setChatMessages([]); 
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    try {
      addDocumentNonBlocking(collection(firestore, "library_resources"), {
        ...suggestionForm,
        status: "pending",
        userId: user.uid,
        userName: user.displayName || "Estudante",
        createdAt: new Date().toISOString(),
        imageUrl: `https://picsum.photos/seed/${suggestionForm.title.length}/400/250`
      });

      toast({
        title: "Sugestão Enviada!",
        description: "Seu material será analisado pelos mentores da rede.",
      });

      setSuggestionForm({
        title: "",
        type: "PDF",
        url: "",
        description: "",
        category: "Geral"
      });
      setIsSubmitDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading || !selectedResource) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userText }]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const context = `Material da Biblioteca: ${selectedResource.title}\nTipo: ${selectedResource.type}\nResumo Pedagógico: ${selectedResource.description || 'Nenhuma descrição.'}`;
      const history = chatMessages.slice(-4).map(m => ({
        role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        content: m.content
      }));

      const result = await conceptExplanationAssistant({
        query: userText,
        history,
        context
      });

      if (result && result.response) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
      }
    } catch (err) {
      toast({ title: "Aurora está ocupada", description: "Tente novamente em breve.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [chatMessages, isAiLoading]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-left-4 duration-500">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-primary italic leading-none">Biblioteca Digital</h1>
          <p className="text-muted-foreground text-lg font-medium">Acervo oficial curado pelos mentores da rede.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input 
            placeholder="Buscar material..." 
            className="pl-12 h-14 bg-white border-none shadow-xl rounded-[1.25rem] text-lg font-medium italic focus-visible:ring-accent transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="Todos" className="w-full">
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2 scrollbar-hide gap-4 animate-in fade-in duration-1000">
          <TabsList className="bg-white/50 backdrop-blur-md p-1.5 h-14 rounded-2xl border-none shadow-sm shrink-0">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat} 
                onClick={() => setActiveCategory(cat)}
                className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 duration-300"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0 h-14 w-14 rounded-2xl bg-white border-none shadow-xl hover:bg-accent hover:text-white transition-all group active:scale-90 duration-300">
                <Filter className={`h-6 w-6 ${activeType !== 'Todos' ? 'text-accent group-hover:text-white' : ''}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl animate-in zoom-in-95 duration-200">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-3 py-3">Filtrar por Tipo</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-muted/50 mx-2" />
              {types.map(type => (
                <DropdownMenuItem 
                  key={type} 
                  onClick={() => setActiveType(type)}
                  className={`rounded-xl px-3 py-2.5 font-bold text-sm cursor-pointer mb-1 last:mb-0 transition-colors ${activeType === type ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    {type}
                    {activeType === type && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoadingResources ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="font-black text-muted-foreground uppercase text-xs tracking-widest animate-pulse">Consultando Acervo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.length > 0 ? (
              filteredResources.map((item, index) => (
                <Card key={item.id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group bg-white rounded-[2.5rem] flex flex-col relative group/card animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative aspect-[16/10] overflow-hidden cursor-pointer" onClick={() => openViewer(item)}>
                    <Image 
                      src={item.imageUrl || `https://picsum.photos/seed/${item.id}/400/250`} 
                      alt={item.title} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/80 backdrop-blur-md text-primary border-none shadow-lg flex items-center gap-2 px-4 py-1.5 rounded-xl">
                        {item.type === "Video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        <span className="text-[10px] font-black uppercase tracking-wider">{item.type}</span>
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3 p-8 backdrop-blur-sm">
                      <Button onClick={(e) => { e.stopPropagation(); openViewer(item); }} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black h-12 rounded-xl shadow-2xl scale-90 group-hover/card:scale-100 transition-all duration-500 active:scale-95">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar Agora
                      </Button>
                    </div>
                  </div>
                  
                  <CardHeader className="p-8 space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[9px] border-accent/20 text-accent font-black uppercase px-2 py-0.5 bg-accent/5 group-hover/card:bg-accent group-hover/card:text-white transition-all">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-60 italic">Curadoria Oficial</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-black text-primary italic leading-tight group-hover/card:text-accent transition-colors duration-300 line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-3 italic opacity-80">
                        {item.description || "Material de apoio técnico pedagógico."}
                      </p>
                    </div>
                  </CardHeader>
                  
                  <CardFooter className="p-8 pt-0 mt-auto">
                    <div className="flex gap-3 w-full pt-6 border-t border-muted/10">
                      <Button 
                        onClick={() => handleDownload(item)}
                        disabled={isDownloading === item.id}
                        className="flex-1 bg-primary text-white h-12 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all duration-300 hover:shadow-primary/20"
                      >
                        {isDownloading === item.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                        Download
                      </Button>
                      <Button asChild variant="outline" className="h-12 w-12 rounded-xl border-2 border-muted/20 active:scale-90 transition-all duration-300">
                        <a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-5 w-5 text-primary/60" /></a>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-32 text-center border-4 border-dashed border-muted/20 rounded-[3rem] bg-muted/5 animate-in fade-in duration-1000">
                <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="font-black text-primary italic text-xl">Nenhum material encontrado</p>
              </div>
            )}
          </div>
        )}
      </Tabs>

      <section className="bg-primary rounded-[3rem] p-10 md:p-16 text-primary-foreground relative overflow-hidden shadow-2xl group/banner animate-in slide-in-from-bottom-8 duration-1000">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none group-hover/banner:scale-150 transition-transform duration-1000" />
        <div className="relative z-10 grid md:grid-cols-2 items-center gap-12">
          <div className="space-y-8">
            <Badge className="bg-accent text-accent-foreground border-none px-6 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Colaboração Social</Badge>
            <h2 className="text-4xl font-black italic tracking-tighter leading-tight">Ajude a enriquecer nossa biblioteca</h2>
            <div className="flex flex-wrap gap-4 pt-4">
              <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-primary hover:bg-white/90 font-black h-14 px-10 rounded-2xl shadow-2xl active:scale-95 transition-all">Sugerir Material</Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-lg bg-white animate-in zoom-in-95 duration-300">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-primary italic">Sugerir Conteúdo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSuggest} className="space-y-6 py-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-40">Tipo</Label>
                        <Select value={suggestionForm.type} onValueChange={(v) => setSuggestionForm({...suggestionForm, type: v})}>
                          <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold transition-all focus:ring-2 focus:ring-accent/50"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {types.filter(t => t !== 'Todos').map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-40">Categoria</Label>
                        <Select value={suggestionForm.category} onValueChange={(v) => setSuggestionForm({...suggestionForm, category: v})}>
                          <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold transition-all focus:ring-2 focus:ring-accent/50"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {categories.filter(c => c !== 'Todos').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-40">Título do Material</Label>
                      <Input value={suggestionForm.title} onChange={(e) => setSuggestionForm({...suggestionForm, title: e.target.value})} placeholder="Ex: Guia de Redação" className="h-14 rounded-xl bg-muted/30 border-none font-bold" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-40">Link (YouTube ou PDF)</Label>
                      <Input value={suggestionForm.url} onChange={(e) => setSuggestionForm({...suggestionForm, url: e.target.value})} placeholder="https://..." className="h-14 rounded-xl bg-muted/30 border-none font-bold" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase opacity-40">Breve Descrição</Label>
                      <Textarea value={suggestionForm.description} onChange={(e) => setSuggestionForm({...suggestionForm, description: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30 border-none resize-none p-4" required />
                    </div>
                    <Button type="submit" className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all">Enviar para Avaliação</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isViewerOpen} onOpenChange={(o) => { setIsViewerOpen(o); if(!o) setSelectedResource(null); }}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-background flex flex-col pt-safe animate-in zoom-in-95 duration-500">
          {selectedResource && (
            <>
              <div className="bg-white/80 backdrop-blur-md p-6 flex items-center justify-between border-b shrink-0 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => setIsViewerOpen(false)} className="rounded-full h-10 w-10 active:scale-90 transition-all"><ChevronLeft className="h-6 w-6" /></Button>
                  <div className="animate-in fade-in duration-1000">
                    <h3 className="text-xl font-black italic text-primary leading-tight">{selectedResource.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-accent text-accent-foreground text-[8px] uppercase font-black px-2">{selectedResource.type}</Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{selectedResource.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => handleDownload(selectedResource)} variant="outline" disabled={isDownloading === selectedResource.id} className="rounded-xl font-black text-[10px] uppercase gap-2 h-10 px-4 transition-all active:scale-95">
                    {isDownloading === selectedResource.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsViewerOpen(false)} className="rounded-full hover:bg-red-50 hover:text-red-500 h-10 w-10 active:rotate-90 transition-all duration-300"><X className="h-5 w-5" /></Button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="flex-1 flex flex-col bg-black overflow-hidden relative animate-in fade-in duration-700">
                  {selectedResource.type === 'Video' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <iframe 
                        src={`https://www.youtube.com/embed/${getYouTubeId(selectedResource.url)}?autoplay=1&modestbranding=1&rel=0`}
                        className="w-full h-full border-none shadow-2xl"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    </div>
                  ) : selectedResource.type === 'PDF' ? (
                    <iframe 
                      src={`${selectedResource.url}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full border-none bg-white"
                      title={selectedResource.title}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 space-y-6 text-white bg-primary animate-in fade-in duration-500">
                      <div className="h-24 w-24 rounded-[2rem] bg-white/5 flex items-center justify-center animate-pulse"><FileText className="h-12 w-12 text-white/20" /></div>
                      <div className="max-w-md space-y-2">
                        <h4 className="text-2xl font-black italic">Leitura Externa</h4>
                        <p className="text-white/40 text-sm">Este material ({selectedResource.type}) requer acesso externo para visualização completa.</p>
                      </div>
                      <Button asChild className="bg-white text-black hover:bg-white/90 font-black h-14 px-10 rounded-2xl active:scale-95 transition-all"><a href={selectedResource.url} target="_blank">Acessar Link Original</a></Button>
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-[400px] bg-white border-l flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-700">
                  <Tabs defaultValue="summary" className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-2 w-full h-14 bg-muted/20 p-1 rounded-none border-b">
                      <TabsTrigger value="summary" className="font-black text-[10px] uppercase gap-2 transition-all duration-300"><Layout className="h-4 w-4" /> Resumo</TabsTrigger>
                      <TabsTrigger value="ai" className="font-black text-[10px] uppercase gap-2 transition-all duration-300"><Sparkles className="h-4 w-4 text-accent" /> Aurora IA</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="flex-1 p-8 overflow-auto mt-0 animate-in fade-in duration-500">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Resumo Pedagógico</span>
                          <p className="text-sm font-medium leading-relaxed text-primary italic">
                            {selectedResource.description || "Sem descrição disponível."}
                          </p>
                        </div>
                        <div className="p-6 bg-muted/10 rounded-2xl border border-muted/20 transition-all hover:shadow-md duration-300">
                          <p className="text-[10px] font-black uppercase text-primary/40 mb-3">Ficha Técnica</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold"><span>Autor:</span> <span className="text-primary">{selectedResource.author}</span></div>
                            <div className="flex justify-between text-[10px] font-bold"><span>Postado em:</span> <span className="text-primary">{new Date(selectedResource.createdAt).toLocaleDateString()}</span></div>
                            <div className="flex justify-between text-[10px] font-bold"><span>Categoria:</span> <span className="text-primary">{selectedResource.category}</span></div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="ai" className="flex-1 flex flex-col overflow-hidden mt-0 animate-in fade-in duration-500">
                      <div className="p-4 bg-accent/5 border-b flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shadow-sm animate-bounce"><Bot className="h-4 w-4" /></div>
                        <div>
                          <p className="text-xs font-black italic">Aurora Contextual</p>
                          <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">IA Ativa no Material</p>
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                        <div className="flex flex-col gap-6">
                          {chatMessages.length === 0 ? (
                            <div className="text-center py-10 opacity-30 flex flex-col items-center animate-in fade-in duration-700">
                              <Info className="h-10 w-10 mb-2" />
                              <p className="text-[10px] font-black italic">Dúvidas sobre este conteúdo?</p>
                              <p className="text-[8px] font-medium mt-1">A Aurora já analisou este material da biblioteca.</p>
                            </div>
                          ) : (
                            chatMessages.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-medium shadow-sm transition-all hover:shadow-md ${
                                  msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-tr-none' 
                                    : 'bg-accent/10 text-primary border border-accent/20 rounded-tl-none'
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            ))
                          )}
                          {isAiLoading && (
                            <div className="flex justify-start animate-pulse">
                              <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-[10px] font-black uppercase">Analisando...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      <div className="p-4 border-t bg-muted/5 shrink-0">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Input 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Tire uma dúvida..."
                            className="rounded-xl bg-white border-none h-10 shadow-sm italic text-xs transition-all focus:ring-2 focus:ring-accent/50"
                          />
                          <Button type="submit" disabled={!chatInput.trim() || isAiLoading} size="icon" className="h-10 w-10 rounded-xl bg-primary active:scale-90 transition-all duration-300">
                            <Send className="h-4 w-4 text-white" />
                          </Button>
                        </form>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
