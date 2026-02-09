"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  FileText, 
  Sparkles, 
  BookOpen, 
  ListChecks, 
  PlayCircle, 
  BrainCircuit,
  Bot,
  Paperclip,
  Loader2,
  Video,
  Send,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ClassroomPage() {
  const params = useParams();
  const trailId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [trail, setTrail] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, any[]>>({});
  
  const [chatInput, setChatInput] = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !trailId) return;
      setLoading(true);
      try {
        const { data: trailData } = await supabase.from('learning_trails').select('*').eq('id', trailId).single();
        setTrail(trailData);

        const { data: modulesData } = await supabase.from('learning_modules').select('*').eq('trail_id', trailId).order('order_index', { ascending: true });
        setModules(modulesData || []);

        if (modulesData && modulesData.length > 0) {
          setActiveModuleId(modulesData[0].id);
          const mIds = modulesData.map(m => m.id);
          const { data: contentsData } = await supabase.from('learning_contents').select('*').in('module_id', mIds).order('created_at', { ascending: true });
          
          const grouped: Record<string, any[]> = {};
          contentsData?.forEach(c => {
            if (!grouped[c.module_id]) grouped[c.module_id] = [];
            grouped[c.module_id].push(c);
          });
          setContents(grouped);
          
          if (contentsData && contentsData.length > 0) {
            setActiveContentId(contentsData[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, trailId]);

  const activeModule = modules.find(m => m.id === activeModuleId);
  const activeContent = contents[activeModuleId || ""]?.find(c => c.id === activeContentId);

  // Auto-scroll para o topo quando muda de aula
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeContentId]);

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center gap-4 bg-background">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Sintonizando Aula...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* CABEÇALHO FIXO */}
      <header className="bg-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 border border-white/20">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 hover:bg-primary/5">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-black text-primary italic leading-none truncate max-w-[300px]">{trail?.title}</h1>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Módulo Atual: {activeModule?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full max-w-xs ml-auto">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Progresso da Trilha</span>
              <span className="text-[10px] font-black text-accent italic">33%</span>
            </div>
            <Progress value={33} className="h-1.5 bg-muted rounded-full overflow-hidden" />
          </div>
          <Badge className="bg-primary/5 text-primary border-none font-black h-8 px-3 text-[10px]">1/3</Badge>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL E MÓDULOS */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden">

        {/* Coluna Esquerda: Player e Abas (A área que rola) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-white rounded-[2rem] shadow-xl overflow-hidden border border-white/20">
          
          {/* Player Fixo no topo da coluna */}
          <div className="w-full aspect-video bg-slate-950 shrink-0 relative group">
            {activeContent?.type === 'video' ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${activeContent.url?.includes('v=') ? activeContent.url.split('v=')[1] : activeContent.url}?modestbranding=1&rel=0`} 
                title={activeContent.title} 
                frameBorder="0" 
                allowFullScreen
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-white p-10 text-center">
                <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center mb-2">
                  {activeContent?.type === 'quiz' ? <BrainCircuit className="h-10 w-10 text-accent" /> : <FileText className="h-10 w-10 text-blue-400" />}
                </div>
                <h2 className="text-2xl font-black italic">{activeContent?.title}</h2>
                <p className="text-sm opacity-60 font-medium">Este material está disponível abaixo para leitura e interação.</p>
              </div>
            )}
          </div>

          {/* Área de Tabs que rola */}
          <Tabs defaultValue="summary" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1.5 h-14 rounded-none border-b border-muted/20">
              <TabsTrigger value="summary" className="gap-2 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary rounded-xl transition-all">
                <BookOpen className="h-4 w-4 text-accent"/>Aula
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary rounded-xl transition-all">
                <BrainCircuit className="h-4 w-4 text-accent"/>Quiz IA
              </TabsTrigger>
              <TabsTrigger value="live" className="gap-2 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary rounded-xl transition-all">
                <Video className="h-4 w-4 text-red-500"/>Live
              </TabsTrigger>
              <TabsTrigger value="materials" className="gap-2 font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary rounded-xl transition-all">
                <Paperclip className="h-4 w-4 text-blue-500"/>Apoio
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin" ref={scrollRef}>
              <TabsContent value="summary" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><Bot className="h-6 w-6 text-accent" /></div>
                    <div>
                      <h3 className="font-black text-xl text-primary italic leading-none">Guia de Estudo Digital</h3>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Curadoria Aurora IA para esta aula</p>
                    </div>
                  </div>
                  <div className="bg-muted/20 p-8 rounded-[2rem] border-2 border-dashed border-muted/30">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium italic">
                      {activeContent?.description || "Nesta unidade exploramos os conceitos fundamentais para sua aprovação. Acompanhe o vídeo atentamente e utilize os materiais de apoio para fixar o conteúdo."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quiz" className="mt-0 outline-none">
                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xl text-primary italic">Avaliação de Fixação</h3>
                      <Badge className="bg-accent text-accent-foreground font-black text-[8px] uppercase px-3 py-1">ESTILO ENEM</Badge>
                    </div>
                    
                    {activeContent?.type === 'quiz' && activeContent.description ? (
                      <div className="space-y-6">
                        {JSON.parse(activeContent.description).map((q: any, i: number) => (
                          <Card key={i} className="border-none shadow-lg bg-slate-50 rounded-[2rem] overflow-hidden">
                            <div className="bg-primary p-4 text-white flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest">Questão {i+1}</span>
                              <Badge variant="secondary" className="text-[7px]">{q.sourceStyle}</Badge>
                            </div>
                            <CardContent className="p-8 space-y-6">
                              <p className="font-bold text-sm md:text-base text-slate-800 leading-relaxed">{q.question}</p>
                              <div className="grid gap-3">
                                {q.options.map((opt: string, j: number) => (
                                  <Button key={j} variant="outline" className="justify-start h-auto py-4 px-6 rounded-2xl border-2 hover:bg-accent/5 hover:border-accent text-xs font-medium whitespace-normal text-left gap-4">
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center font-black shrink-0">{String.fromCharCode(65 + j)}</div>
                                    {opt}
                                  </Button>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center border-4 border-dashed border-muted/20 rounded-[3rem] bg-muted/5">
                        <BrainCircuit className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="font-black text-primary italic">Nenhum quiz para este tópico</p>
                        <p className="text-xs font-medium text-muted-foreground mt-2">O professor ainda não publicou uma avaliação para este capítulo.</p>
                      </div>
                    )}
                 </div>
              </TabsContent>

              <TabsContent value="live" className="mt-0 outline-none">
                <div className="h-[400px] flex flex-col gap-6">
                  <div className="flex items-center gap-4 p-6 bg-red-50 rounded-[2rem] border-2 border-red-100">
                    <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg"><Video className="h-6 w-6 text-white animate-pulse" /></div>
                    <div>
                      <h3 className="font-black text-lg text-red-900 italic leading-none">Interação ao Vivo</h3>
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest mt-1">Sua dúvida será enviada ao monitor</p>
                    </div>
                  </div>
                  
                  <Card className="flex-1 bg-muted/10 rounded-[2rem] border-none shadow-inner p-6 flex flex-col items-center justify-center text-center opacity-40">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p className="font-black italic">Chat de Live Ativo</p>
                    <p className="text-xs font-medium mt-2">Esta aba conecta você diretamente ao Master Control durante as transmissões.</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="mt-0 outline-none">
                <div className="space-y-4">
                  <h3 className="font-black text-xl text-primary italic mb-6">Biblioteca da Unidade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Documentação Oficial", type: "PDF" },
                      { title: "Cheat Sheet de Conceitos", type: "IMAGE" }
                    ].map((mat, i) => (
                      <a key={i} href="#" className="flex items-center gap-5 bg-white hover:bg-primary hover:text-white p-5 rounded-[1.5rem] shadow-lg transition-all group border border-muted/20">
                        <div className="h-12 w-12 rounded-2xl bg-muted group-hover:bg-white/20 flex items-center justify-center transition-colors">
                          <FileText className="h-6 w-6 text-primary group-hover:text-white"/>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-black text-sm italic truncate">{mat.title}</p>
                          <span className="text-[8px] font-black uppercase opacity-40 group-hover:opacity-70">{mat.type}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Coluna Direita: Módulos e Conteúdo (Fixa) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0">
          <Card className="bg-primary text-white shadow-2xl p-6 rounded-[2.5rem] border-none overflow-hidden relative">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4 flex items-center justify-between">
              Estrutura da Trilha <Badge className="bg-accent text-accent-foreground border-none text-[8px]">{modules.length}</Badge>
            </h2>
            <div className="space-y-2 overflow-y-auto max-h-[250px] scrollbar-hide">
              {modules.map((module, idx) => (
                <button 
                  key={module.id}
                  onClick={() => setActiveModuleId(module.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all relative overflow-hidden group ${activeModuleId === module.id ? 'bg-white text-primary shadow-xl' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <span className={`text-xl font-black italic ${activeModuleId === module.id ? 'text-accent' : 'text-white/20'}`}>{idx + 1}</span>
                    <p className="font-black text-xs uppercase tracking-wider truncate">{module.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-white shadow-2xl p-6 rounded-[2.5rem] flex-1 flex flex-col min-h-0 border border-muted/20">
             <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mb-6 px-2">Roteiro de Estudos</h2>
             <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 scrollbar-thin">
              {contents[activeModuleId || ""]?.map(content => (
                  <button 
                    key={content.id}
                    onClick={() => setActiveContentId(content.id)}
                    className={`w-full text-left p-4 rounded-[1.5rem] transition-all flex items-center gap-4 border-2 ${activeContentId === content.id ? 'bg-accent/5 border-accent shadow-lg shadow-accent/5' : 'bg-muted/10 border-transparent hover:bg-muted/20'}`}>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${activeContentId === content.id ? 'bg-accent text-white' : 'bg-white text-primary/40'}`}>
                         {content.type === 'video' && <PlayCircle className="h-5 w-5" />}
                         {content.type === 'quiz' && <BrainCircuit className="h-5 w-5" />}
                         {content.type !== 'video' && content.type !== 'quiz' && <FileText className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-black text-[10px] uppercase tracking-widest truncate ${activeContentId === content.id ? 'text-accent' : 'text-primary/60'}`}>{content.title}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60 mt-0.5">{content.type}</p>
                      </div>
                      {activeContentId === content.id && <CheckCircle2 className="h-4 w-4 text-accent ml-auto shrink-0" />}
                  </button>
              ))}
              {(!contents[activeModuleId || ""] || contents[activeModuleId || ""].length === 0) && (
                <div className="py-10 text-center opacity-20 italic text-[10px] font-black uppercase">Vazio</div>
              )}
             </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
