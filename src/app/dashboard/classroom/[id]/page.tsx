"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Sparkles, 
  Send,
  Bot,
  TrendingUp,
  Radio,
  Lightbulb,
  Youtube,
  MessageCircle,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { conceptExplanationAssistant } from "@/ai/flows/concept-explanation-assistant";
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
    chatInput: "",
    liveInput: "",
    isAiLoading: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // TURBO FETCH: Tudo em uma única rajada de rede
  const loadPageData = useCallback(async () => {
    if (!user || !trailId) return;
    
    const [trailRes, modulesRes, progressRes, liveRes] = await Promise.all([
      supabase.from('learning_trails').select('*').eq('id', trailId).single(),
      supabase.from('learning_modules').select('*').eq('trail_id', trailId).order('order_index', { ascending: true }),
      supabase.from('user_progress').select('*').eq('user_id', user.id).eq('trail_id', trailId).maybeSingle(),
      supabase.from('lives').select('*').eq('trail_id', trailId).order('created_at', { ascending: false }).limit(1).maybeSingle()
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
  }, [user?.id, trailId]);

  useEffect(() => { loadPageData(); }, [loadPageData]);

  // Realtime Otimizado
  useEffect(() => {
    if (!data.activeLive) return;
    const channel = supabase.channel(`live_${data.activeLive.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_posts', filter: `forum_id=eq.${data.activeLive.id}` }, 
      (payload) => setUiState(prev => ({ ...prev, liveMessages: [...prev.liveMessages, payload.new] })))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [data.activeLive?.id]);

  const switchModule = async (moduleId: string) => {
    setUiState(prev => ({ ...prev, activeModuleId: moduleId }));
    const { data: cData } = await supabase.from('learning_contents').select('*').eq('module_id', moduleId).order('created_at', { ascending: true });
    setData(prev => ({ ...prev, contents: cData || [] }));
    if (cData?.length) setUiState(prev => ({ ...prev, activeContentId: cData[0].id }));
  };

  const handleSendLive = async (isQuestion: boolean) => {
    if (!uiState.liveInput.trim() || !user || !data.activeLive) return;
    const msg = uiState.liveInput;
    setUiState(p => ({ ...prev, liveInput: "" }));
    await supabase.from('forum_posts').insert({
      forum_id: data.activeLive.id,
      content: msg,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || "Aluno",
      is_question: isQuestion,
      created_at: new Date().toISOString()
    });
  };

  if (data.loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-10 w-10 text-accent opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Sincronizando Aula...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full"><Link href="/dashboard/trails"><ChevronLeft className="h-5 w-5" /></Link></Button>
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
            <TabsList className="grid grid-cols-4 h-14 bg-muted/50 p-1 rounded-2xl mb-6">
              <TabsTrigger value="content" className="rounded-xl gap-2 font-black text-[9px] uppercase"><Layout className="h-3 w-3" /> AULA</TabsTrigger>
              <TabsTrigger value="live" disabled={!data.activeLive} className="rounded-xl gap-2 font-black text-[9px] uppercase data-[state=active]:bg-red-600 data-[state=active]:text-white"><Radio className="h-3 w-3" /> LIVE</TabsTrigger>
              <TabsTrigger value="assessment" className="rounded-xl gap-2 font-black text-[9px] uppercase"><CheckSquare className="h-3 w-3" /> QUIZ IA</TabsTrigger>
              <TabsTrigger value="aurora" className="rounded-xl gap-2 font-black text-[9px] uppercase"><Bot className="h-3 w-3" /> AURORA</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <Card className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl">
                {data.contents.find(c => c.id === uiState.activeContentId)?.type === 'video' ? (
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${data.contents.find(c => c.id === uiState.activeContentId)?.url.split('v=')[1] || 'rfscVS0vtbw'}`} frameBorder="0" allowFullScreen />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white bg-primary p-12 text-center">
                    <FileText className="h-16 w-16 mb-4 opacity-40" />
                    <h3 className="text-2xl font-black italic">{data.contents.find(c => c.id === uiState.activeContentId)?.title || "Material Pedagógico"}</h3>
                  </div>
                )}
              </Card>
              <Card className="p-8 bg-white rounded-[2.5rem] shadow-xl border-none">
                <h3 className="text-2xl font-black text-primary italic mb-2">{data.contents.find(c => c.id === uiState.activeContentId)?.title}</h3>
                <p className="text-muted-foreground font-medium italic leading-relaxed line-clamp-4">{data.contents.find(c => c.id === uiState.activeContentId)?.description || "Este material foi revisado pela curadoria docente EduCore."}</p>
              </Card>
            </TabsContent>

            <TabsContent value="live" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-red-600/10">
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
                      <div key={i} className={`p-3 rounded-2xl text-xs ${m.is_question ? 'bg-amber-50 border border-amber-200' : 'bg-muted/30'}`}>
                        <p className="text-[8px] font-black text-primary/40 uppercase mb-1">{m.author_name}</p>
                        <p className="font-medium">{m.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Comentar..." value={uiState.liveInput} onChange={e => setUiState(p => ({...p, liveInput: e.target.value}))} className="rounded-xl h-10 text-xs italic" />
                    <Button size="icon" onClick={() => handleSendLive(false)} className="h-10 w-10 bg-primary rounded-xl shrink-0"><Send className="h-4 w-4 text-white" /></Button>
                  </div>
                  <Button onClick={() => handleSendLive(true)} variant="outline" className="w-full h-10 border-2 border-amber-500/50 text-amber-600 font-black text-[9px] uppercase gap-2 rounded-xl">
                    <Lightbulb className="h-3.5 w-3.5" /> Fazer Pergunta
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Card className="shadow-xl border-none bg-white rounded-[2rem] overflow-hidden">
            <div className="p-5 bg-primary text-white flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest">Conteúdo</span>
              <Badge className="bg-white/20 border-none text-[8px]">{data.modules.length} Blocos</Badge>
            </div>
            <div className="flex flex-col">
              {data.modules.map((mod, i) => (
                <button key={mod.id} onClick={() => switchModule(mod.id)} className={`p-5 text-left border-b last:border-0 transition-all ${uiState.activeModuleId === mod.id ? 'bg-accent/5 border-l-4 border-l-accent' : 'hover:bg-muted/20'}`}>
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Módulo {i + 1}</p>
                  <p className={`text-xs font-black truncate ${uiState.activeModuleId === mod.id ? 'text-accent italic' : 'text-primary'}`}>{mod.title}</p>
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-3">
            {data.contents.map((c) => (
              <button key={c.id} onClick={() => setUiState(p => ({ ...p, activeContentId: c.id }))} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border-2 ${uiState.activeContentId === c.id ? 'bg-white border-accent shadow-lg' : 'bg-white/50 border-transparent hover:border-muted/30'}`}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${uiState.activeContentId === c.id ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}>
                  {c.type === 'video' ? <Youtube className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <span className="text-[10px] font-black uppercase text-left leading-tight truncate">{c.title}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
