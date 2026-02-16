
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  MessageCircle, 
  ChevronLeft, 
  Send,
  Loader2,
  Signal,
  Sparkles
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
        .select(`*, teacher:profiles(name)`)
        .eq('id', liveId)
        .single();

      if (error) {
        toast({ title: "Erro ao carregar live", variant: "destructive" });
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
      <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sintonizando Canal...</p>
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
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Com: {live?.teacher?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge className={`${live?.status === 'live' ? 'bg-red-600 animate-pulse' : 'bg-slate-400'} text-white border-none px-3 font-black text-[10px]`}>
            {live?.status === 'live' ? 'AO VIVO' : 'AGUARDANDO'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-hidden">
          <Card className="aspect-video bg-slate-950 rounded-[2rem] overflow-hidden shadow-2xl border-none relative shrink-0">
            {live?.status === 'live' ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${live?.youtube_id}?autoplay=1&modestbranding=1&rel=0`} 
                frameBorder="0" 
                allowFullScreen 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-10 text-center gap-4">
                <Signal className="h-16 w-16 text-slate-700 animate-pulse" />
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Aguardando Início</h3>
                <p className="text-sm text-slate-400 max-w-xs">Esta transmissão começará em breve. Fique atento ao chat!</p>
              </div>
            )}
          </Card>
          
          <Card className="flex-1 bg-white rounded-[2rem] shadow-xl p-8 border-none overflow-y-auto hidden md:block">
            <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4">Descrição da Aula</h2>
            <p className="text-sm font-medium italic text-primary/80 leading-relaxed">{live?.description}</p>
          </Card>
        </div>

        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col min-h-0">
          <div className="p-6 border-b bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Interação Ao Vivo</span>
            </div>
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          </div>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="flex flex-col gap-4 pb-10">
              {messages.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                  <p className="font-black italic text-[10px] uppercase">Seja o primeiro a interagir!</p>
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
                placeholder="Tirar dúvida ou comentar..."
                className="flex-1 h-10 bg-transparent border-none text-primary font-medium italic focus-visible:ring-0 px-0 text-xs"
              />
              <Button type="submit" disabled={!input.trim()} className="h-10 w-10 bg-primary hover:bg-primary/95 rounded-full shrink-0 shadow-lg">
                <Send className="h-4 w-4 text-white" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
