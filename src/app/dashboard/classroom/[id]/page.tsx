
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Layout, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  ChevronLeft, 
  Play, 
  Loader2, 
  Youtube, 
  Sparkles, 
  CheckCircle2, 
  Send,
  Bot,
  ArrowRight,
  ArrowLeft,
  ClipboardCheck,
  TrendingUp,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { conceptExplanationAssistant } from "@/ai/flows/concept-explanation-assistant";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function ClassroomPage() {
  const params = useParams();
  const trailId = params.id as string;
  const isDemo = trailId.startsWith("ex-");
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [trail, setTrail] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("content");
  
  const [classProgress, setClassProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || isDemo) return;
      setLoading(true);
      try {
        const { data: trailData } = await supabase.from('learning_trails').select('*').eq('id', trailId).single();
        setTrail(trailData);

        const { data: modulesData } = await supabase.from('learning_modules').select('*').eq('trail_id', trailId).order('order', { ascending: true });
        setModules(modulesData || []);

        const { data: progData } = await supabase.from('user_progress').select('*').eq('user_id', user.id).eq('trail_id', trailId).single();
        setProgress(progData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, trailId, isDemo]);

  useEffect(() => {
    async function loadContents() {
      if (!activeModuleId || isDemo) return;
      const { data } = await supabase.from('learning_contents').select('*').eq('module_id', activeModuleId).order('order', { ascending: true });
      setContents(data || []);
    }
    loadContents();
  }, [activeModuleId, isDemo]);

  useEffect(() => {
    if (modules.length > 0 && !activeModuleId) {
      setActiveModuleId(modules[0].id);
    }
  }, [modules, activeModuleId]);

  useEffect(() => {
    if (contents.length > 0 && !activeContentId) {
      setActiveContentId(contents[0].id);
    }
  }, [contents, activeContentId]);

  const activeContentIndex = contents.findIndex(c => c.id === activeContentId);
  const activeContent = contents[activeContentIndex];
  const activeModule = modules.find((m: any) => m.id === activeModuleId);

  useEffect(() => {
    setClassProgress(0);
    setCurrentTime(0);
    setVideoDuration(0);
    setShowResults(false);
    setQuizAnswers({});
    if (activeContent?.type === 'quiz') {
      setCurrentTab("assessment");
    } else {
      setCurrentTab("content");
    }
  }, [activeContentId, activeContent?.type]);

  const videoId = useMemo(() => {
    if (!activeContent?.url) return null;
    const url = activeContent.url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [activeContent]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const startTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          const progress = Math.round((time / duration) * 100);
          setCurrentTime(time);
          setVideoDuration(duration);
          setClassProgress(prev => Math.max(prev, progress));
        }
      }
    }, 1000);
  };

  const stopTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const initYTPlayer = () => {
    if (activeContent?.type === 'video' && videoId && window.YT && window.YT.Player) {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch(e) {}
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              startTracking();
            } else {
              stopTracking();
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    if (activeContent?.type === 'video' && videoId) {
      if (window.YT && window.YT.Player) {
        initYTPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initYTPlayer;
      }
    }
  }, [activeContentId, videoId]);

  const handleCompleteActivity = async () => {
    if (!activeContentId || !user || isDemo || !trail) return;

    const isAlreadyCompleted = progress?.completed_contents?.includes(activeContentId);
    if (isAlreadyCompleted) {
      toast({ title: "Aula já concluída" });
      return;
    }

    const currentCompleted = progress?.completed_contents || [];
    const newCompletedList = [...currentCompleted, activeContentId];
    const totalContents = trail.total_contents || 1;
    const newPercentage = Math.min(Math.round((newCompletedList.length / totalContents) * 100), 100);

    const { data, error } = await supabase.from('user_progress').upsert({
      user_id: user.id,
      trail_id: trailId,
      trail_title: trail.title,
      last_accessed_content_id: activeContentId,
      last_accessed_at: new Date().toISOString(),
      completed_contents: newCompletedList,
      percentage: newPercentage
    }, { onConflict: 'user_id,trail_id' }).select().single();

    if (!error) {
      setProgress(data);
      toast({ title: "Progresso Salvo! 🎉" });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userText }]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const context = `Aula: ${activeContent?.title}\nResumo do Professor: ${activeContent?.description || 'Nenhuma descrição fornecida.'}`;
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
      toast({ title: "Aurora está ocupada", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinishQuiz = async () => {
    if (!activeContent?.questions) return;
    const correctCount = activeContent.questions.filter((q: any, i: number) => q.correctIndex === quizAnswers[i]).length;
    setShowResults(true);

    if (user && !isDemo) {
      await supabase.from('quiz_submissions').insert({
        user_id: user.id,
        student_name: user.user_metadata?.full_name || "Estudante",
        trail_id: trailId,
        module_id: activeModuleId,
        content_id: activeContentId,
        score: correctCount,
        total: activeContent.questions.length,
        timestamp: new Date().toISOString()
      });
      handleCompleteActivity();
    }
  };

  const goToNextLesson = () => {
    if (activeContentIndex < contents.length - 1) {
      setActiveContentId(contents[activeContentIndex + 1].id);
    } else {
      toast({ title: "Fim do Módulo!" });
    }
  };

  const goToPrevLesson = () => {
    if (activeContentIndex > 0) {
      setActiveContentId(contents[activeContentIndex - 1].id);
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

  const currentPercentage = progress?.percentage || 0;
  const isCurrentCompleted = progress?.completed_contents?.includes(activeContentId);
  const canGoNext = isCurrentCompleted || activeContent?.type === 'text' || (activeContent?.type === 'video' && classProgress >= 70);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6 animate-in fade-in duration-700 pb-safe overflow-x-hidden">
      <div className="bg-white/50 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-sm border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-10 w-10 shrink-0 transition-all active:scale-90">
            <Link href="/dashboard/trails"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black text-primary italic leading-none truncate">{trail?.title}</h1>
            <p className="text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 truncate">
              {activeModule?.title || "Carregando..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full lg:w-64 shrink-0">
          <div className="flex-1 space-y-1 md:space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[8px] md:text-[10px] font-black uppercase text-primary/40 tracking-widest flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Progresso
              </span>
              <span className="text-xs md:text-sm font-black text-accent italic">{currentPercentage}%</span>
            </div>
            <Progress value={currentPercentage} className="h-1.5 md:h-2 rounded-full overflow-hidden" />
          </div>
          <Badge className="bg-green-100 text-green-700 border-none font-black text-[9px] px-3 h-6 flex items-center">{progress?.completed_contents?.length || 0}/{trail?.total_contents || "?"}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/5 group animate-in zoom-in-95 duration-700">
            {activeContent?.type === 'video' && videoId ? (
              <div id="youtube-player" className="w-full h-full" />
            ) : activeContent?.type === 'quiz' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-primary p-6 md:p-12 text-center overflow-auto animate-in fade-in duration-500">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-accent flex items-center justify-center mb-4 md:mb-6 shadow-2xl animate-bounce">
                  <ClipboardCheck className="h-8 w-8 md:h-10 md:w-10 text-accent-foreground" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black italic mb-2">Simulado IA</h3>
                <p className="text-white/60 text-xs md:text-sm max-w-md">Avaliação sobre {activeModule?.title}.</p>
                <Button onClick={() => setCurrentTab("assessment")} className="mt-6 md:mt-8 bg-accent text-accent-foreground font-black rounded-xl px-8 md:px-10 transition-all active:scale-95">Começar</Button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-primary/90 p-6 md:p-12 text-center animate-in fade-in duration-500">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/10 flex items-center justify-center mb-4 md:mb-6">
                  <FileText className="h-8 w-8 md:h-10 md:w-10 opacity-40" />
                </div>
                <h3 className="text-lg md:text-xl font-black italic">{activeContent?.title || "Selecione uma aula"}</h3>
                <p className="text-white/40 text-[10px] md:text-sm mt-2 max-w-xs italic">Material disponível.</p>
              </div>
            )}
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="flex w-full min-w-max md:grid md:grid-cols-4 h-14 md:h-16 bg-muted/50 p-1.5 rounded-2xl md:rounded-[1.5rem] animate-in slide-in-from-bottom-2 duration-500">
                <TabsTrigger value="content" className="rounded-xl gap-2 font-black uppercase text-[8px] md:text-[10px] data-[state=active]:bg-white shadow-sm flex-1 px-4 md:px-0"><Layout className="h-3 w-3 md:h-4 md:w-4" /> Resumo</TabsTrigger>
                <TabsTrigger value="assessment" className="rounded-xl gap-2 font-black uppercase text-[8px] md:text-[10px] data-[state=active]:bg-white shadow-sm flex-1 px-4 md:px-0"><CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> Quiz IA</TabsTrigger>
                <TabsTrigger value="chat" className="rounded-xl gap-2 font-black uppercase text-[8px] md:text-[10px] data-[state=active]:bg-white shadow-sm flex-1 px-4 md:px-0"><MessageSquare className="h-3 w-3 md:h-4 md:w-4" /> Aurora IA</TabsTrigger>
                <TabsTrigger value="materials" className="rounded-xl gap-2 font-black uppercase text-[8px] md:text-[10px] data-[state=active]:bg-white shadow-sm flex-1 px-4 md:px-0"><FileText className="h-3 w-3 md:h-4 md:w-4" /> Materiais</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="content" className="mt-4 md:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-xl rounded-3xl p-6 md:p-10 bg-white min-h-[300px] md:min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <Badge className="bg-accent text-accent-foreground font-black px-3 py-1 italic animate-pulse text-[10px]">Aula Digital</Badge>
                  {isCurrentCompleted && (
                    <Badge className="bg-green-100 text-green-700 border-none font-black px-3 py-1 flex items-center gap-2 animate-in zoom-in duration-300 text-[10px]">
                      <CheckCircle2 className="h-3 w-3" /> CONCLUÍDA
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black text-primary italic mb-4 md:mb-6">{activeContent?.title}</h3>
                
                <div className="flex-1">
                  <p className="text-muted-foreground leading-relaxed font-medium text-base md:text-lg whitespace-pre-wrap italic">
                    {activeContent?.description || "Esta aula faz parte da trilha oficial monitorada."}
                  </p>
                </div>

                <div className="mt-8 md:mt-12 pt-6 md:pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                  <div className="flex w-full md:w-auto gap-2">
                    <Button variant="outline" onClick={goToPrevLesson} disabled={activeContentIndex === 0} className="flex-1 md:flex-none rounded-xl h-12 md:h-14 px-4 md:px-8 font-bold gap-2 md:gap-3 transition-all active:scale-95 text-xs md:text-base">
                      <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" /> Anterior
                    </Button>
                  </div>

                  {!isCurrentCompleted && activeContent?.type !== 'quiz' && (
                    <div className="flex-1 max-w-md w-full px-2 space-y-2 md:space-y-3">
                      <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase text-muted-foreground">
                        <span>Progresso Aula</span>
                        <span className="text-accent">{classProgress}%</span>
                      </div>
                      <Progress value={classProgress} className="h-1 md:h-1.5 overflow-hidden" />
                    </div>
                  )}

                  <div className="flex w-full md:w-auto gap-2">
                    {!isCurrentCompleted && activeContent?.type !== 'quiz' && (
                      <Button onClick={handleCompleteActivity} disabled={activeContent?.type === 'video' && classProgress < 70} className="flex-1 md:flex-none bg-primary text-white font-black h-12 md:h-14 px-4 md:px-10 rounded-xl shadow-xl transition-all active:scale-95 text-xs md:text-base">
                        Concluir
                      </Button>
                    )}
                    <Button onClick={goToNextLesson} disabled={!canGoNext} className={`flex-1 md:flex-none h-12 md:h-14 px-4 md:px-10 rounded-xl font-black text-xs md:text-lg transition-all active:scale-95 ${canGoNext ? 'bg-accent text-accent-foreground shadow-accent/20 shadow-xl' : 'bg-muted text-muted-foreground'}`}>
                      Próxima <ArrowRight className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="mt-4 md:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden flex flex-col h-[400px] md:h-[500px]">
                <div className="p-4 md:p-6 bg-primary text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground shadow-lg"><Bot className="h-5 w-5 md:h-6 md:w-6" /></div>
                    <div>
                      <p className="text-xs md:text-sm font-black italic">Aurora IA</p>
                      <p className="text-[7px] md:text-[8px] font-black uppercase opacity-60 tracking-widest">IA Pedagógica</p>
                    </div>
                  </div>
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent animate-pulse" />
                </div>

                <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
                  <div className="flex flex-col gap-4 md:gap-6">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-6 md:py-10 opacity-30 flex flex-col items-center animate-in fade-in duration-700">
                        <HelpCircle className="h-10 w-10 md:h-12 md:w-12 mb-2" />
                        <p className="text-[10px] md:text-xs font-black italic">Dúvidas?</p>
                        <p className="text-[8px] md:text-[10px] font-medium mt-1">Pergunte agora para a Aurora!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`max-w-[85%] px-4 md:px-5 py-2 md:py-3 rounded-2xl text-[12px] md:text-sm font-medium shadow-sm transition-all ${
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
                        <div className="bg-muted px-4 py-2 md:py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase">Aurora analisando...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-3 md:p-4 border-t bg-muted/5">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Tire uma dúvida..."
                      className="rounded-xl bg-white border-none h-10 md:h-12 shadow-sm italic text-xs transition-all focus:ring-2 focus:ring-accent/50"
                    />
                    <Button type="submit" disabled={!chatInput.trim() || isAiLoading} size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary transition-all active:scale-90">
                      <Send className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </Button>
                  </form>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="mt-4 md:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-xl rounded-3xl p-6 md:p-10 bg-white space-y-6 md:space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-black text-primary italic leading-none">Simulado IA</h3>
                    <p className="text-[10px] md:text-sm text-muted-foreground font-medium">Estilo Vestibular.</p>
                  </div>
                  <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-accent animate-pulse" />
                </div>

                {activeContent?.type === 'quiz' && activeContent.questions ? (
                  <div className="space-y-8 md:space-y-10">
                    {activeContent.questions.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex gap-3 md:gap-4">
                          <span className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] md:text-xs font-black shrink-0 shadow-lg">{qIdx + 1}</span>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-[7px] md:text-[8px] uppercase font-black border-accent text-accent">{q.sourceStyle}</Badge>
                            <p className="font-bold text-primary text-base md:text-lg leading-relaxed italic">{q.question}</p>
                          </div>
                        </div>
                        
                        <div className="grid gap-2 md:gap-3 pl-10 md:pl-12">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;
                            
                            let className = "justify-start h-auto min-h-[3rem] md:min-h-[3.5rem] py-3 md:py-4 rounded-xl md:rounded-2xl bg-white border-none shadow-sm font-medium transition-all text-left whitespace-normal italic active:scale-[0.98] text-[12px] md:text-sm";
                            
                            if (showResults) {
                              if (isCorrect) className += " bg-green-50 text-green-700 ring-2 ring-green-500";
                              else if (isSelected) className += " bg-red-50 text-red-700 ring-2 ring-red-500";
                              else className += " opacity-50";
                            } else if (isSelected) {
                              className += " bg-primary text-white shadow-lg";
                            } else {
                              className += " hover:bg-muted/50 hover:shadow-md";
                            }

                            return (
                              <Button 
                                key={optIdx} 
                                variant="outline"
                                disabled={showResults}
                                onClick={() => setQuizAnswers({...quizAnswers, [qIdx]: optIdx})}
                                className={className}
                              >
                                <span className={`h-6 w-6 md:h-8 md:w-8 rounded-lg md:rounded-xl flex items-center justify-center mr-3 md:mr-4 text-[10px] md:text-xs shrink-0 ${isSelected ? 'bg-white/20' : 'bg-muted'}`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                {opt}
                              </Button>
                            );
                          })}
                        </div>

                        {showResults && (
                          <div className="ml-10 md:ml-12 p-4 md:p-6 rounded-2xl bg-accent/5 border border-accent/20 animate-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center gap-2 text-accent mb-2">
                              <Sparkles className="h-3 w-3" />
                              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Aurora explica:</span>
                            </div>
                            <p className="text-[12px] md:text-sm font-medium text-primary/80 italic">"{q.explanation}"</p>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="pt-6 border-t flex flex-col items-center gap-4">
                      {!showResults ? (
                        <Button 
                          onClick={handleFinishQuiz} 
                          disabled={Object.keys(quizAnswers).length < activeContent.questions.length}
                          className="h-14 md:h-16 px-8 md:px-12 bg-primary text-white font-black text-sm md:text-lg rounded-2xl shadow-2xl hover:bg-primary/95 transition-all active:scale-95"
                        >
                          Finalizar
                          <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                      ) : (
                        <div className="text-center space-y-4 animate-in zoom-in duration-500">
                          <p className="text-xl md:text-2xl font-black text-primary italic">Score: {
                            activeContent.questions.filter((q: any, i: number) => q.correctIndex === quizAnswers[i]).length
                          }/{activeContent.questions.length}</p>
                          <Button variant="outline" onClick={() => { setShowResults(false); setQuizAnswers({}); }} className="rounded-xl font-bold transition-all active:scale-95 h-10 md:h-12 px-6">Refazer</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 md:py-20 text-center flex flex-col items-center gap-4 opacity-30 animate-in fade-in duration-1000">
                    <CheckSquare className="h-12 w-12 md:h-16 md:w-16" />
                    <p className="font-black italic text-lg md:text-xl">Sem Simulado</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4 duration-700">
          <Card className="shadow-2xl border-none bg-white rounded-3xl overflow-hidden">
            <div className="p-4 md:p-6 bg-primary text-white flex items-center justify-between">
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Módulos</span>
              <Badge className="bg-white/20 text-white border-none text-[8px]">{modules.length}</Badge>
            </div>
            <div className="flex flex-col">
              {modules.sort((a:any,b:any) => a.order - b.order).map((mod: any, i: number) => (
                <button key={mod.id} onClick={() => { setActiveModuleId(mod.id); setActiveContentId(null); }}
                  className={`p-4 md:p-6 text-left border-b last:border-0 transition-all active:scale-[0.98] ${activeModuleId === mod.id ? 'bg-accent/10 border-l-4 md:border-l-8 border-l-accent' : 'hover:bg-muted/30'}`}>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter opacity-40 mb-1">Módulo {i + 1}</p>
                  <p className={`text-xs md:text-sm font-black truncate ${activeModuleId === mod.id ? 'text-accent italic' : 'text-primary'}`}>{mod.title}</p>
                </button>
              ))}
            </div>
          </Card>

          {activeModuleId && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 px-2 flex items-center gap-2">
                <Play className="h-3 w-3" />
                Conteúdo
              </p>
              <div className="grid gap-2">
                {contents.length > 0 ? (
                  contents.map((c: any, index: number) => {
                    const isCompleted = progress?.completed_contents?.includes(c.id);
                    return (
                      <button key={c.id} onClick={() => setActiveContentId(c.id)}
                        className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl transition-all border-2 active:scale-95 duration-300 ${activeContentId === c.id ? 'bg-white border-accent shadow-xl text-primary' : 'bg-white/50 border-transparent hover:border-muted-foreground/20 text-muted-foreground'}`}>
                        <div className={`h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${isCompleted ? 'bg-green-100 text-green-600 rotate-[360deg]' : activeContentId === c.id ? 'bg-accent text-accent-foreground scale-110' : 'bg-muted'}`}>
                          {isCompleted ? <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" /> : 
                           c.type === 'video' ? <Youtube className="h-4 w-4 md:h-5 md:w-5" /> : 
                           c.type === 'quiz' ? <Sparkles className="h-4 w-4 md:h-5 md:w-5" /> :
                           <FileText className="h-4 w-4 md:h-5 md:w-5" />}
                        </div>
                        <span className="text-[10px] md:text-[11px] font-black uppercase text-left leading-tight truncate">{c.title}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center opacity-20 border-2 border-dashed rounded-2xl">
                    <p className="text-[8px] font-black uppercase">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
