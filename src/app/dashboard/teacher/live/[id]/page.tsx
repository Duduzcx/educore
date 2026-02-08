
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  MessageCircle, 
  Lightbulb, 
  Signal, 
  ChevronLeft, 
  Zap, 
  Clock, 
  Send,
  CheckCircle2,
  Loader2,
  Trophy,
  ShieldCheck,
  ExternalLink,
  Radio
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

        const { data: msgs } = await supabase
          .from('forum_posts')
          .select('*')
          .eq('forum_id', liveId)
          .order('created_at', { ascending: true });
        setMessages(msgs || []);

        const channel = supabase.channel(`studio_chat_${liveId}`)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'forum_posts',
            filter: `forum_id=eq.${liveId}`
          }, (payload) => {
            setMessages(prev => [...prev, payload.new]);
            if (payload.new.is_question) {
              toast({ title: "Nova Dúvida!", description: `${payload.new.author_name} enviou uma pergunta.` });
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'forum_posts',
            filter: `forum_id=eq.${liveId}`
          }, (payload) => {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, liveId, toast]);

  const markAsAnswered = async (msgId: string) => {
    const { error } = await supabase
      .from('forum_posts')
      .update({ is_answered: true })
      .eq('id', msgId);
    
    if (error) toast({ variant: "destructive", title: "Erro ao atualizar" });
  };

  const filteredMessages = activeTab === 'all' 
    ? messages 
    : messages.filter(m => m.is_question);

  const questionCount = messages.filter(m => m.is_question && !m.is_answered).length;

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [filteredMessages]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-red-600" />
      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Conectando à Control Room...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-slate-950 p-6 rounded-3xl text-white shadow-2xl border-b-4 border-red-600 gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10 rounded-full h-12 w-12">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{live?.title}</h1>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] mt-1 uppercase">Monitoramento Studio Master</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 lg:gap-8">
          <Button className="bg-red-600 hover:bg-red-700 text-white font-black h-12 px-6 rounded-2xl shadow-xl gap-2 transition-all active:scale-95" asChild>
            <a href={`https://studio.youtube.com/video/${live?.youtube_id}/livestreaming`} target="_blank" rel="noopener noreferrer">
              <Radio className="h-4 w-4" /> INICIAR TRANSMISSÃO
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>

          <div className="flex items-center gap-6 border-l border-white/10 pl-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Alunos Online</span>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-black tabular-nums">42</span>
              </div>
            </div>
            <Badge className="bg-red-600 text-white font-black animate-pulse border-none px-6 h-12 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <Signal className="h-4 w-4" /> ON AIR
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <Card className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-800 relative group">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${live?.youtube_id || 'rfscVS0vtbw'}?autoplay=1&mute=1&modestbranding=1`} 
              frameBorder="0" 
              allowFullScreen 
            />
            <div className="absolute top-4 left-4 pointer-events-none">
              <Badge className="bg-black/60 backdrop-blur-md border-none text-[8px] font-black uppercase tracking-widest px-3">Retorno de Sinal (Mudo)</Badge>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-6">
            <Card className="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col items-center justify-center text-center group hover:bg-slate-50 transition-all border-none">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Zap className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Latência</p>
              <p className="text-xl font-black text-slate-900 italic">Baixa</p>
            </Card>
            <Card className={`bg-white p-8 rounded-[2rem] shadow-xl flex flex-col items-center justify-center text-center border-2 transition-all ${questionCount > 0 ? 'border-amber-300 bg-amber-50 shadow-amber-100' : 'border-slate-50'}`}>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 ${questionCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Lightbulb className={`h-6 w-6 ${questionCount > 0 ? 'animate-pulse' : ''}`} />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${questionCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Dúvidas</p>
              <p className={`text-2xl font-black tabular-nums ${questionCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{questionCount}</p>
            </Card>
            <Card className="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col items-center justify-center text-center group hover:bg-slate-50 transition-all border-none">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Moderação</p>
              <p className="text-xl font-black text-slate-900 italic">Ativa</p>
            </Card>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden flex flex-col h-full border-t-8 border-slate-100">
          <div className="p-6 bg-slate-50 border-b flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interação com a Rede</span>
            </div>
            <div className="flex bg-white p-1.5 rounded-2xl shadow-inner border border-slate-200 w-full">
              <button 
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Chat Geral
              </button>
              <button 
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'questions' ? 'bg-amber-500 text-white shadow-lg scale-[1.02]' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Só Perguntas
                {questionCount > 0 && <Badge className="bg-white/20 text-white border-none h-4 min-w-4 text-[8px] flex items-center justify-center p-0">{questionCount}</Badge>}
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6 bg-white" ref={scrollRef}>
            <div className="flex flex-col gap-4 pb-10">
              {filteredMessages.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-black italic text-xs uppercase">Silêncio no estúdio...</p>
                </div>
              ) : (
                filteredMessages.map((msg, i) => (
                  <div 
                    key={msg.id || i} 
                    className={`flex flex-col gap-2 p-5 rounded-[1.5rem] transition-all animate-in slide-in-from-right-2 duration-300 ${
                      msg.is_question 
                        ? (msg.is_answered ? 'bg-slate-50 opacity-40 border-l-4 border-slate-200' : 'bg-amber-50 border-l-4 border-amber-500 shadow-md scale-[1.02]') 
                        : 'bg-slate-50/50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-900 uppercase">{msg.author_name}</span>
                        {msg.is_question && <Badge className="bg-amber-500/10 text-amber-600 border-none text-[7px] font-black h-4">DÚVIDA</Badge>}
                      </div>
                      {msg.is_question && !msg.is_answered && (
                        <Button 
                          onClick={() => markAsAnswered(msg.id)}
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                          title="Marcar como Respondida"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className={`text-xs md:text-sm leading-relaxed ${msg.is_question && !msg.is_answered ? 'text-amber-900 font-bold italic' : 'text-slate-700 font-medium'}`}>
                      {msg.content}
                    </p>
                    <div className="flex justify-end">
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-6 bg-slate-50 border-t mt-auto">
            <div className="flex items-center gap-3 bg-white p-2 pl-6 rounded-full shadow-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900 transition-all">
              <Input placeholder="Escrever para os alunos..." className="border-none shadow-none text-sm font-bold italic h-12 bg-transparent focus-visible:ring-0 px-0" />
              <Button size="icon" className="h-12 w-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full shrink-0 shadow-lg transition-transform active:scale-90">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
