
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageCircle, 
  Lightbulb, 
  Signal, 
  ChevronLeft, 
  Zap, 
  Clock, 
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function TeacherLiveStudioPage() {
  const params = useParams();
  const liveId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [live, setLive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "questions">("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !liveId) return;
      setLoading(true);
      try {
        const { data: liveData } = await supabase.from('lives').select('*').eq('id', liveId).single();
        setLive(liveData);

        const { data: msgs } = await supabase.from('forum_posts').select('*').eq('forum_id', liveId).order('created_at', { ascending: true });
        setMessages(msgs || []);

        const channel = supabase.channel(`studio_chat_${liveId}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_posts', filter: `forum_id=eq.${liveId}` }, 
          (payload) => { setMessages(prev => [...prev, payload.new]); })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'forum_posts', filter: `forum_id=eq.${liveId}` }, 
          (payload) => { setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m)); })
          .subscribe();
        return () => { supabase.removeChannel(channel); };
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadData();
  }, [user, liveId]);

  const markAsAnswered = async (msgId: string) => {
    const { error } = await supabase.from('forum_posts').update({ is_answered: true }).eq('id', msgId);
    if (!error) toast({ title: "Dúvida Marcada como Respondida" });
  };

  const filteredMessages = activeTab === 'all' ? messages : messages.filter(m => m.is_question);
  const questionCount = messages.filter(m => m.is_question && !m.is_answered).length;

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-red-600" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-primary p-6 rounded-3xl text-white shadow-2xl border-b-4 border-red-600">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10 rounded-full"><ChevronLeft className="h-6 w-6" /></Button>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{live?.title}</h1>
            <p className="text-[10px] font-bold text-white/60 tracking-widest mt-1 uppercase">Monitoramento de Estúdio • Signal: 100%</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-accent uppercase">Espectadores</span>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              <span className="text-xl font-black tabular-nums">42</span>
            </div>
          </div>
          <Badge className="bg-red-600 text-white font-black animate-pulse border-none px-4 py-1.5 rounded-xl flex items-center gap-2">
            <Signal className="h-3 w-3" /> ON AIR
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <Card className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/5 relative group">
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${live?.youtube_id}?autoplay=1&mute=1`} frameBorder="0" allowFullScreen />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge className="bg-black/60 backdrop-blur-md text-white border-none font-bold">Preview do Estúdio</Badge>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center">
              <Zap className="h-6 w-6 text-accent mb-2" />
              <p className="text-[8px] font-black uppercase text-muted-foreground">Engajamento</p>
              <p className="text-xl font-black text-primary">Alto</p>
            </Card>
            <Card className="bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center border-2 border-amber-100">
              <Lightbulb className="h-6 w-6 text-amber-500 mb-2" />
              <p className="text-[8px] font-black uppercase text-muted-foreground">Perguntas Pendentes</p>
              <p className="text-xl font-black text-amber-600 tabular-nums">{questionCount}</p>
            </Card>
            <Card className="bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center">
              <Clock className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-[8px] font-black uppercase text-muted-foreground">Tempo de Live</p>
              <p className="text-xl font-black text-primary tabular-nums">14:20</p>
            </Card>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col h-full relative">
          <div className="flex flex-col h-full">
            <div className="p-4 bg-muted/30 border-b flex items-center justify-between shrink-0">
              <div className="flex bg-white p-1 rounded-xl shadow-sm">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                >Chat Geral</button>
                <button 
                  onClick={() => setActiveTab('questions')}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'questions' ? 'bg-amber-500 text-white' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  Perguntas
                  {questionCount > 0 && <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />}
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="flex flex-col gap-4">
                {filteredMessages.map((msg, i) => (
                  <div key={i} className={`group flex flex-col gap-1.5 p-4 rounded-2xl transition-all ${msg.is_question ? (msg.is_answered ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-200 shadow-sm') : 'bg-muted/20'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">{msg.author_name}</span>
                        {msg.is_question && <Badge className={`${msg.is_answered ? 'bg-green-500' : 'bg-amber-500'} text-white border-none text-[6px] font-black h-3 px-1.5`}>{msg.is_answered ? 'RESPONDIDA' : 'PERGUNTA'}</Badge>}
                      </div>
                      {msg.is_question && !msg.is_answered && (
                        <Button 
                          onClick={() => markAsAnswered(msg.id)}
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 rounded-full text-amber-600 hover:bg-amber-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${msg.is_question && !msg.is_answered ? 'text-amber-900 font-bold' : 'text-primary'}`}>{msg.content}</p>
                  </div>
                ))}
                {filteredMessages.length === 0 && (
                  <div className="py-20 text-center opacity-30 flex flex-col items-center">
                    <MessageCircle className="h-10 w-10 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma interação no momento</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 bg-muted/5 border-t shrink-0">
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-lg border border-muted/20">
                <Input placeholder="Responder no chat..." className="flex-1 border-none shadow-none text-xs font-bold italic" />
                <Button size="icon" className="h-10 w-10 bg-primary rounded-xl shrink-0"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
