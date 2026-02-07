
"use client";

import { useState, useEffect, useRef } from "react";
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
  Users,
  Lightbulb,
  Youtube
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
  const router = useRouter();

  const [trail, setTrail] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [activeLive, setActiveLive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeContentId, setActiveContentId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("content");
  
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [liveChatInput, setLiveChatInput] = useState("");
  const liveScrollRef = useRef<HTMLDivElement>(null);

  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const auroraScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const { data: trailData } = await supabase.from('learning_trails').select('*').eq('id', trailId).single();
        setTrail(trailData);

        const { data: modulesData } = await supabase.from('learning_modules').select('*').eq('trail_id', trailId).order('order_index', { ascending: true });
        setModules(modulesData || []);

        const { data: progData } = await supabase.from('user_progress').select('*').eq('user_id', user.id).eq('trail_id', trailId).single();
        setProgress(progData);

        const { data: liveData } = await supabase.from('lives').select('*').eq('trail_id', trailId).order('created_at', { ascending: false }).limit(1).maybeSingle();
        setActiveLive(liveData);

        if (liveData) {
          const { data: msgs } = await supabase.from('forum_posts').select('*').eq('forum_id', liveData.id).order('created_at', { ascending: true });
          setLiveMessages(msgs || []);

          const channel = supabase.channel(`live_chat_${liveData.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_posts', filter: `forum_id=eq.${liveData.id}` }, 
            (payload) => { setLiveMessages(prev => [...prev, payload.new]); })
            .subscribe();
          return () => { supabase.removeChannel(channel); };
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadData();
  }, [user, trailId]);

  useEffect(() => {
    async function loadContents() {
      if (!activeModuleId) return;
      const { data } = await supabase.from('learning_contents').select('*').eq('module_id', activeModuleId).order('created_at', { ascending: true });
      setContents(data || []);
    }
    loadContents();
  }, [activeModuleId]);

  useEffect(() => {
    if (modules.length > 0 && !activeModuleId) setActiveModuleId(modules[0].id);
  }, [modules, activeModuleId]);

  useEffect(() => {
    if (contents.length > 0 && !activeContentId) setActiveContentId(contents[0].id);
  }, [contents, activeContentId]);

  const handleSendLiveMessage = async (isQuestion: boolean = false) => {
    if (!liveChatInput.trim() || !user || !activeLive) return;

    const { error } = await supabase.from('forum_posts').insert({
      forum_id: activeLive.id,
      content: liveChatInput,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || "Estudante",
      is_question: isQuestion,
      created_at: new Date().toISOString()
    });

    if (!error) {
      setLiveChatInput("");
      if (isQuestion) toast({ title: "Pergunta Enviada!", description: "Sua dúvida foi enviada para o painel do professor." });
    }
  };

  const handleSendMessageAurora = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userText }]);
    setChatInput("");
    setIsAiLoading(true);
    try {
      const result = await conceptExplanationAssistant({ query: userText, history: chatMessages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content })) });
      if (result?.response) setChatMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (err) { toast({ title: "Aurora ocupada", variant: "destructive" }); } finally { setIsAiLoading(false); }
  };

  useEffect(() => {
    if (liveScrollRef.current) {
      const viewport = liveScrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  }, [liveMessages]);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-10 w-10 shrink-0">
            <Link href="/dashboard/trails"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-primary italic leading-none truncate">{trail?.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-accent text-accent-foreground text-[8px] font-black uppercase px-2 h-4">{trail?.category}</Badge>
              {activeLive && (
                <Badge className="bg-red-600 text-white text-[8px] font-black uppercase px-2 h-4 animate-pulse flex items-center gap-1">
                  <Radio className="h-2 w-2" /> TRANSMISSÃO ATIVA
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 w-full lg:w-64 shrink-0">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Progresso
              </span>
              <span className="text-sm font-black text-accent italic">{progress?.percentage || 0}%</span>
            </div>
            <Progress value={progress?.percentage || 0} className="h-2 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="flex w-full h-16 bg-muted/50 p-1.5 rounded-[1.5rem] mb-6">
              <TabsTrigger value="content" className="rounded-xl gap-2 font-black uppercase text-[10px] data-[state=active]:bg-white shadow-sm flex-1">
                <Layout className="h-4 w-4" /> Material
              </TabsTrigger>
              {activeLive && (
                <TabsTrigger value="live" className="rounded-xl gap-2 font-black uppercase text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white shadow-sm flex-1">
                  <Radio className="h-4 w-4" /> Live Room
                </TabsTrigger>
              )}
              <TabsTrigger value="assessment" className="rounded-xl gap-2 font-black uppercase text-[10px] data-[state=active]:bg-white shadow-sm flex-1">
                <CheckSquare className="h-4 w-4" /> Quiz IA
              </TabsTrigger>
              <TabsTrigger value="aurora" className="rounded-xl gap-2 font-black uppercase text-[10px] data-[state=active]:bg-white shadow-sm flex-1">
                <Bot className="h-4 w-4" /> Aurora IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-primary/5">
                {contents.find(c => c.id === activeContentId)?.type === 'video' ? (
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${contents.find(c => c.id === activeContentId)?.url.split('v=')[1] || 'rfscVS0vtbw'}`} frameBorder="0" allowFullScreen />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white bg-primary p-12 text-center">
                    <FileText className="h-16 w-16 mb-4 opacity-40" />
                    <h3 className="text-2xl font-black italic">{contents.find(c => c.id === activeContentId)?.title || "Selecione uma aula"}</h3>
                  </div>
                )}
              </div>
              <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white">
                <h3 className="text-2xl font-black text-primary italic mb-4">{contents.find(c => c.id === activeContentId)?.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium text-lg italic whitespace-pre-wrap">{contents.find(c => c.id === activeContentId)?.description || "Material oficial monitorado."}</p>
              </Card>
            </TabsContent>

            <TabsContent value="live" className="animate-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-red-600/20">
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${activeLive?.youtube_id || 'rfscVS0vtbw'}?autoplay=1`} frameBorder="0" allowFullScreen />
                </div>
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col h-[500px] xl:h-auto">
                  <div className="p-4 bg-red-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Chat da Turma</span>
                    </div>
                    <Badge className="bg-white/20 text-white border-none text-[8px]">{liveMessages.length}</Badge>
                  </div>
                  <ScrollArea className="flex-1 p-4" ref={liveScrollRef}>
                    <div className="flex flex-col gap-4">
                      {liveMessages.map((msg, i) => (
                        <div key={i} className={`flex flex-col gap-1 ${msg.is_question ? 'bg-amber-50 p-2 rounded-xl border border-amber-200' : ''}`}>
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[8px] font-black text-primary/40 uppercase">{msg.author_name}</span>
                            {msg.is_question && <Badge className="bg-amber-500 text-white border-none text-[6px] font-black px-1.5 h-3">PERGUNTA</Badge>}
                          </div>
                          <div className={`px-4 py-2 rounded-2xl text-xs font-medium ${msg.author_id === user?.id ? (msg.is_question ? 'bg-amber-500 text-white' : 'bg-primary text-white ml-4') : 'bg-muted/30 text-primary mr-4'}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t bg-muted/5 space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Comentar na aula..." 
                        className="rounded-xl h-10 text-xs italic" 
                        value={liveChatInput} 
                        onChange={(e) => setLiveChatInput(e.target.value)} 
                      />
                      <Button onClick={() => handleSendLiveMessage(false)} size="icon" className="h-10 w-10 bg-red-600 rounded-xl shrink-0"><Send className="h-4 w-4 text-white" /></Button>
                    </div>
                    <Button onClick={() => handleSendLiveMessage(true)} variant="outline" className="w-full h-10 border-amber-500/50 text-amber-600 hover:bg-amber-500 hover:text-white font-black text-[9px] uppercase gap-2 rounded-xl transition-all">
                      <Lightbulb className="h-3 w-3" /> Fazer Pergunta para o Mentor
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="aurora">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col h-[500px]">
                <div className="p-6 bg-primary text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground"><Bot className="h-6 w-6" /></div>
                    <div><p className="text-sm font-black italic">Aurora IA</p><p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Suporte Pedagógico</p></div>
                  </div>
                  <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <ScrollArea className="flex-1 p-6" ref={auroraScrollRef}>
                  <div className="flex flex-col gap-6">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-accent/10 text-primary border border-accent/20 rounded-tl-none'}`}>{msg.content}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSendMessageAurora} className="p-4 border-t flex gap-2">
                  <Input placeholder="Tire uma dúvida com a IA..." className="rounded-xl h-12 text-sm italic" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                  <Button type="submit" className="h-12 w-12 bg-primary rounded-xl"><Send className="h-5 w-5 text-white" /></Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="shadow-2xl border-none bg-white rounded-[2.5rem] overflow-hidden">
            <div className="p-6 bg-primary text-white flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest">Estrutura da Trilha</span>
              <Badge className="bg-white/20 text-white border-none text-[8px]">{modules.length} Módulos</Badge>
            </div>
            <div className="flex flex-col">
              {modules.map((mod, i) => (
                <button key={mod.id} onClick={() => { setActiveModuleId(mod.id); setActiveContentId(null); }}
                  className={`p-6 text-left border-b last:border-0 transition-all ${activeModuleId === mod.id ? 'bg-accent/10 border-l-8 border-l-accent' : 'hover:bg-muted/30'}`}>
                  <p className="text-[8px] font-black uppercase tracking-tighter opacity-40 mb-1">Módulo {i + 1}</p>
                  <p className={`text-sm font-black truncate ${activeModuleId === mod.id ? 'text-accent italic' : 'text-primary'}`}>{mod.title}</p>
                </button>
              ))}
            </div>
          </Card>

          {activeModuleId && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 px-4">Conteúdo do Módulo</p>
              <div className="grid gap-2">
                {contents.map((c) => (
                  <button key={c.id} onClick={() => setActiveContentId(c.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${activeContentId === c.id ? 'bg-white border-accent shadow-xl text-primary' : 'bg-white/50 border-transparent hover:border-muted-foreground/20 text-muted-foreground'}`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${activeContentId === c.id ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}>
                      {c.type === 'video' ? <Youtube className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <span className="text-[11px] font-black uppercase text-left leading-tight truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
