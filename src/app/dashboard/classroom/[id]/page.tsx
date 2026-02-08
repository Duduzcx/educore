
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
  CheckSquare, 
  ChevronLeft, 
  Loader2, 
  Send, 
  Bot, 
  Radio, 
  Youtube, 
  PlayCircle,
  ChevronRight,
  Sparkles,
  BookOpen,
  AlignLeft,
  FileSearch,
  MessageCircle,
  BrainCircuit,
  Trophy
} from "lucide-react";
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
    isQuestion: false,
    isSendingLive: false
  });

  const [quizState, setQuizState] = useState({
    questions: [] as any[],
    currentIdx: 0,
    answers: {} as Record<number, number>,
    isFinished: false,
    score: 0
  });

  const contentScrollRef = useRef<HTMLDivElement>(null);
  const liveScrollRef = useRef<HTMLDivElement>(null);

  const activeContent = useMemo(() => 
    data.contents.find((c: any) => c.id === uiState.activeContentId)
  , [data.contents, uiState.activeContentId]);

  const activeQuiz = useMemo(() => 
    data.contents.find((c: any) => c.type === 'quiz')
  , [data.contents]);

  // RESET SCROLL AO MUDAR DE AULA
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [uiState.activeContentId]);

  useEffect(() => {
    if (activeQuiz && uiState.currentTab === 'assessment') {
      try {
        const questions = JSON.parse(activeQuiz.description);
        setQuizState({
          questions,
          currentIdx: 0,
          answers: {},
          isFinished: false,
          score: 0
        });
      } catch (e) {
        console.error("Erro ao carregar quiz:", e);
      }
    }
  }, [activeQuiz, uiState.currentTab]);

  const loadPageData = useCallback(async () => {
    if (!user || !trailId) return;
    
    try {
      const [trailRes, modulesRes, progressRes, liveRes] = await Promise.all([
        supabase.from('learning_trails').select('id, title, category').eq('id', trailId).single(),
        supabase.from('learning_modules').select('id, title, order_index').eq('trail_id', trailId).order('order_index', { ascending: true }),
        supabase.from('user_progress').select('percentage').eq('user_id', user.id).eq('trail_id', trailId).maybeSingle(),
        supabase.from('lives').select('id, title, youtube_id').eq('trail_id', trailId).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      let initialContents: any[] = [];
      let firstModuleId = modulesRes.data?.[0]?.id;

      if (firstModuleId) {
        const { data: cData } = await supabase.from('learning_contents').select('*').eq('module_id', firstModuleId).order('created_at', { ascending: true });
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

  const handleSendLiveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uiState.liveInput.trim() || !data.activeLive || !user) return;

    setUiState(p => ({ ...p, isSendingLive: true }));
    const { error } = await supabase.from('forum_posts').insert({
      forum_id: data.activeLive.id,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || "Estudante",
      content: uiState.liveInput,
      is_question: uiState.isQuestion,
      created_at: new Date().toISOString()
    });

    if (!error) {
      setUiState(p => ({ ...p, liveInput: "", isQuestion: false, isSendingLive: false }));
    } else {
      toast({ title: "Erro ao enviar", variant: "destructive" });
      setUiState(p => ({ ...p, isSendingLive: false }));
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (quizState.isFinished) return;
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentIdx]: optionIdx }
    }));
  };

  const handleNextQuiz = () => {
    if (quizState.currentIdx < quizState.questions.length - 1) {
      setQuizState(p => ({ ...p, currentIdx: p.currentIdx + 1 }));
    } else {
      let score = 0;
      quizState.questions.forEach((q, i) => {
        if (quizState.answers[i] === q.correctIndex) score++;
      });
      setQuizState(p => ({ ...p, isFinished: true, score }));
      
      if (score === quizState.questions.length && user) {
        supabase.from('user_progress').upsert({
          user_id: user.id,
          trail_id: trailId,
          percentage: 100,
          last_access: new Date().toISOString()
        }).then(() => {
          toast({ title: "Módulo Concluído!", description: "Você alcançou a maestria nesta unidade.", variant: "default" });
        });
      }
    }
  };

  if (data.loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Sincronizando Sala de Aula...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto overflow-hidden">
      <header className="bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0 overflow-hidden">
        <div className="lg:col-span-3 flex flex-col min-h-0 h-full overflow-hidden">
          <Tabs value={uiState.currentTab} onValueChange={(v) => setUiState(p => ({ ...p, currentTab: v }))} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid grid-cols-4 h-14 bg-muted/50 p-1 rounded-2xl mb-6 shadow-inner shrink-0">
              <TabsTrigger value="content" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><Layout className="h-3 w-3" /> AULA</TabsTrigger>
              <TabsTrigger value="live" disabled={!data.activeLive} className="rounded-xl gap-2 font-black text-[9px] uppercase data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"><Radio className="h-3 w-3" /> LIVE</TabsTrigger>
              <TabsTrigger value="assessment" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><CheckSquare className="h-3 w-3" /> QUIZ IA</TabsTrigger>
              <TabsTrigger value="aurora" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><Bot className="h-3 w-3" /> AURORA</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 relative bg-white/30 rounded-[3rem] border-2 border-white/20">
              {/* CONTEÚDO */}
              <TabsContent value="content" className="absolute inset-0 m-0 overflow-y-auto scrollbar-hide pb-10 space-y-6 p-4 md:p-8" ref={contentScrollRef}>
                {activeContent ? (
                  <div className="space-y-6 max-w-5xl mx-auto">
                    {activeContent.type === 'video' ? (
                      <div className="space-y-6">
                        <Card className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 ring-8 ring-primary/5 shrink-0">
                          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${activeContent.url?.includes('v=') ? activeContent.url.split('v=')[1]?.split('&')[0] : activeContent.url?.split('/').pop()}`} frameBorder="0" allowFullScreen />
                        </Card>
                        <Card className="p-8 bg-white rounded-[2.5rem] shadow-xl border-none">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <h3 className="text-2xl font-black text-primary italic">Guia de Estudo</h3>
                          </div>
                          <p className="text-muted-foreground font-medium italic leading-relaxed whitespace-pre-line">{activeContent.description || "O mentor ainda não disponibilizou o resumo."}</p>
                        </Card>
                      </div>
                    ) : activeContent.type === 'text' ? (
                      <Card className="bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border-none min-h-full">
                        <div className="max-w-3xl mx-auto space-y-8">
                          <div className="space-y-2 border-b-4 border-accent pb-6">
                            <Badge className="bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em]">Material de Leitura</Badge>
                            <h2 className="text-3xl md:text-5xl font-black italic text-primary leading-tight">{activeContent.title}</h2>
                          </div>
                          <div className="prose prose-slate max-w-none font-medium text-muted-foreground whitespace-pre-line leading-relaxed text-lg italic">
                            {activeContent.description}
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-white bg-primary rounded-[3rem] p-12 text-center shadow-2xl">
                        <FileSearch className="h-24 w-24 mb-6 opacity-40 animate-pulse" />
                        <h3 className="text-3xl font-black italic">{activeContent.title}</h3>
                        <p className="max-w-md mt-4 opacity-70 font-medium">Este material é um documento oficial. Clique abaixo para abrir o anexo.</p>
                        <Button className="mt-10 bg-accent text-accent-foreground font-black px-10 h-16 rounded-2xl shadow-xl hover:scale-105 transition-all" asChild>
                          <a href={activeContent.url} target="_blank" rel="noopener noreferrer">Acessar Material Externo</a>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 text-primary">
                    <PlayCircle className="h-20 w-20 mb-4 animate-bounce" />
                    <p className="font-black italic text-2xl uppercase tracking-widest">Selecione uma aula no roteiro</p>
                  </div>
                )}
              </TabsContent>

              {/* LIVE TAB */}
              <TabsContent value="live" className="absolute inset-0 m-0 flex flex-col min-h-0 bg-slate-950">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0">
                  <div className="lg:col-span-2 p-4 md:p-8 flex flex-col gap-6">
                    <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/10">
                      <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${data.activeLive?.youtube_id}?autoplay=1`} frameBorder="0" allowFullScreen />
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white">
                      <h2 className="text-xl font-black italic uppercase tracking-tighter">{data.activeLive?.title}</h2>
                      <p className="text-xs opacity-60 mt-1 uppercase tracking-[0.3em] font-bold">Transmissão Oficial ao Vivo</p>
                    </div>
                  </div>
                  <div className="border-l border-white/10 flex flex-col min-h-0 bg-slate-900">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-accent" /><span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Chat da Aula</span></div>
                      <Badge className="bg-red-600 text-white animate-pulse border-none text-[8px]">AO VIVO</Badge>
                    </div>
                    <ScrollArea className="flex-1 p-4" ref={liveScrollRef}>
                      <div className="flex flex-col gap-4">
                        {uiState.liveMessages.map((m, i) => (
                          <div key={i} className={`p-3 rounded-xl border ${m.is_question ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/10 text-white/80'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-50">{m.author_name}</span>
                              {m.is_question && <Badge className="bg-accent text-accent-foreground text-[6px] h-3">DÚVIDA</Badge>}
                            </div>
                            <p className="text-xs font-medium leading-relaxed">{m.content}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 bg-slate-950 border-t border-white/5">
                      <form onSubmit={handleSendLiveMessage} className="flex flex-col gap-2">
                        <Input 
                          placeholder="Fazer uma pergunta..." 
                          value={uiState.liveInput} 
                          onChange={e => setUiState(p => ({ ...p, liveInput: e.target.value }))}
                          className="bg-white/10 border-none text-white text-xs placeholder:text-white/20 h-10 rounded-xl"
                        />
                        <div className="flex items-center justify-between">
                          <button 
                            type="button" 
                            onClick={() => setUiState(p => ({ ...p, isQuestion: !p.isQuestion }))}
                            className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${uiState.isQuestion ? 'bg-accent text-accent-foreground' : 'bg-white/10 text-white/40'}`}
                          >
                            É UMA DÚVIDA?
                          </button>
                          <Button type="submit" disabled={uiState.isSendingLive} size="sm" className="bg-white text-black hover:bg-accent hover:text-white rounded-lg h-8 px-4 font-black text-[9px] uppercase"><Send className="h-3.5 w-3.5 mr-2" /> Enviar</Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* QUIZ TAB OMITIDA PARA CONCISÃO... */}
            </div>
          </Tabs>
        </div>

        <aside className="hidden lg:block min-h-0 overflow-hidden h-full">
          <Card className="h-full flex flex-col shadow-2xl border-none bg-white rounded-[2rem] overflow-hidden">
            <div className="p-5 bg-primary text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-accent" /><span className="text-[10px] font-black uppercase tracking-widest">Roteiro</span></div>
              <Badge className="bg-white/20 border-none text-[8px]">{data.modules.length} Unidades</Badge>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
              {data.modules.map((mod: any, i: number) => (
                <div key={mod.id} className="flex flex-col rounded-2xl overflow-hidden mb-2">
                  <button 
                    onClick={() => {
                      if (uiState.activeModuleId !== mod.id) {
                        supabase.from('learning_contents').select('*').eq('module_id', mod.id).order('created_at', { ascending: true })
                          .then(({ data: cData }) => {
                            setUiState(prev => ({ ...prev, activeModuleId: mod.id, activeContentId: cData?.[0]?.id || null, currentTab: "content" }));
                            setData((prev: any) => ({ ...prev, contents: cData || [] }));
                          });
                      }
                    }} 
                    className={`p-4 text-left transition-all duration-300 w-full ${uiState.activeModuleId === mod.id ? 'bg-accent/5 border-l-4 border-l-accent' : 'hover:bg-muted/20'}`}
                  >
                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">Unidade {i + 1}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-black truncate ${uiState.activeModuleId === mod.id ? 'text-accent italic' : 'text-primary'}`}>{mod.title}</p>
                      <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${uiState.activeModuleId === mod.id ? 'rotate-90 text-accent' : 'text-primary/20'}`} />
                    </div>
                  </button>
                  {uiState.activeModuleId === mod.id && (
                    <div className="bg-muted/10 p-2 space-y-1">
                      {data.contents.map((c: any) => (
                        <button 
                          key={c.id} 
                          onClick={() => setUiState(p => ({ ...p, activeContentId: c.id, currentTab: "content" }))} 
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${uiState.activeContentId === c.id ? 'bg-white shadow-md border-l-4 border-accent' : 'hover:bg-white/50 opacity-60'}`}
                        >
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${uiState.activeContentId === c.id ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}>
                            {c.type === 'video' ? <Youtube className="h-3 w-3" /> : c.type === 'quiz' ? <BrainCircuit className="h-3 w-3" /> : <AlignLeft className="h-3 w-3" />}
                          </div>
                          <span className="text-[9px] font-bold uppercase text-left leading-tight truncate">{c.title}</span>
                        </button>
                      ))}
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
