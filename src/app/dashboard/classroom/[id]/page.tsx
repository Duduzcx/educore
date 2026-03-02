
"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  FileText, 
  BookOpen, 
  PlayCircle, 
  BrainCircuit,
  Paperclip,
  Loader2,
  Video,
  CheckCircle2,
  HelpCircle,
  Layout,
  Layers,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  PlusCircle,
  Clock,
  Compass
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/lib/supabase";

export default function ClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: trailId } = use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [trail, setTrail] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, any[]>>({});
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolledLoading] = useState(false);
  
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<any>(null);

  const loadTrailData = useCallback(async () => {
    if (!trailId || !user) return;
    try {
      setLoading(true);
      
      const { data: trailData } = await supabase.from('trails').select('*').eq('id', trailId).single();
      if (!trailData) {
        toast({ title: "Trilha não encontrada", variant: "destructive" });
        return;
      }
      setTrail(trailData);

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('trail_id', trailId)
        .maybeSingle();
      
      if (progressData) {
        setIsEnrolled(true);
        setVideoProgress(progressData.percentage || 0);
        setIsCompleted(progressData.percentage === 100);
      }

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('trail_id', trailId)
        .order('order_index');
      
      if (!modulesData || modulesData.length === 0) {
        setModules([]);
        setLoading(false);
        return;
      }
      setModules(modulesData);
      setActiveModuleId(modulesData[0].id);
      
      const moduleIds = modulesData.map(m => m.id);
      const { data: contentsData } = await supabase
        .from('learning_contents')
        .select('*')
        .in('module_id', moduleIds)
        .order('order_index');
      
      const contentMap: Record<string, any[]> = {};
      contentsData?.forEach(c => {
        if (!contentMap[c.module_id]) contentMap[c.module_id] = [];
        contentMap[c.module_id].push(c);
      });
      setContents(contentMap);

      if (contentMap[modulesData[0].id]?.length > 0) {
        setActiveContentId(contentMap[modulesData[0].id][0].id);
      }
    } catch (e: any) {
      console.error("Erro ao carregar aula:", e);
    } finally {
      setLoading(false);
    }
  }, [trailId, user, toast]);

  useEffect(() => {
    loadTrailData();
  }, [loadTrailData]);

  const handleEnroll = async () => {
    if (!user || !trailId || isEnrolling) return;
    setIsEnrolledLoading(true);
    try {
      const { error } = await supabase.from('user_progress').upsert({
        user_id: user.id,
        trail_id: trailId,
        percentage: videoProgress > 0 ? Math.round(videoProgress) : 0,
        last_accessed: new Date().toISOString()
      }, { onConflict: 'user_id,trail_id' });

      if (!error) {
        setIsEnrolled(true);
        toast({ title: "Fixado no Dashboard!", description: "Acompanhe seu progresso pela página inicial." });
      } else {
        throw error;
      }
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsEnrolledLoading(false);
    }
  };

  const updateServerProgress = useCallback(async (percentage: number) => {
    const completed = percentage >= 80;
    if (completed && !isCompleted && user && trailId) {
      setIsCompleted(true);
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        trail_id: trailId,
        percentage: Math.round(percentage),
        last_accessed: new Date().toISOString()
      }, { onConflict: 'user_id,trail_id' });
      toast({ title: "Progresso Registrado! ✅", description: "Sua dedicação está sendo mapeada." });
    }
  }, [isCompleted, toast, user, trailId]);

  const onPlayerStateChange = useCallback((event: any) => {
    if (event.data === 1) { 
      progressInterval.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          if (duration > 0) {
            const percent = (currentTime / duration) * 100;
            setVideoProgress(percent);
            updateServerProgress(percent);
          }
        }
      }, 5000); 
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  }, [updateServerProgress]);

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = () => setIsApiReady(true);
    } else if (typeof window !== "undefined" && (window as any).YT) {
      setIsApiReady(true);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, []);

  const activeContent = contents[activeModuleId || ""]?.find(c => c.id === activeContentId);

  useEffect(() => {
    if (activeContent?.type === 'video' && isApiReady) {
      if (playerRef.current) playerRef.current.destroy();
      
      const vidUrl = activeContent.url || '';
      let vidId = '';
      if (vidUrl.includes('v=')) vidId = vidUrl.split('v=')[1].split('&')[0];
      else if (vidUrl.includes('youtu.be/')) vidId = vidUrl.split('youtu.be/')[1].split('?')[0];
      else vidId = vidUrl;

      if (vidId) {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          videoId: vidId,
          playerVars: { 'autoplay': 0, 'modestbranding': 1, 'rel': 0, 'showinfo': 0 },
          events: { 'onStateChange': onPlayerStateChange }
        });
      }
    } else if (activeContent && activeContent.type !== 'video') {
      setVideoProgress(100);
    }
  }, [activeContentId, activeContent, isApiReady, onPlayerStateChange]);

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center gap-6 bg-slate-900">
      <div className="relative">
        <Loader2 className="animate-spin h-20 w-20 text-accent opacity-20" />
        <Loader2 className="animate-spin h-20 w-20 text-accent absolute top-0 left-0" style={{ animationDuration: '3s' }} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white animate-pulse">Sintonizando Estúdio Pedagógico</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      
      <header className="bg-primary text-white px-4 md:px-8 h-16 md:h-20 flex items-center justify-between shrink-0 z-20 shadow-2xl relative">
        <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white/10 h-10 w-10 shrink-0 text-white">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Compass className="h-3 w-3 text-accent" />
              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Sala de Aula • {trail?.category}</p>
            </div>
            <h1 className="text-sm md:text-xl font-black italic leading-none truncate max-w-[150px] md:max-w-[400px]">{trail?.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8 shrink-0">
          <div className="hidden lg:flex flex-col items-end gap-1.5 w-56">
            <div className="flex justify-between w-full text-[9px] font-black uppercase text-white/40">
              <span>Evolução na Trilha</span>
              <span className="text-accent italic">{Math.round(videoProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
               <div className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${videoProgress}%` }} />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEnrolled && (
              <Button onClick={handleEnroll} disabled={isEnrolling} className="hidden sm:flex bg-accent text-accent-foreground font-black text-[10px] uppercase h-10 px-6 rounded-xl shadow-xl hover:scale-105 transition-all border-none">
                {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                Fixar Trilha
              </Button>
            )}
            <Button variant="outline" size="icon" className="lg:hidden rounded-xl border-white/20 text-white bg-transparent h-10 w-10 hover:bg-white/10" onClick={() => setShowSidebar(!showSidebar)}>
              {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        
        <aside className={`
          absolute inset-y-0 left-0 w-full sm:w-80 lg:w-[400px] bg-white border-r z-30 transition-transform duration-500 transform
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none
        `}>
          <div className="p-6 bg-slate-50 border-b shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Ementa da Jornada</h2>
              <Badge className="bg-primary/5 text-primary text-[8px] font-black border-none px-2">{modules.length} CAPÍTULOS</Badge>
            </div>
            
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2 scrollbar-hide">
              {modules.map((module, idx) => (
                <button 
                  key={module.id}
                  onClick={() => {
                    setActiveModuleId(module.id);
                    if (contents[module.id]?.length > 0) setActiveContentId(contents[module.id][0].id);
                    if (window.innerWidth < 1024) setShowSidebar(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border-2 relative overflow-hidden group ${
                    activeModuleId === module.id 
                      ? 'bg-primary text-white border-primary shadow-xl scale-[1.02]' 
                      : 'bg-white border-transparent hover:bg-slate-100 text-primary/60'
                  }`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <span className={`text-lg font-black italic ${activeModuleId === module.id ? 'text-accent' : 'text-primary/20'}`}>
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <p className="font-black text-[10px] uppercase tracking-wider truncate flex-1">{module.title}</p>
                    {activeModuleId === module.id && <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                  </div>
                  {activeModuleId === module.id && (
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
             <div className="flex items-center gap-2 mb-4">
                <Layers className="h-3 w-3 text-accent" />
                <h3 className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Materiais da Unidade</h3>
             </div>
             
             <div className="space-y-3">
               {contents[activeModuleId || ""]?.map((content) => (
                  <button 
                    key={content.id}
                    onClick={() => {
                      setActiveContentId(content.id);
                      if (window.innerWidth < 1024) setShowSidebar(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 border-2 ${
                      activeContentId === content.id 
                        ? 'bg-accent/5 border-accent shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-accent/20 hover:bg-slate-50'
                    }`}>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                        activeContentId === content.id ? 'bg-accent text-white' : 'bg-slate-100 text-primary/30'
                      }`}>
                         {content.type === 'video' ? <PlayCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-black text-[10px] uppercase tracking-widest truncate ${
                          activeContentId === content.id ? 'text-primary' : 'text-primary/60'
                        }`}>{content.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">{content.type}</span>
                          {content.type === 'video' && <Clock className="h-2 w-2 text-muted-foreground" />}
                        </div>
                      </div>
                      {activeContentId === content.id && (
                        <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      )}
                  </button>
               ))}
               {(!contents[activeModuleId || ""] || contents[activeModuleId || ""].length === 0) && (
                 <div className="py-10 text-center border-2 border-dashed rounded-[2rem] opacity-30">
                    <p className="text-[10px] font-black uppercase">Sem materiais cadastrados</p>
                 </div>
               )}
             </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* Cinema Player Container */}
          <div className="w-full aspect-video md:aspect-[21/9] bg-black relative group shadow-2xl shrink-0 ring-1 ring-white/5">
            {activeContent?.type === 'video' ? (
              <div id="youtube-player" className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-primary text-white p-10 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>
                <div className="h-20 w-20 md:h-28 md:w-28 rounded-[2.5rem] bg-white/10 backdrop-blur-xl flex items-center justify-center mb-8 animate-pulse relative">
                  <Layout className="h-10 w-10 md:h-14 md:w-14 text-accent" />
                  <div className="absolute inset-0 rounded-[2.5rem] border-2 border-accent/20 animate-ping" style={{ animationDuration: '3s' }} />
                </div>
                <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter max-w-2xl px-4 drop-shadow-2xl">{activeContent?.title || "Selecione um Material para Iniciar"}</h3>
                <p className="text-xs md:text-sm text-white/40 mt-4 max-w-md italic font-medium tracking-wide">Utilize o console técnico abaixo para interagir com este conteúdo.</p>
              </div>
            )}
          </div>

          <Tabs defaultValue="summary" className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 h-14 md:h-20 bg-slate-900 p-0 gap-0 shrink-0 border-b border-white/5 shadow-xl">
              {[
                { id: "summary", label: "Guia", icon: BookOpen },
                { id: "quiz", label: "Prática", icon: BrainCircuit },
                { id: "support", label: "Live", icon: Video },
                { id: "attachments", label: "Anexos", icon: Paperclip }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="data-[state=active]:bg-white data-[state=active]:text-primary h-full rounded-none font-black text-[10px] uppercase tracking-[0.2em] transition-all gap-3 border-none text-white/40 hover:text-white/80"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollable-content bg-slate-50/30">
               <TabsContent value="summary" className="mt-0 outline-none animate-in slide-in-from-bottom-4 duration-500">
                  <div className="max-w-5xl space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl rotate-3">
                        <Sparkles className="h-7 w-7 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-primary italic leading-none">Diretrizes da Mentoria</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Instruções Técnicas para este Material</p>
                      </div>
                    </div>
                    
                    <Card className="border-none shadow-2xl bg-white p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6 text-accent">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Recomendações Aurora</span>
                        </div>
                        <p className="text-base md:text-xl leading-relaxed text-primary/80 font-medium italic whitespace-pre-line">
                          {activeContent?.description || "Este conteúdo foi estrategicamente curado para fortalecer sua base de conhecimento. Foque nos conceitos fundamentais, anote as dúvidas críticas e prepare-se para aplicar este conhecimento na próxima avaliação prática."}
                        </p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                    </Card>
                  </div>
               </TabsContent>

               <TabsContent value="quiz" className="mt-0 outline-none animate-in slide-in-from-bottom-4 duration-500">
                  <div className="max-w-5xl space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl">
                          <BrainCircuit className="h-7 w-7" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-black text-primary italic leading-none">Atividade de Fixação</h2>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Consolidação de Aprendizado</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px] px-5 py-2 uppercase rounded-full shadow-sm">Auditado por IA</Badge>
                    </div>
                    
                    {activeContent?.url?.includes('quiz') || activeContent?.url?.includes('form') ? (
                      <Card className="p-10 md:p-20 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-center space-y-8 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                            <Layers className="h-40 w-40 text-primary" />
                         </div>
                         <div className="h-24 w-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Layers className="h-12 w-12 text-accent" />
                         </div>
                         <div className="space-y-3 relative z-10">
                            <p className="text-xl md:text-2xl font-black text-primary italic">Ambiente de Simulado Externo</p>
                            <p className="text-sm text-muted-foreground font-medium italic max-w-md mx-auto">Este capítulo possui uma avaliação vinculada em plataforma externa segura.</p>
                         </div>
                         <Button asChild className="bg-primary text-white h-16 md:h-20 rounded-2xl md:rounded-[2rem] font-black px-12 md:px-20 shadow-[0_20px_40px_rgba(26,44,75,0.3)] hover:scale-105 transition-all w-full md:w-auto border-none text-lg">
                           <a href={activeContent?.url} target="_blank" rel="noopener noreferrer">
                             ABRIR LABORATÓRIO DE PROVAS 
                             <ArrowRight className="ml-3 h-6 w-6 text-accent" />
                           </a>
                         </Button>
                      </Card>
                    ) : (
                      <div className="text-center py-20 md:py-32 bg-slate-100/50 rounded-[3rem] border-4 border-dashed border-slate-200 opacity-40">
                        <HelpCircle className="h-16 w-16 md:h-24 md:w-24 mx-auto mb-6 text-slate-300" />
                        <p className="text-sm md:text-lg font-black uppercase tracking-[0.3em] italic text-primary/40">Nenhum quiz vinculado a este item</p>
                      </div>
                    )}
                  </div>
               </TabsContent>

               <TabsContent value="attachments" className="mt-0 outline-none animate-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    {activeContent?.type === 'pdf' || activeContent?.url?.includes('.pdf') ? (
                      <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem] flex items-center gap-8 group hover:bg-primary transition-all duration-700 cursor-pointer overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-full bg-slate-50 group-hover:bg-white/5 transition-colors" />
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white shadow-inner transition-all group-hover:rotate-6">
                          <FileText className="h-8 w-8 md:h-10 md:w-10" />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <p className="font-black text-[9px] text-accent group-hover:text-white/60 uppercase tracking-[0.2em] mb-1">Material de Apoio</p>
                          <p className="text-lg md:text-2xl font-black text-primary group-hover:text-white italic leading-tight truncate">Guia Técnico.pdf</p>
                        </div>
                        <Button asChild variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16 rounded-full text-primary group-hover:text-white hover:bg-white/20 shrink-0 border-none relative z-10">
                          <a href={activeContent?.url} target="_blank" rel="noopener noreferrer"><Paperclip className="h-6 w-6 md:h-8 md:w-8" /></a>
                        </Button>
                      </Card>
                    ) : (
                      <div className="col-span-full py-20 text-center opacity-20 border-4 border-dashed rounded-[3rem]">
                        <p className="text-xl font-black italic">Sem anexos para este material.</p>
                      </div>
                    )}
                  </div>
               </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
