
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Layout, 
  FileText, 
  CheckSquare, 
  ChevronLeft, 
  Loader2, 
  Send, 
  Bot, 
  Radio, 
  Lightbulb, 
  Youtube, 
  PlayCircle,
  FileVideo,
  ChevronRight,
  Sparkles,
  Info,
  ExternalLink,
  BookOpen,
  ArrowRight,
  AlignLeft,
  FileSearch
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function ClassroomPage() {
  const params = useParams();
  const trailId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<any>({
    trail: null,
    modules: [],
    progress: null,
    activeLive: null,
    contents: [],
    loading: true
  });

  const [uiState, setUiState] = useState({
    activeModuleId: null as string | null,
    activeContentId: null as string | null,
    currentTab: "content",
    liveMessages: [] as any[],
    liveInput: "",
    isAiLoading: false,
    isSendingLive: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const activeContent = useMemo(() => 
    data.contents.find((c: any) => c.id === uiState.activeContentId)
  , [data.contents, uiState.activeContentId]);

  const loadPageData = useCallback(async () => {
    if (!user || !trailId) return;
    
    try {
      const [trailRes, modulesRes, progressRes, liveRes] = await Promise.all([
        supabase.from('learning_trails').select('id, title, category').eq('id', trailId).single(),
        supabase.from('learning_modules').select('id, title, order_index').eq('trail_id', trailId).order('order_index', { ascending: true }),
        supabase.from('user_progress').select('percentage').eq('user_id', user.id).eq('trail_id', trailId).maybeSingle(),
        supabase.from('lives').select('id, youtube_id').eq('trail_id', trailId).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      let initialContents: any[] = [];
      let firstModuleId = modulesRes.data?.[0]?.id;

      if (firstModuleId) {
        const { data: cData } = await supabase.from('learning_contents').select('id, title, type, url, description').eq('module_id', firstModuleId).order('created_at', { ascending: true });
        initialContents = cData || [];
      }

      setData({
        trail: trailRes.data,
        modules: modulesRes.data || [],
        progress: progressRes.data,
        activeLive: liveRes.data,
        contents: initialContents,
        loading: false
      });

      setUiState(prev => ({
        ...prev,
        activeModuleId: firstModuleId,
        activeContentId: initialContents[0]?.id || null
      }));

      if (liveRes.data) {
        const { data: msgs } = await supabase.from('forum_posts').select('*').eq('forum_id', liveRes.data.id).order('created_at', { ascending: true });
        setUiState(prev => ({ ...prev, liveMessages: msgs || [] }));
      }
    } catch (e) {
      console.error(e);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id, trailId]);

  useEffect(() => { loadPageData(); }, [loadPageData]);

  const switchModule = async (moduleId: string) => {
    if (uiState.activeModuleId === moduleId) return;
    
    const { data: cData } = await supabase.from('learning_contents').select('id, title, type, url, description').eq('module_id', moduleId).order('created_at', { ascending: true });
    
    setUiState(prev => ({ 
      ...prev, 
      activeModuleId: moduleId,
      activeContentId: cData?.[0]?.id || null 
    }));
    
    setData((prev: any) => ({ ...prev, contents: cData || [] }));
  };

  if (data.loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 animate-in fade-in">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Sincronizando Sala de Aula...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      <header className="bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full hover:scale-110 transition-transform"><ChevronLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-xl font-black text-primary italic leading-none">{data.trail?.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-accent text-accent-foreground text-[8px] font-black uppercase px-2">{data.trail?.category}</Badge>
              {data.activeLive && <Badge className="bg-red-600 text-white text-[8px] font-black animate-pulse px-2">AO VIVO AGORA</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-64">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase text-primary/40">
              <span>Seu Progresso</span>
              <span className="text-accent">{data.progress?.percentage || 0}%</span>
            </div>
            <Progress value={data.progress?.percentage || 0} className="h-1.5" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={uiState.currentTab} onValueChange={(v) => setUiState(p => ({ ...p, currentTab: v }))} className="w-full">
            <TabsList className="grid grid-cols-4 h-14 bg-muted/50 p-1 rounded-2xl mb-6 shadow-inner">
              <TabsTrigger value="content" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><Layout className="h-3 w-3" /> AULA</TabsTrigger>
              <TabsTrigger value="live" disabled={!data.activeLive} className="rounded-xl gap-2 font-black text-[9px] uppercase data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"><Radio className="h-3 w-3" /> LIVE</TabsTrigger>
              <TabsTrigger value="assessment" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><CheckSquare className="h-3 w-3" /> QUIZ IA</TabsTrigger>
              <TabsTrigger value="aurora" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><Bot className="h-3 w-3" /> AURORA</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeContent ? (
                <>
                  {/* ÁREA PRINCIPAL DA AULA */}
                  <Card className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl transform-gpu border-4 border-white/10 ring-8 ring-primary/5">
                    {activeContent.type === 'video' ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${activeContent.url?.includes('v=') ? activeContent.url.split('v=')[1]?.split('&')[0] : activeContent.url?.split('/').pop()}`} 
                        frameBorder="0" 
                        allowFullScreen 
                      />
                    ) : activeContent.type === 'text' ? (
                      <div className="h-full bg-white p-12 overflow-y-auto">
                        <div className="max-w-3xl mx-auto space-y-6">
                          <div className="flex items-center gap-3 text-accent mb-8">
                            <AlignLeft className="h-8 w-8" />
                            <h2 className="text-3xl font-black italic text-primary">{activeContent.title}</h2>
                          </div>
                          <div className="prose prose-slate max-w-none">
                            <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line font-medium italic">
                              {activeContent.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white bg-primary p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/20 to-transparent opacity-50" />
                        {activeContent.type === 'pdf' ? <FileSearch className="h-20 w-20 mb-6 opacity-40 animate-pulse" /> : <CheckSquare className="h-20 w-20 mb-6 opacity-40 animate-pulse" />}
                        <h3 className="text-3xl font-black italic relative z-10">{activeContent.title}</h3>
                        <p className="mt-4 text-white/60 font-medium relative z-10 max-w-md italic">
                          Este material deve ser acessado externamente ou via download oficial.
                        </p>
                        <Button className="mt-8 bg-accent text-accent-foreground font-black px-8 h-14 rounded-xl relative z-10 shadow-xl group" asChild>
                          <a href={activeContent.url} target="_blank" rel="noopener noreferrer">
                            Acessar {activeContent.type.toUpperCase()}
                            <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </Card>
                  
                  {/* RESUMO E MATERIAL DE APOIO (Aparece apenas se não for aula de texto puro) */}
                  {activeContent.type !== 'text' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="md:col-span-2 p-8 bg-white rounded-[2.5rem] shadow-xl border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                          <Sparkles className="h-24 w-24 text-accent" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <Info className="h-5 w-5" />
                          </div>
                          <h3 className="text-2xl font-black text-primary italic leading-none">Guia de Estudo</h3>
                        </div>
                        <p className="text-muted-foreground font-medium italic leading-relaxed whitespace-pre-line text-sm md:text-base">
                          {activeContent.description || "O mentor ainda não disponibilizou o resumo desta aula."}
                        </p>
                      </Card>

                      <Card className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl border-none flex flex-col justify-center">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Recurso Ativo</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                              {activeContent.type === 'video' ? <Youtube className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black italic truncate">{activeContent.title}</p>
                              <p className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">{activeContent.type}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white text-[9px] font-black uppercase h-12 rounded-xl shadow-lg" asChild>
                            <a href={activeContent.url} target="_blank" rel="noopener noreferrer">Abrir Link Direto</a>
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-32 text-center border-4 border-dashed rounded-[3rem] bg-muted/5 opacity-40">
                  <PlayCircle className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black italic text-xl text-primary">Selecione uma aula no menu lateral</p>
                </div>
              )}
            </TabsContent>

            {/* ABAS DE LIVE, QUIZ E AURORA CONTINUAM AQUI... */}
          </Tabs>
        </div>

        {/* BARRA LATERAL DE NAVEGAÇÃO PEDAGÓGICA */}
        <aside className="space-y-6">
          <Card className="shadow-2xl border-none bg-white rounded-[2rem] overflow-hidden sticky top-24">
            <div className="p-5 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest">Roteiro da Trilha</span>
              </div>
              <Badge className="bg-white/20 border-none text-[8px]">{data.modules.length} Capítulos</Badge>
            </div>
            
            <div className="flex flex-col max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-hide">
              {data.modules.map((mod: any, i: number) => (
                <div key={mod.id} className="flex flex-col border-b last:border-0">
                  <button 
                    onClick={() => switchModule(mod.id)} 
                    className={`p-5 text-left transition-all duration-300 ${uiState.activeModuleId === mod.id ? 'bg-accent/5 border-l-4 border-l-accent' : 'hover:bg-muted/20'}`}
                  >
                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">Unidade {i + 1}</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-black truncate max-w-[180px] ${uiState.activeModuleId === mod.id ? 'text-accent italic' : 'text-primary'}`}>{mod.title}</p>
                      <ChevronRight className={`h-3 w-3 transition-transform ${uiState.activeModuleId === mod.id ? 'rotate-90 text-accent' : 'text-primary/20'}`} />
                    </div>
                  </button>
                  
                  {uiState.activeModuleId === mod.id && (
                    <div className="bg-muted/10 p-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                      {data.contents.map((c: any) => (
                        <button 
                          key={c.id} 
                          onClick={() => setUiState(p => ({ ...p, activeContentId: c.id, currentTab: "content" }))} 
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${uiState.activeContentId === c.id ? 'bg-white shadow-md scale-[1.02] border-l-4 border-accent' : 'hover:bg-white/50 opacity-60'}`}
                        >
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${uiState.activeContentId === c.id ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}>
                            {c.type === 'video' ? <Youtube className="h-3 w-3" /> : c.type === 'text' ? <AlignLeft className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                          </div>
                          <span className="text-[9px] font-bold uppercase text-left leading-tight truncate">{c.title}</span>
                        </button>
                      ))}
                      {data.contents.length === 0 && (
                        <p className="text-[8px] font-black uppercase text-center opacity-30 py-4">Aguardando materiais...</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
