"use client";

import { useState, useRef, useEffect } from "react";
import { conceptExplanationAssistant } from "@/ai/flows/concept-explanation-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, Loader2, Eraser, Info, FileText, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function AuroraSupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: "Olá! Eu sou a Aurora. Estou aqui para simplificar sua vida de estudante. Como posso te ajudar com dúvidas pedagógicas ou documentações hoje?"
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const historyForAi = messages.map(m => ({
        role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        content: m.content
      }));

      const result = await conceptExplanationAssistant({ 
        query: textToSend,
        history: historyForAi
      });

      if (result && result.response) {
        setMessages(prev => [...prev, { role: "assistant", content: result.response }]);
      } else {
        throw new Error("Resposta vazia");
      }
    } catch (error) {
      console.error("Erro Aurora Chat:", error);
      toast({
        title: "Aurora está processando dados",
        description: "Houve um pequeno atraso. Tente perguntar novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    { label: "Documentos ENEM", icon: FileText },
    { label: "Isenção de Taxa", icon: Info },
    { label: "Explique Derivadas", icon: Sparkles },
    { label: "O que é CadÚnico?", icon: GraduationCap },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-5xl mx-auto animate-in fade-in duration-500 overflow-hidden space-y-6">
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tight text-primary flex items-center gap-3">
            Central da Aurora
            <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Assistente Pedagógica & Suporte 24/7</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setMessages([{role: "assistant", content: "Chat reiniciado! Em que posso ajudar agora?"}])} 
          className="rounded-xl border-dashed h-10 px-6 text-xs font-black uppercase group"
          aria-label="Reiniciar conversa"
        >
          <Eraser className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Reiniciar</span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0 overflow-hidden">
        <div className="hidden lg:flex flex-col gap-6 w-72 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 px-2">Sugestões de Apoio</p>
          <div className="space-y-3">
            {suggestionChips.map((chip, i) => (
              <Button 
                key={i} 
                variant="outline" 
                onClick={() => handleSend(undefined, chip.label)}
                className="w-full justify-start h-auto py-4 px-5 rounded-2xl bg-white hover:bg-accent hover:text-white transition-all border-none shadow-md font-bold text-xs gap-4 group text-left"
              >
                <div className="p-2.5 bg-primary/5 rounded-xl group-hover:bg-white/20 transition-colors">
                  <chip.icon className="h-4 w-4 text-accent group-hover:text-white shrink-0" />
                </div>
                <span className="truncate whitespace-normal leading-snug">{chip.label}</span>
              </Button>
            ))}
          </div>
          
          <Card className="mt-auto p-6 bg-primary text-primary-foreground border-none rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-black text-xs mb-3 flex items-center gap-2 italic">
                <Info className="h-4 w-4 text-accent" />
                Dica da Aurora
              </h3>
              <p className="text-xs opacity-80 leading-relaxed font-medium">
                Sempre tenha em mãos o seu NIS (Número de Identificação Social) para consultas de isenção e benefícios estudantis.
              </p>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          </Card>
        </div>

        <Card className="flex-1 flex flex-col shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white relative min-h-0 border-t-4 border-accent/20">
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="flex flex-col gap-8 py-8 px-6 md:px-10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-500`}>
                  <Avatar className={`h-10 w-10 md:h-12 md:w-12 border-2 shrink-0 shadow-lg ${msg.role === 'assistant' ? 'border-primary/10' : 'border-accent/10'}`}>
                    <AvatarFallback className={msg.role === 'assistant' ? 'bg-primary text-white' : 'bg-accent text-white font-black'}>
                      {msg.role === 'assistant' ? <Bot className="h-5 w-5 md:h-6 md:w-6" /> : <User className="h-5 w-5 md:h-6 md:w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-base leading-relaxed shadow-sm max-w-[85%] md:max-w-[75%] font-medium ${
                    msg.role === 'assistant' 
                      ? 'bg-muted/20 text-foreground rounded-tl-none border border-muted/20' 
                      : 'bg-primary text-white rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 md:gap-6 animate-pulse">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-muted shrink-0" />
                  <div className="bg-muted/10 p-6 rounded-[2rem] rounded-tl-none flex items-center gap-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 italic">Aurora processando sua dúvida...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 md:p-8 bg-muted/5 border-t shrink-0">
            <form onSubmit={handleSend} className="flex gap-4 max-w-4xl mx-auto">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre matérias ou benefícios..."
                disabled={loading}
                className="flex-1 h-14 md:h-16 bg-white border-none rounded-2xl md:rounded-3xl px-8 shadow-xl focus-visible:ring-accent text-sm md:text-base font-bold italic"
                aria-label="Campo de entrada de mensagem para a Aurora"
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()} 
                className="h-14 w-14 md:h-16 md:w-16 bg-primary hover:bg-primary/95 rounded-2xl md:rounded-3xl shadow-2xl shrink-0 transition-all active:scale-90"
                aria-label="Enviar mensagem"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Send className="h-6 w-6 text-white" />}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}