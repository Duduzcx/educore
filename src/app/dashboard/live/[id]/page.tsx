
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  ChevronLeft, 
  Send,
  Loader2,
  Signal,
  Sparkles,
  ExternalLink,
  Video,
  User,
  Users
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/app/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function StudentLivePage() {
  const params = useParams();
  const liveId = params.id as string;
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [live, setLive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadLiveData() {
      const { data, error } = await supabase
        .from('lives')
        .select(`*`)
        .eq('id', liveId)
        .single();

      if (error) {
        toast({ title: "Erro ao carregar aula", variant: "destructive" });
        router.push('/dashboard/live');
        return;
      }

      setLive(data);

      const { data: msgs } = await supabase
        .from('live_messages')
        .select('*')
        .eq('live_id', liveId)
        .order('created_at', { ascending: true });

      setMessages(msgs || []);
      setLoading(false);
    }

    loadLiveData();

    const channel = supabase
      .channel(`live:${liveId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_messages', 
        filter: `live_id=eq.${liveId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'lives',
        filter: `id=eq.${liveId}`
      }, (payload) => {
        setLive(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveId, router, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const msgContent = input;
    setInput("");

    const { error } = await supabase
      .from('live_messages')
      .insert({
        live_id: liveId,
        user_id: user.id,
        user_name: profile?.name || user.email?.split('@')[0],
        content: msgContent,
        is_question: msgContent.includes('?')
      });

    if (error) {
      toast({ title: "Erro ao enviar", description: "Tente novamente.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Conectando à Sala de Reunião...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4 animate-in fade-in duration-700 overflow-hidden">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-white/20 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0 hover:bg-primary/5">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-black text-primary italic leading-none truncate">{live?.title}</h1>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Sessão de Mentoria</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge className={`${live?.status === 'live' ? 'bg-red-600 animate-pulse' : 'bg-slate-400'} text-white border-none px-3 font-black text-[10px]`}>
            {live?.status === 'live' ? 'ACONTECENDO AGORA' : 'AGENDADA'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-hidden">
          <Card className="flex-1 bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border-none relative flex items-center justify-center">
            <div className="w-full h-full relative flex flex-col items-center justify-center p-8 text-center gap-8 bg-gradient-to-br from-slate-900 to-black">
               <div className="h-32 w-32 md:h-48 md:w-48 rounded-full bg-accent/10 border-4 border-accent/20 flex items-center justify-center relative shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                  <Video className="h-16 w-16 md:h-24 md:w-24 text-accent" />
                  {live?.status === 'live' && <div className="absolute -bottom-2 right-4 h-8 w-8 bg-green-500 rounded-full border-4 border-slate-950 animate-pulse" />}
               </div>
               
               <div className="space-y-4 max-w-md">
                  <h3 className="text-xl md:text-3xl font-black text-white italic">Acesso à Reunião Externa</h3>
                  <p className="text-sm text-slate-400 font-medium italic">Esta mentoria acontece em uma sala virtual segura do Google Meet ou ferramenta similar.</p>
                  
                  {live?.meeting_url ? (
                    <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-black h-16 px-10 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 group">
                      <a href={live.meeting_url} target="_blank" rel="noopener noreferrer">
                        ENTRAR NA SALA (GOOGLE MEET)
                        <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs font-bold text-slate-500 italic">O mentor ainda não disponibilizou o link da sala.</p>
                    </div>
                  )}
               </div>
            </div>
          </Card>
          
          <Card className="bg-white rounded-[2rem] shadow-xl p-8 border-none hidden md:block shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-accent" />
              <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Sobre esta Mentoria</h2>
            </div>
            <p className="text-sm font-medium italic text-primary/80 leading-relaxed">
              {live?.description || "Esta é uma sessão de apoio pedagógico para tirar dúvidas e acelerar seu progresso acadêmico."}
            </p>
          </Card>
        </div>

        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col min-h-0">
          <div className="p-6 border-b bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Chat da Comunidade</span>
            </div>
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          </div>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="flex flex-col gap-4 pb-10">
              {messages.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                  <p className="font-black italic text-[10px] uppercase">Compartilhe suas dúvidas!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col gap-1 ${msg.user_id === user?.id ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest px-2">{msg.user_name}</span>
                    <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm border ${
                      msg.user_id === user?.id 
                        ? 'bg-primary text-white rounded-tr-none border-primary/5' 
                        : msg.is_question 
                          ? 'bg-accent/10 text-primary border-accent/20 rounded-tl-none' 
                          : 'bg-muted/30 text-primary rounded-tl-none border-muted/10'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-6 bg-muted/5 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-white p-1.5 pl-5 rounded-full shadow-2xl border border-muted/20 focus-within:ring-2 focus-within:ring-accent/30 transition-all">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Participar do debate..."
                className="flex-1 h-10 bg-transparent border-none text-primary font-medium italic focus-visible:ring-0 px-0 text-xs"
              />
              <Button type="submit" disabled={!input.trim()} className="h-10 w-10 bg-primary hover:bg-primary/95 rounded-full shrink-0 shadow-lg transition-transform active:scale-90">
                <Send className="h-4 w-4 text-white" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
