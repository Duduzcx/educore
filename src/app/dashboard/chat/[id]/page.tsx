
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ChevronLeft, Loader2, MessageSquare, Shield, Paperclip, FileText, Download, Sparkles, Bot, Info, BookOpen } from "lucide-react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useToast } from "@/hooks/use-toast";
import { conceptExplanationAssistant } from "@/ai/flows/concept-explanation-assistant";

export default function DirectChatPage() {
  const params = useParams();
  const contactId = params.id as string;
  const isAurora = contactId === "aurora-ai";
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{name: string, type: string, size: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const updatingMessagesRef = useRef<Set<string>>(new Set());

  const contactRef = useMemoFirebase(() => {
    if (!firestore || !contactId || isAurora) return null;
    return doc(firestore, "users", contactId);
  }, [firestore, contactId, isAurora]);
  
  const teacherContactRef = useMemoFirebase(() => {
    if (!firestore || !contactId || isAurora) return null;
    return doc(firestore, "teachers", contactId);
  }, [firestore, contactId, isAurora]);

  const { data: contactData } = useDoc(contactRef);
  const { data: teacherContactData } = useDoc(teacherContactRef);
  
  const contact = isAurora ? { name: "Aurora IA", expertise: "Mentoria Geral & IA" } : (teacherContactData || contactData);
  const isTeacher = !!teacherContactData;

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !contactId) return null;
    const participantsCombo1 = [user.uid, contactId];
    const participantsCombo2 = [contactId, user.uid];
    return query(
      collection(firestore, "chat_messages"),
      where("participants", "in", [participantsCombo1, participantsCombo2])
    );
  }, [firestore, user, contactId]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    return messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages]);

  useEffect(() => {
    if (filteredMessages.length > 0 && user && firestore && !isAurora) {
      const unreadToMe = filteredMessages.filter(m => 
        m.receiverId === user.uid && 
        m.isRead === false && 
        !updatingMessagesRef.current.has(m.id)
      );

      if (unreadToMe.length > 0) {
        unreadToMe.forEach(m => {
          updatingMessagesRef.current.add(m.id);
          const mRef = doc(firestore, "chat_messages", m.id);
          updateDoc(mRef, { isRead: true }).catch((err) => {
            console.error("Erro ao marcar como lida:", err);
            updatingMessagesRef.current.delete(m.id);
          });
        });
      }
    }
  }, [filteredMessages, user, firestore, isAurora]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [filteredMessages, isAiThinking]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || !user || !contactId || !firestore) return;

    const userText = input;
    const messageData: any = {
      senderId: user.uid,
      receiverId: contactId,
      message: userText || `Enviou um arquivo: ${selectedFile?.name}`,
      timestamp: new Date().toISOString(),
      participants: [user.uid, contactId],
      isRead: isAurora 
    };

    if (selectedFile) {
      messageData.fileName = selectedFile.name;
      messageData.fileType = selectedFile.type;
      messageData.fileUrl = "https://picsum.photos/seed/file/800/600";
    }

    addDocumentNonBlocking(collection(firestore, "chat_messages"), messageData);
    setInput("");
    setSelectedFile(null);

    if (isAurora) {
      setIsAiThinking(true);
      try {
        const history = filteredMessages.slice(-5).map(m => ({
          role: (m.senderId === "aurora-ai" ? 'model' : 'user') as 'user' | 'model',
          content: m.message
        }));

        const result = await conceptExplanationAssistant({
          query: userText,
          history: history
        });

        if (result && result.response) {
          addDocumentNonBlocking(collection(firestore, "chat_messages"), {
            senderId: "aurora-ai",
            receiverId: user.uid,
            message: result.response,
            timestamp: new Date().toISOString(),
            participants: [user.uid, "aurora-ai"],
            isRead: false
          });
        }
      } catch (err) {
        toast({ title: "Aurora está ocupada", description: "Tente novamente em instantes.", variant: "destructive" });
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500 overflow-hidden space-y-4 max-w-full mx-auto w-full px-1">
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
                {isTeacher && <BookOpen className="h-2.5 w-2.5 text-accent shrink-0" />}
                <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate">
                  {isAurora ? 'Tutor IA Integrado' : isTeacher ? `Mentor de ${contact?.subjects || 'Educação'}` : 'Estudante da Rede'}
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

      <Card className="flex-1 flex flex-col shadow-[0_10px_40px_-15px_hsl(var(--accent)/0.15)] border-none overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white relative animate-in zoom-in-95 duration-700 max-w-full min-w-0">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="flex flex-col gap-6 py-8 px-4 md:px-12">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando Mensagens...</p>
              </div>
            ) : filteredMessages?.length === 0 ? (
              <div className="text-center py-20 opacity-30 flex flex-col items-center animate-in fade-in duration-1000">
                <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full ${isAurora ? 'bg-accent/20' : 'bg-muted'} flex items-center justify-center mb-4`}>
                  {isAurora ? <Sparkles className="h-10 w-10 text-accent" /> : <MessageSquare className="h-10 w-10" />}
                </div>
                <p className="text-xs md:text-sm font-black italic text-primary">{isAurora ? 'Olá! Sou a Aurora.' : 'Inicie esta conexão!'}</p>
                <p className="text-[10px] font-medium mt-1">{isAurora ? 'Como posso acelerar seu aprendizado hoje?' : `Envie sua dúvida para o mentor.`}</p>
              </div>
            ) : (
              filteredMessages?.map((msg, i) => {
                const isMe = msg.senderId === user?.uid;
                const isFromAurora = msg.senderId === "aurora-ai";
                const isImage = msg.fileType?.startsWith('image/');
                
                return (
                  // OTIMIZAÇÃO DE PERFORMANCE (TBT): Animações removidas.
                  // Renderizar centenas de animações de uma vez causava um bloqueio de 26s na thread principal.
                  // A remoção garante que a UI permaneça responsiva, mesmo em conversas com histórico longo.
                  <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[90%] md:max-w-[75%] space-y-1`}>
                      {!isMe && (
                        <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest px-2">{msg.senderId === "aurora-ai" ? "AURORA IA" : "MENTOR"}</span>
                      )}
                      <div className={`px-5 py-3 md:px-6 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-xs md:text-sm leading-relaxed font-medium shadow-sm border transition-all ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none border-primary/5' 
                          : isFromAurora 
                            ? 'bg-accent/10 text-primary rounded-tl-none border-accent/20'
                            : 'bg-muted/30 text-primary rounded-tl-none border-muted/20'
                      }`}>
                        {msg.fileUrl && (
                          <div className="mb-3 animate-in zoom-in duration-500">
                            {isImage ? (
                              <div className="relative rounded-xl overflow-hidden mb-2 border-2 border-white/20"><img src={msg.fileUrl} alt="Anexo" className="w-full h-auto max-h-64 object-cover" /></div>
                            ) : (
                              <div className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-white/10' : 'bg-white'} border border-white/10`}>
                                <FileText className={`h-6 w-6 ${isMe ? 'text-white' : 'text-primary'}`} /><div className="flex-1 min-w-0"><p className="text-[9px] font-black uppercase truncate">{msg.fileName}</p></div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full shrink-0"><Download className="h-4 w-4" /></Button>
                              </div>
                            )}
                          </div>
                        )}
                        {msg.message}
                      </div>
                      <div className={`flex items-center gap-2 px-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <p className="text-[7px] font-black uppercase tracking-widest opacity-30">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isMe && <div className={`h-1 w-1 rounded-full ${msg.isRead ? 'bg-accent' : 'bg-muted-foreground/20'}`} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isAiThinking && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 bg-accent/5 px-5 py-3 rounded-[1.5rem] rounded-tl-none border border-accent/10">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce" />
                    <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent italic">Aurora analisando...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 md:p-6 bg-muted/5 border-t shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto bg-white p-1.5 pl-5 rounded-full shadow-2xl border border-muted/20 focus-within:ring-2 focus-within:ring-accent/30 transition-all duration-300">
            <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
              const f = e.target.files?.[0];
              if(f) setSelectedFile({name: f.name, type: f.type, size: f.size});
            }} />
            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="rounded-full text-muted-foreground hover:text-accent shrink-0 transition-all">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isAiThinking}
              placeholder={isAurora ? "Tire uma dúvida com a Aurora..." : "Escreva para o mentor..."}
              className="flex-1 h-10 bg-transparent border-none text-primary font-medium italic focus-visible:ring-0 px-0 text-xs md:text-sm"
            />
            <Button type="submit" disabled={(!input.trim() && !selectedFile) || isAiThinking} className="h-10 w-10 md:h-12 md:w-12 bg-primary hover:bg-primary/95 rounded-full shadow-xl shrink-0 transition-all active:scale-95">
              {isAiThinking ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Send className="h-5 w-5 text-white" />}
            </Button>
          </form>
          <div className="flex justify-center mt-3">
             <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30">
               <Shield className="h-3 w-3" />
               Mentoria Oficial • Rede EduCore
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
