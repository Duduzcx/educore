"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, HandMetal, Send, Bot, User, Sparkles, Loader2, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { conceptExplanationAssistant } from "@/ai/flows/concept-explanation-assistant";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou a Aurora. Como posso ajudar seu aprendizado hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        content: m.content
      }));

      const result = await conceptExplanationAssistant({ query: currentInput, history });
      if (result?.response) {
        setMessages(prev => [...prev, { role: "assistant", content: result.response }]);
      }
    } catch (err) {
      toast({ title: "Aurora está ocupada agora", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button 
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white group relative"
            title="Abrir Aurora IA"
          >
            <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12 text-accent" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[90vw] sm:max-w-[400px] p-0 border-none rounded-l-[2rem] overflow-hidden bg-white flex flex-col shadow-2xl">
          <SheetHeader className="p-6 bg-primary text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground shadow-lg">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <SheetTitle className="text-white font-black italic leading-none">Aurora IA</SheetTitle>
                  <p className="text-[8px] font-black uppercase tracking-widest text-accent mt-1">SISTEMA DE APOIO ATIVO</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMessages([{role: "assistant", content: "Chat reiniciado! Em que posso ajudar?"}])} 
                className="text-white/40 hover:text-white hover:bg-white/10 rounded-full"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6 bg-slate-50/50" ref={scrollRef}>
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs md:text-sm font-medium leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-primary rounded-tl-none border border-primary/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-accent/10 p-4 rounded-2xl rounded-tl-none border border-accent/20 flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" />
                      <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-accent italic">Aurora analisando...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-white border-t shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-100 p-1.5 pl-4 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-accent/30 transition-all">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tire uma dúvida agora..."
                disabled={loading}
                className="border-none shadow-none focus-visible:ring-0 text-xs font-bold italic h-10 bg-transparent"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || loading} 
                className="rounded-full bg-primary hover:bg-primary/95 shadow-xl h-10 w-10 shrink-0 transition-all active:scale-90"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <button 
        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-white group" 
        title="Acessibilidade VLibras"
      >
        <HandMetal className="h-6 w-6 transition-transform group-hover:rotate-12" />
      </button>
    </div>
  );
}