
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ChevronLeft, Loader2, MessageSquare, Paperclip, Sparkles, Bot, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface ChatContact {
  name: string;
  expertise: string;
  type: 'teacher' | 'student';
}

export default function DirectChatPage() {
  const params = useParams();
  const contactId = params.id as string;
  const isAurora = contactId === "aurora-ai";
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [input, setInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const contact: ChatContact = isAurora 
    ? { name: "Aurora IA", expertise: "Mentoria Geral & IA", type: 'teacher' } 
    : { name: "Estudante da Rede", expertise: "Dúvidas Gerais", type: 'student' };

  useEffect(() => {
    if (isAurora) {
      setMessages([
        { id: '1', sender_id: 'aurora-ai', message: 'Olá! Como posso te ajudar a acelerar seus estudos hoje?', created_at: new Date().toISOString() }
      ]);
    }
  }, [isAurora]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages, isAiThinking]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !contactId) return;

    const userText = input;
    const newUserMessage = {
      id: new Date().toISOString(),
      sender_id: user.id,
      message: userText,
      created_at: new Date().toISOString(),
    };

    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInput("");

    if (isAurora) {
      setIsAiThinking(true);
      try {
        const history = currentMessages.slice(-6).map(m => ({
          role: (m.sender_id === "aurora-ai" ? 'model' : 'user') as 'user' | 'model',
          content: m.message
        }));

        const response = await fetch('/api/genkit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flowId: 'conceptExplanationAssistant',
            input: {
              query: userText,
              history: history,
            },
          }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.result.response) {
          const aiResponseMessage = {
            id: new Date().toISOString() + '-ai',
            sender_id: "aurora-ai",
            message: result.result.response,
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, aiResponseMessage]);
        } else {
          throw new Error(result.error || 'Resposta da IA em formato inesperado.');
        }

      } catch (err: any) {
        console.error("Erro ao chamar a IA:", err);
        toast({ title: "Aurora está ocupada", description: "Tente novamente em instantes.", variant: "destructive" });
      } finally {
        setIsAiThinking(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col flex-1 min-h-0 animate-in fade-in duration-500 overflow-hidden space-y-4 w-full">
        <div className="flex items-center justify-between px-2 py-2 shrink-0 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
        <div className="flex items-center gap-2 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0 hover:bg-primary/5 active:scale-90 transition-all">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Button>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <Avatar className={`h-10 w-10 md:h-12 md:w-12 border-2 shadow-lg transition-transform duration-500 hover:scale-110 ${isAurora ? 'bg-accent border-white' : 'border-primary/10'}`}>
                {isAurora ? (
                  <div className="h-full w-full flex items-center justify-center text-accent-foreground animate-in zoom-in duration-500"><Bot className="h-6 w-6" /></div>
                ) : (
                  <>
                    <AvatarImage src={`https://picsum.photos/seed/${contactId}/100/100`} />
                    <AvatarFallback className="bg-primary text-white font-black italic">{contact?.name?.charAt(0) || "?"}</AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-black text-primary italic leading-none truncate">{contact?.name || "Carregando..."}</h1>
              <div className="flex items-center gap-1.5 mt-1 truncate">
                {contact?.type === 'teacher' && <BookOpen className="h-2.5 w-2.5 text-accent shrink-0" />}
                <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate">
                  {isAurora ? 'Tutor IA Integrado' : 'Estudante da Rede'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAurora && <Sparkles className="h-4 w-4 text-accent animate-pulse hidden md:block" />}
          <Badge className="bg-green-100 text-green-700 border-none px-2 font-black text-[8px] uppercase tracking-tighter">Conectado</Badge>
        </div>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col shadow-[0_10px_40px_-15px_hsl(var(--accent)/0.15)] border-none overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white relative animate-in zoom-in-95 duration-700">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="flex flex-col gap-6 py-8 px-4 md:px-12">
            {messages.length === 0 ? (
              <div className="text-center py-20 opacity-30 flex flex-col items-center animate-in fade-in duration-1000">
                <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full ${isAurora ? 'bg-accent/20' : 'bg-muted'} flex items-center justify-center mb-4`}>
                  {isAurora ? <Sparkles className="h-10 w-10 text-accent" /> : <MessageSquare className="h-10 w-10" />}
                </div>
                <p className="text-xs md:text-sm font-black italic text-primary">{isAurora ? 'Olá! Sou a Aurora.' : 'Inicie esta conexão!'}</p>
                <p className="text-[10px] font-medium mt-1">{isAurora ? 'Como posso acelerar seu aprendizado hoje?' : `Envie sua dúvida.`}</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const isFromAurora = msg.sender_id === "aurora-ai";
                
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-5 py-3 md:px-6 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-xs md:text-sm leading-relaxed font-medium shadow-sm border transition-all max-w-[90%] md:max-w-[75%] ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none border-primary/5' 
                          : isFromAurora 
                            ? 'bg-accent/10 text-primary rounded-tl-none border-accent/20'
                            : 'bg-muted/30 text-primary rounded-tl-none border-muted/20'
                      }`}>
                       {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            {isAiThinking && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 bg-accent/5 px-5 py-3 rounded-[1.5rem] rounded-tl-none border border-accent/10">
                  <div className="flex gap-1"><div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" /></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent italic">Aurora analisando...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 md:p-6 bg-muted/5 border-t shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto bg-white p-1.5 pl-5 rounded-full shadow-2xl border border-muted/20 focus-within:ring-2 focus-within:ring-accent/30 transition-all duration-300">
             <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isAiThinking}
              placeholder={isAurora ? "Tire uma dúvida com a Aurora..." : "Escreva para o mentor..."}
              className="flex-1 h-10 bg-transparent border-none text-primary font-medium italic focus-visible:ring-0 px-0 text-xs md:text-sm"
            />
            <Button type="submit" disabled={!input.trim() || isAiThinking} className="h-10 w-10 md:h-12 md:w-12 bg-primary hover:bg-primary/95 rounded-full shadow-xl shrink-0 transition-all active:scale-95">
              {isAiThinking ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Send className="h-5 w-5 text-white" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
