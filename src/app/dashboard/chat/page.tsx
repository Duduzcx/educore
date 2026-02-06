
"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserCircle, Loader2, Sparkles, Send, Users, GraduationCap, MessageCircle, Bot, BookOpen, School } from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, limit, where } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChatListPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users"), limit(50));
  }, [firestore, user]);

  const teachersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "teachers"), limit(50));
  }, [firestore, user]);

  const { data: students, isLoading: loadingStudents } = useCollection(usersQuery);
  const { data: teachers, isLoading: loadingTeachers } = useCollection(teachersQuery);

  const unreadMessagesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "chat_messages"),
      where("receiverId", "==", user.uid),
      where("isRead", "==", false)
    );
  }, [firestore, user]);

  const { data: unreadMessages } = useCollection(unreadMessagesQuery);

  const allContacts = [
    ...(students || []).map(s => ({ ...s, type: 'student', expertise: s.course || 'Estudante' })),
    ...(teachers || []).map(t => ({ ...t, type: 'teacher', expertise: t.subjects || 'Mentor Geral' }))
  ].filter(c => c.id !== user?.uid);

  const filteredContacts = allContacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUnreadCountForContact = (contactId: string) => {
    return unreadMessages?.filter(m => m.senderId === contactId).length || 0;
  };

  const isLoading = loadingStudents || loadingTeachers;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-full mx-auto overflow-hidden px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-primary italic leading-none">
            Diretório de Mentoria
          </h1>
          <p className="text-muted-foreground font-medium text-sm md:text-lg italic">Conecte-se com especialistas prontos para acelerar seu futuro.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/5 text-primary font-black px-4 py-2 border-none shadow-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            REDE ATIVA
          </Badge>
        </div>
      </div>

      <div className="relative max-w-xl group w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
        <Input 
          placeholder="Pesquisar por nome ou matéria (ex: Matemática)..." 
          className="pl-12 h-12 md:h-14 bg-white border-none shadow-xl shadow-accent/5 rounded-2xl md:rounded-[1.5rem] text-sm md:text-lg font-medium italic focus-visible:ring-accent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* AURORA AI - PINNED CONTACT */}
      <div className="space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/40 px-4">Assistência Inteligente 24/7</h3>
        <Card className="border-none shadow-[0_10px_40px_-15px_hsl(var(--accent)/0.3)] hover:shadow-[0_20px_80px_-15px_hsl(var(--accent)/0.5)] rounded-[2.5rem] bg-primary text-white overflow-hidden group hover:scale-[1.01] transition-all duration-500">
          <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-[2rem] bg-accent text-accent-foreground flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <Bot className="h-10 w-10 md:h-14 md:w-14" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 md:h-6 md:w-6 bg-green-500 rounded-full border-4 border-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl md:text-3xl font-black italic">Aurora IA</CardTitle>
                <p className="text-white/60 font-medium text-xs md:text-base">Mentora Pedagógica Especialista em todas as áreas e burocracias escolares.</p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className="bg-white/10 text-white border-none text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2">FULL STACK MENTOR</Badge>
                  <Badge className="bg-accent text-accent-foreground border-none text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2">SISTEMA ATIVO</Badge>
                </div>
              </div>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90 font-black h-12 md:h-14 px-8 md:px-10 rounded-2xl shadow-xl group/btn w-full md:w-auto transition-all active:scale-95" asChild>
              <Link href="/dashboard/chat/aurora-ai">
                Conversar com a Aurora
                <Sparkles className="h-4 w-4 ml-2 animate-pulse text-accent" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/40 px-4">Corpo Docente e Mentores</h3>
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-[10px]">Sincronizando Mentores...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredContacts?.map((contact, index) => {
              const unreadCount = getUnreadCountForContact(contact.id);
              const isTeacher = contact.type === 'teacher';
              
              return (
                <Card key={contact.id} className={`border-none shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-[0_20px_60px_-15px_hsl(var(--accent)/0.3)] hover:-translate-y-2 transition-all duration-500 ${unreadCount > 0 ? 'ring-2 ring-accent' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-primary/5 shadow-2xl ring-4 ring-background transition-transform duration-500 group-hover:scale-110">
                          <AvatarImage src={`https://picsum.photos/seed/${contact.id}/200/200`} />
                          <AvatarFallback className="bg-primary text-white font-black text-2xl italic">
                            {contact.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white shadow-sm" />
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 h-8 w-8 bg-accent text-accent-foreground rounded-full border-4 border-white flex items-center justify-center font-black text-xs animate-bounce shadow-lg">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <CardTitle className="text-lg md:text-xl font-black text-primary italic leading-tight truncate max-w-[220px]">
                            {contact.name || "Usuário"}
                          </CardTitle>
                          <Badge variant="outline" className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-none ${
                            isTeacher ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {isTeacher ? 'Mentor Pedagógico' : 'Estudante'}
                          </Badge>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {isTeacher ? <BookOpen className="h-3 w-3 text-accent" /> : <School className="h-3 w-3 text-primary/40" />}
                            <span className="text-[10px] md:text-[11px] font-bold italic truncate max-w-[180px]">
                              {contact.expertise}
                            </span>
                          </div>
                          {contact.institution && (
                            <span className="text-[8px] font-black text-primary/30 uppercase tracking-tighter">
                              {contact.institution}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-full pt-4">
                        <Button className={`w-full ${unreadCount > 0 ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent/20' : 'bg-primary text-white hover:bg-primary/95 shadow-primary/20'} font-black h-12 rounded-2xl shadow-xl group/btn transition-all active:scale-95`} asChild>
                          <Link href={`/dashboard/chat/${contact.id}`}>
                            {unreadCount > 0 ? 'Responder Mentor' : 'Iniciar Mentoria'}
                            <Send className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!filteredContacts?.length && !isLoading && (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-muted/20 rounded-[3rem] bg-muted/5 animate-in fade-in duration-1000">
                <UserCircle className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="font-black text-primary italic text-xl">Nenhum mentor encontrado</p>
                <p className="text-muted-foreground font-medium text-sm mt-2">Tente pesquisar por uma matéria específica.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
