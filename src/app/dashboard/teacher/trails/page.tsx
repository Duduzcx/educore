
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PlayCircle, Plus, Edit, Trash2, LayoutDashboard, Search, Loader2, Globe, Clock, FileText, FlaskConical, Sparkles, Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, query, where } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function TeacherTrailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [newTrail, setNewTrail] = useState({ title: "", category: "", description: "", isFundamental: false });

  const trailsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, "learning_trails"), where("teacherId", "==", user.uid));
  }, [user, firestore]);

  const { data: trails, isLoading } = useCollection(trailsQuery);

  const handleCreateTrail = () => {
    if (!newTrail.title || !newTrail.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a categoria.",
        variant: "destructive",
      });
      return;
    }

    if (firestore && user) {
      addDocumentNonBlocking(collection(firestore, "learning_trails"), {
        title: newTrail.title,
        category: newTrail.category,
        description: newTrail.description,
        isFundamental: newTrail.isFundamental,
        teacherId: user.uid,
        teacherName: user.displayName || "Professor da Rede",
        modulesCount: 0,
        totalContents: 0,
        students: 0,
        status: "draft",
        targetAudience: "both",
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Rascunho criado!",
        description: "Agora adicione os módulos e publique para os alunos.",
      });

      setNewTrail({ title: "", category: "", description: "", isFundamental: false });
      setIsCreateDialogOpen(false);
    }
  };

  const handleSeedTrails = async () => {
    if (!firestore || !user) return;
    setIsSeeding(true);

    const exampleTrails = [
      {
        title: "Cálculo I: O Poder das Derivadas",
        category: "Matemática",
        description: "Explore os fundamentos do cálculo diferencial, desde limites até aplicações reais de taxas de variação.",
        isFundamental: true,
        modules: [
          { 
            title: "Módulo 1: Conceitos de Limites", 
            contents: [
              { title: "Videoaula: O que é um limite?", type: "video", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
              { title: "PDF: Tabela de Limites Fundamentais", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
            ] 
          },
          { 
            title: "Módulo 2: Regras de Derivação", 
            contents: [
              { title: "Videoaula: Regra da Cadeia", type: "video", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
              { 
                title: "Simulado IA: Desafios de Derivadas", 
                type: "quiz", 
                questions: [
                  { question: "Qual a derivada de f(x) = x²?", options: ["x", "2x", "2", "x²-1"], correctIndex: 1, explanation: "Pela regra do tombo, o expoente 2 desce multiplicando e subtraímos 1 do expoente.", sourceStyle: "Estudantil" },
                  { question: "A derivada da constante é sempre zero?", options: ["Sim", "Não", "Depende do x", "Apenas em limites"], correctIndex: 0, explanation: "Uma constante não varia, e a derivada mede a taxa de variação.", sourceStyle: "Teórico" }
                ] 
              }
            ] 
          }
        ]
      },
      {
        title: "Next.js 15: Arquitetura Moderna",
        category: "Tecnologia",
        description: "Aprenda a construir aplicações escaláveis utilizando Server Components, Server Actions e o novo App Router.",
        isFundamental: false,
        modules: [
          { 
            title: "Módulo 1: Fundamentos do App Router", 
            contents: [
              { title: "Videoaula: Estrutura de Pastas", type: "video", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
              { title: "Artigo: Server vs Client Components", type: "text", description: "Uma explicação detalhada sobre quando usar cada um para otimizar o bundle." }
            ] 
          }
        ]
      },
      {
        title: "Redação nota 1000: Competências ENEM",
        category: "Linguagens",
        description: "Domine as 5 competências exigidas pelo ENEM para alcançar a nota máxima na sua redação.",
        isFundamental: true,
        modules: [
          { 
            title: "Módulo 1: A Proposta de Intervenção", 
            contents: [
              { title: "PDF: Guia de Agentes Sociais", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
              { title: "Videoaula: Detalhamento do GOMFS", type: "video", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" }
            ] 
          }
        ]
      }
    ];

    try {
      for (const trailData of exampleTrails) {
        const trailRef = doc(collection(firestore, "learning_trails"));
        let totalContents = 0;
        
        // Criar Trail
        setDocumentNonBlocking(trailRef, {
          title: trailData.title,
          category: trailData.category,
          description: trailData.description,
          isFundamental: trailData.isFundamental,
          teacherId: user.uid,
          teacherName: user.displayName || "Mentor da Rede",
          modulesCount: trailData.modules.length,
          totalContents: 0, 
          students: Math.floor(Math.random() * 50),
          status: "active",
          targetAudience: "both",
          createdAt: new Date().toISOString(),
          image: `https://picsum.photos/seed/${trailData.title}/600/400`
        }, { merge: true });

        // Criar Módulos e Conteúdos
        for (let i = 0; i < trailData.modules.length; i++) {
          const modData = trailData.modules[i];
          const modRef = doc(collection(firestore, "learning_trails", trailRef.id, "modules"));
          
          setDocumentNonBlocking(modRef, {
            title: modData.title,
            order: i,
            createdAt: new Date().toISOString()
          }, { merge: true });

          for (let j = 0; j < modData.contents.length; j++) {
            const contentData = modData.contents[j];
            const contentRef = doc(collection(firestore, "learning_trails", trailRef.id, "modules", modRef.id, "contents"));
            
            setDocumentNonBlocking(contentRef, {
              ...contentData,
              order: j,
              createdAt: new Date().toISOString()
            }, { merge: true });
            
            totalContents++;
          }
        }

        setDocumentNonBlocking(trailRef, { totalContents }, { merge: true });
      }

      toast({ title: "Exemplos Gerados!", description: "Trilhas completas com marcações fundamentais foram adicionadas." });
    } catch (e) {
      toast({ title: "Erro ao gerar", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDeleteTrail = (trailId: string) => {
    if (confirm("Remover permanentemente?")) {
      if (firestore) {
        const trailRef = doc(firestore, "learning_trails", trailId);
        deleteDocumentNonBlocking(trailRef);
        toast({
          title: "Trilha removida",
          description: "A trilha foi excluída permanentemente.",
        });
      }
    }
  };

  const filteredTrails = trails?.filter(trail => 
    trail.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trail.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Gestão de Trilhas</h1>
          <p className="text-muted-foreground font-medium text-lg">Crie caminhos pedagógicos ricos com vídeos e documentos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSeedTrails} 
            disabled={isSeeding}
            className="rounded-2xl h-14 border-dashed border-primary/20 text-primary font-black px-6 hover:bg-primary/5"
          >
            {isSeeding ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FlaskConical className="h-5 w-5 mr-2 text-accent" />}
            Gerar Trilhas Exemplo
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl shadow-accent/20 hover:bg-accent/90 border-none text-base">
                <Plus className="h-6 w-6 mr-2" />
                Nova Trilha Digital
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-none shadow-2xl sm:max-w-[600px] p-10 bg-white">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-primary italic leading-none">Configurar Trilha</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium pt-2">Defina os objetivos e metadados básicos.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Título da Trilha</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Fundamentos de IA Generativa" 
                    className="h-14 bg-muted/30 border-none rounded-2xl text-lg font-bold italic"
                    value={newTrail.title}
                    onChange={(e) => setNewTrail({ ...newTrail, title: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-accent/10">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-black text-primary italic flex items-center gap-2">
                      <Flame className="h-4 w-4 text-accent" />
                      Trilha Fundamental?
                    </Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Marque se este tema é um pilar recorrente em provas.</p>
                  </div>
                  <Switch 
                    checked={newTrail.isFundamental} 
                    onCheckedChange={(v) => setNewTrail({ ...newTrail, isFundamental: v })} 
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Categoria Pedagógica</Label>
                  <Input 
                    id="category" 
                    placeholder="Ex: Tecnologia, Matemática..." 
                    className="h-14 bg-muted/30 border-none rounded-2xl text-lg font-bold italic"
                    value={newTrail.category}
                    onChange={(e) => setNewTrail({ ...newTrail, category: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Descrição/Objetivo</Label>
                  <Textarea 
                    id="description" 
                    placeholder="O que o aluno aprenderá nesta jornada?" 
                    className="min-h-[120px] bg-muted/30 border-none rounded-2xl font-medium"
                    value={newTrail.description}
                    onChange={(e) => setNewTrail({ ...newTrail, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateTrail}
                  className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-2xl shadow-primary/20 border-none active:scale-95 transition-transform"
                >
                  Criar Rascunho & Continuar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
        <Input 
          placeholder="Pesquisar entre suas trilhas..." 
          className="pl-12 h-14 bg-white border-none shadow-xl rounded-[1.25rem] text-lg font-medium italic focus-visible:ring-accent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrails.map((trail) => (
            <Card key={trail.id} className={`border-none shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 bg-white rounded-[2.5rem] flex flex-col ${trail.isFundamental ? 'ring-2 ring-accent/30' : ''}`}>
              <div className="relative aspect-video bg-muted overflow-hidden">
                <Image 
                  src={trail.image || `https://picsum.photos/seed/trail-prof-${trail.id}/600/400`} 
                  alt={trail.title} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-110 duration-700"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className={`${trail.status === 'active' ? 'bg-green-600' : 'bg-orange-500'} text-white border-none px-4 py-1 font-black text-[10px] uppercase tracking-tighter shadow-lg`}>
                    {trail.status === 'active' ? 'PUBLICADA' : 'RASCUNHO'}
                  </Badge>
                  {trail.isFundamental && (
                    <Badge className="bg-accent text-accent-foreground border-none px-3 py-1 font-black text-[8px] uppercase tracking-tighter shadow-lg flex items-center gap-1.5">
                      <Flame className="h-3 w-3 fill-accent-foreground" />
                      ALTA RECORRÊNCIA
                    </Badge>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                  <Button variant="secondary" size="icon" className="rounded-full h-12 w-12 shadow-2xl hover:scale-110 transition-transform" asChild>
                    <Link href={`/dashboard/teacher/trails/${trail.id}`}><Edit className="h-5 w-5" /></Link>
                  </Button>
                  <Button variant="destructive" size="icon" className="rounded-full h-12 w-12 shadow-2xl hover:scale-110 transition-transform" onClick={() => handleDeleteTrail(trail.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{trail.category}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                    <Clock className="h-3 w-3" />
                    {new Date(trail.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="text-xl font-black leading-tight group-hover:text-primary transition-colors italic truncate">{trail.title}</CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2 font-medium">{trail.description}</p>
              </CardHeader>
              <CardFooter className="p-8 pt-4 border-t border-muted/10 flex items-center justify-between mt-auto bg-muted/5">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Estrutura</span>
                  <span className="text-base font-black text-primary italic">{trail.modulesCount || 0} Módulos</span>
                </div>
                <Button variant="ghost" className="h-11 px-6 rounded-xl font-black text-[10px] uppercase text-accent hover:bg-accent/10 transition-all group/btn" asChild>
                  <Link href={`/dashboard/teacher/trails/${trail.id}`}>
                    Gerenciar
                    <LayoutDashboard className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          <button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="border-4 border-dashed border-muted/30 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-6 hover:border-accent/50 hover:bg-accent/5 transition-all group min-h-[380px] bg-white/50"
          >
            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all shadow-sm">
              <Plus className="h-10 w-10" />
            </div>
            <div>
              <p className="font-black text-primary italic text-2xl">Nova Trilha Digital</p>
              <p className="text-sm text-muted-foreground font-medium mt-2 max-w-[200px]">Adicione vídeos e materiais complementares.</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
