
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
  ArrowRight
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

  useEffect(() => {
    if (!data.activeLive) return;
    const channel = supabase.channel(`live_room_${data.activeLive.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_posts', filter: `forum_id=eq.${data.activeLive.id}` }, 
      (payload) => setUiState(prev => ({ ...prev, liveMessages: [...prev.liveMessages, payload.new] })))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [data.activeLive?.id]);

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

  const handleSendLive = async (isQuestion: boolean) => {
    if (!uiState.liveInput.trim() || !user || !data.activeLive) return;
    const msg = uiState.liveInput;
    
    setUiState(p => ({ ...p, isSendingLive: true }));
    
    const { error } = await supabase.from('forum_posts').insert({
      forum_id: data.activeLive.id,
      content: msg,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || "Aluno",
      is_question: isQuestion,
      created_at: new Date().toISOString()
    });

    if (!error) {
      setUiState(p => ({ ...p, liveInput: "", isSendingLive: false }));
    } else {
      setUiState(p => ({ ...p, isSendingLive: false }));
      toast({ title: "Erro ao enviar", description: "Tente novamente.", variant: "destructive" });
    }
  };

  if (data.loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 animate-in fade-in">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Sincronizando Aula Digital...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:scale-110 transition-transform"><Link href="/dashboard/trails"><ChevronLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-xl font-black text-primary italic leading-none">{data.trail?.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-accent text-accent-foreground text-[8px] font-black uppercase px-2">{data.trail?.category}</Badge>
              {data.activeLive && <Badge className="bg-red-600 text-white text-[8px] font-black animate-pulse">AO VIVO</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-64">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase text-primary/40">
              <span>Progresso</span>
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
                  <Card className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl transform-gpu border-4 border-white/10 ring-8 ring-primary/5">
                    {activeContent.type === 'video' ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${activeContent.url.includes('v=') ? activeContent.url.split('v=')[1]?.split('&')[0] : activeContent.url.split('/').pop()}`} 
                        frameBorder="0" 
                        allowFullScreen 
                      />
                    ) : activeContent.type === 'text' ? (
                      <div className="h-full bg-white p-12 overflow-y-auto">
                        <div className="max-w-3xl mx-auto space-y-6">
                          <div className="flex items-center gap-3 text-accent mb-8">
                            <BookOpen className="h-8 w-8" />
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
                        <FileText className="h-20 w-20 mb-6 opacity-40 animate-pulse" />
                        <h3 className="text-3xl font-black italic relative z-10">{activeContent.title}</h3>
                        <p className="mt-4 text-white/60 font-medium relative z-10 max-w-md italic">Acesse o material completo através do link oficial abaixo.</p>
                        <Button className="mt-8 bg-accent text-accent-foreground font-black px-8 h-12 rounded-xl relative z-10 shadow-xl" asChild>
                          <a href={activeContent.url} target="_blank" rel="noopener noreferrer">Abrir Documento Original</a>
                        </Button>
                      </div>
                    )}
                  </Card>
                  
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

                      <Card className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl border-none">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Material de Apoio</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                              {activeContent.type === 'video' ? <Youtube className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-black italic truncate max-w-[150px]">{activeContent.title}</p>
                              <p className="text-[8px] font-bold opacity-40 uppercase">{activeContent.type}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white text-[9px] font-black uppercase h-10 rounded-xl" asChild>
                            <a href={activeContent.url} target="_blank" rel="noopener noreferrer">Acessar Material</a>
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-32 text-center border-4 border-dashed rounded-[3rem] bg-muted/5 opacity-40">
                  <PlayCircle className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black italic text-xl">Selecione uma aula para começar</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="live" className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="xl:col-span-2 aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-red-600/10 transform-gpu">
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${data.activeLive?.youtube_id || 'rfscVS0vtbw'}?autoplay=1`} frameBorder="0" allowFullScreen />
              </div>
              <Card className="h-[500px] xl:h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-none">
                <div className="p-4 bg-red-600 text-white flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">Chat ao Vivo</span>
                  <Badge className="bg-white/20 border-none text-[8px]">{uiState.liveMessages.length}</Badge>
                </div>
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="flex flex-col gap-3">
                    {uiState.liveMessages.map((m, i) => (
                      <div key={i} className={`p-3 rounded-2xl text-xs animate-in slide-in-from-bottom-2 duration-300 ${m.is_question ? 'bg-amber-50 border border-amber-200' : 'bg-muted/30'}`}>
                        <p className="text-[8px] font-black text-primary/40 uppercase mb-1">{m.author_name}</p>
                        <p className="font-medium">{m.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Comentar..." 
                      value={uiState.liveInput} 
                      onChange={e => setUiState(p => ({...p, liveInput: e.target.value}))} 
                      disabled={uiState.isSendingLive}
                      className="rounded-xl h-10 text-xs italic bg-muted/30 border-none" 
                    />
                    <Button 
                      size="icon" 
                      onClick={() => handleSendLive(false)} 
                      disabled={uiState.isSendingLive || !uiState.liveInput.trim()}
                      className="h-10 w-10 bg-primary rounded-xl shrink-0 transition-transform active:scale-90"
                    >
                      {uiState.isSendingLive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-white" />}
                    </Button>
                  </div>
                  <Button 
                    onClick={() => handleSendLive(true)} 
                    variant="outline" 
                    disabled={uiState.isSendingLive || !uiState.liveInput.trim()}
                    className="w-full h-10 border-2 border-amber-500/50 text-amber-600 font-black text-[9px] uppercase gap-2 rounded-xl hover:bg-amber-50 transition-colors"
                  >
                    <Lightbulb className="h-3.5 w-3.5" /> Fazer Pergunta Especial
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Card className="shadow-xl border-none bg-white rounded-[2rem] overflow-hidden sticky top-24">
            <div className="p-5 bg-primary text-white flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest">Plano de Estudos</span>
              <Badge className="bg-white/20 border-none text-[8px]">{data.modules.length} Capítulos</Badge>
            </div>
            
            <div className="flex flex-col max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-hide">
              {data.modules.map((mod: any, i: number) => (
                <div key={mod.id} className="flex flex-col border-b last:border-0">
                  <button 
                    onClick={() => switchModule(mod.id)} 
                    className={`p-5 text-left transition-all duration-200 ${uiState.activeModuleId === mod.id ? 'bg-accent/5 border-l-4 border-l-accent' : 'hover:bg-muted/20'}`}
                  >
                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">Módulo {i + 1}</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-black truncate ${uiState.activeModuleId === mod.id ? 'text-accent italic' : 'text-primary'}`}>{mod.title}</p>
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
                            {c.type === 'video' ? <Youtube className="h-3 w-3" /> : c.type === 'pdf' ? <FileText className="h-3 w-3" /> : <AlignLeft className="h-3 w-3" />}
                          </div>
                          <span className="text-[9px] font-bold uppercase text-left leading-tight truncate">{c.title}</span>
                        </button>
                      ))}
                      {data.contents.length === 0 && (
                        <p className="text-[8px] font-black uppercase text-center opacity-30 py-2">Sem aulas ainda</p>
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
