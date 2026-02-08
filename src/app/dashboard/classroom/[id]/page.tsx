
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  ChevronRight,
  Sparkles,
  Info,
  ExternalLink,
  BookOpen,
  AlignLeft,
  FileSearch,
  MessageCircle,
  HelpCircle
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
        supabase.from('lives').select('id, title, youtube_id').eq('trail_id', trailId).order('created_at', { ascending: false }).limit(1).maybeSingle()
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

        const channel = supabase.channel(`live_chat_${liveRes.data.id}`)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'forum_posts',
            filter: `forum_id=eq.${liveRes.data.id}`
          }, (payload) => {
            setUiState(prev => ({ ...prev, liveMessages: [...prev.liveMessages, payload.new] }));
          })
          .subscribe();

        return () => { supabase.removeChannel(channel); };
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

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [uiState.liveMessages, uiState.currentTab]);

  if (data.loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 animate-in fade-in">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Sincronizando Sala de Aula...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto overflow-hidden">
      {/* HEADER FIXO NO TOPO */}
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

      {/* ÁREA DE CONTEÚDO COM GRID FLEXÍVEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0 overflow-hidden">
        <div className="lg:col-span-3 flex flex-col min-h-0 overflow-hidden">
          <Tabs value={uiState.currentTab} onValueChange={(v) => setUiState(p => ({ ...p, currentTab: v }))} className="w-full flex-1 flex flex-col min-h-0">
            <TabsList className="grid grid-cols-4 h-14 bg-muted/50 p-1 rounded-2xl mb-6 shadow-inner shrink-0">
              <TabsTrigger value="content" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><Layout className="h-3 w-3" /> AULA</TabsTrigger>
              <TabsTrigger value="live" disabled={!data.activeLive} className="rounded-xl gap-2 font-black text-[9px] uppercase data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"><Radio className="h-3 w-3" /> LIVE</TabsTrigger>
              <TabsTrigger value="assessment" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><CheckSquare className="h-3 w-3" /> QUIZ IA</TabsTrigger>
              <TabsTrigger value="aurora" className="rounded-xl gap-2 font-black text-[9px] uppercase transition-all"><Bot className="h-3 w-3" /> AURORA</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 overflow-y-auto scrollbar-hide pb-10 space-y-6">
              {activeContent ? (
                <div className="space-y-6">
                  <Card className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10 ring-8 ring-primary/5 shrink-0">
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
                          <div className="prose prose-slate max-w-none font-medium italic text-muted-foreground whitespace-pre-line leading-relaxed">
                            {activeContent.description}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white bg-primary p-12 text-center">
                        <FileSearch className="h-20 w-20 mb-6 opacity-40 animate-pulse" />
                        <h3 className="text-3xl font-black italic">{activeContent.title}</h3>
                        <Button className="mt-8 bg-accent text-accent-foreground font-black px-8 h-14 rounded-xl shadow-xl" asChild>
                          <a href={activeContent.url} target="_blank" rel="noopener noreferrer">Acessar Material</a>
                        </Button>
                      </div>
                    )}
                  </Card>
                  
                  {activeContent.type !== 'text' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="md:col-span-2 p-8 bg-white rounded-[2.5rem] shadow-xl border-none relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"><Info className="h-5 w-5" /></div>
                          <h3 className="text-2xl font-black text-primary italic leading-none">Guia de Estudo</h3>
                        </div>
                        <p className="text-muted-foreground font-medium italic leading-relaxed whitespace-pre-line text-sm md:text-base">
                          {activeContent.description || "O mentor ainda não disponibilizou o resumo desta aula."}
                        </p>
                      </Card>
                      <Card className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl border-none flex flex-col justify-center">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Recurso Ativo</h4>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                            {activeContent.type === 'video' ? <Youtube className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black italic truncate">{activeContent.title}</p>
                            <p className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">{activeContent.type}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white text-[9px] font-black uppercase h-12 rounded-xl" asChild>
                          <a href={activeContent.url} target="_blank" rel="noopener noreferrer">Link Direto</a>
                        </Button>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-4 border-dashed rounded-[3rem] bg-muted/5 opacity-40">
                  <PlayCircle className="h-16 w-16 mb-4" />
                  <p className="font-black italic text-xl text-primary">Selecione uma aula no menu lateral</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="live" className="flex-1 flex flex-col min-h-0">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="xl:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
                  <Card className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-red-600/20 relative shrink-0">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${data.activeLive?.youtube_id}?autoplay=1&modestbranding=1`} 
                      frameBorder="0" 
                      allowFullScreen 
                    />
                    <div className="absolute top-4 left-4"><Badge className="bg-red-600 text-white font-black animate-pulse border-none px-4 py-1.5 rounded-xl">AO VIVO</Badge></div>
                  </Card>
                  <Card className="p-8 bg-white rounded-[2.5rem] shadow-xl border-none">
                    <h2 className="text-2xl font-black text-primary italic mb-2">{data.activeLive?.title}</h2>
                    <p className="text-muted-foreground font-medium italic">Interaja com o mentor em tempo real enviando suas dúvidas no chat ao lado.</p>
                  </Card>
                </div>

                <Card className="flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-0 border-none">
                  <div className="p-6 bg-muted/30 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Chat da Rede</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black">{uiState.liveMessages.length} msgs</Badge>
                  </div>
                  
                  <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="flex flex-col gap-4">
                      {uiState.liveMessages.map((msg, i) => (
                        <div key={i} className={`p-4 rounded-2xl text-xs shadow-sm border-l-4 ${msg.is_question ? 'bg-amber-50 border-amber-500' : 'bg-muted/30 border-primary/10'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-primary uppercase text-[9px]">{msg.author_name}</span>
                            {msg.is_question && <Badge className="bg-amber-500 text-white border-none text-[7px] h-4">DÚVIDA</Badge>}
                          </div>
                          <p className="font-medium text-slate-700 leading-relaxed italic">"{msg.content}"</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-6 bg-muted/5 border-t">
                    <form onSubmit={handleSendLiveMessage} className="space-y-4">
                      <div className="flex items-center space-x-2 px-2">
                        <Checkbox 
                          id="isQuestion" 
                          checked={uiState.isQuestion} 
                          onCheckedChange={(v) => setUiState(p => ({ ...p, isQuestion: !!v }))} 
                          className="border-amber-500 data-[state=checked]:bg-amber-500"
                        />
                        <Label htmlFor="isQuestion" className="text-[10px] font-black uppercase text-amber-600 cursor-pointer flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" /> É dúvida?
                        </Label>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-1.5 pl-4 rounded-full shadow-lg border">
                        <Input 
                          value={uiState.liveInput}
                          onChange={(e) => setUiState(p => ({ ...p, liveInput: e.target.value }))}
                          placeholder="Falar com a rede..."
                          className="border-none shadow-none focus-visible:ring-0 text-xs font-bold italic h-10"
                        />
                        <Button type="submit" size="icon" disabled={uiState.isSendingLive} className="rounded-full bg-primary hover:bg-primary/95 shadow-xl h-10 w-10 shrink-0">
                          {uiState.isSendingLive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* SIDEBAR DE MÓDULOS COM SCROLL INDEPENDENTE */}
        <aside className="hidden lg:block min-h-0 overflow-hidden h-full">
          <Card className="h-full flex flex-col shadow-2xl border-none bg-white rounded-[2rem] overflow-hidden">
            <div className="p-5 bg-primary text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest">Roteiro</span>
              </div>
              <Badge className="bg-white/20 border-none text-[8px]">{data.modules.length} Unidades</Badge>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
              {data.modules.map((mod: any, i: number) => (
                <div key={mod.id} className="flex flex-col rounded-2xl overflow-hidden mb-2">
                  <button 
                    onClick={() => {
                      if (uiState.activeModuleId !== mod.id) {
                        supabase.from('learning_contents').select('id, title, type, url, description').eq('module_id', mod.id).order('created_at', { ascending: true })
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
                            {c.type === 'video' ? <Youtube className="h-3 w-3" /> : c.type === 'text' ? <AlignLeft className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
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
