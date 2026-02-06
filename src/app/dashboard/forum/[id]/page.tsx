
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  MessageSquare, 
  Send, 
  Loader2, 
  Sparkles, 
  Hash, 
  ShieldCheck, 
  ThumbsUp, 
  Clock,
  Trash2,
  ShieldAlert,
  UserX,
  Gavel,
  Settings
} from "lucide-react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function ForumDetailPage() {
  const params = useParams();
  const forumId = params.id as string;
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [newPost, setNewPost] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const teacherRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "teachers", user.uid);
  }, [user, firestore]);
  const { data: teacherProfile } = useDoc(teacherRef);
  const isTeacher = !!teacherProfile;

  const forumRef = useMemoFirebase(() => {
    if (!firestore || !forumId) return null;
    return doc(firestore, "forums", forumId);
  }, [firestore, forumId]);

  const { data: forum, isLoading: isForumLoading } = useDoc(forumRef);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore || !forumId) return null;
    return query(collection(firestore, "forums", forumId, "posts"), orderBy("createdAt", "asc"));
  }, [firestore, forumId]);

  const { data: posts, isLoading: isPostsLoading } = useCollection(postsQuery);

  const handleSendPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !firestore || !user) return;

    if (forum?.blockedUsers?.includes(user.uid)) {
      toast({ title: "Ação bloqueada", description: "Você foi removido deste debate pela moderação.", variant: "destructive" });
      return;
    }

    addDocumentNonBlocking(collection(firestore, "forums", forumId, "posts"), {
      content: newPost,
      authorId: user.uid,
      authorName: user.displayName || "Usuário",
      createdAt: new Date().toISOString(),
    });

    setNewPost("");
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm("Remover esta mensagem permanentemente?")) return;
    const postRef = doc(firestore!, "forums", forumId, "posts", postId);
    deleteDocumentNonBlocking(postRef);
    toast({ title: "Mensagem removida pela moderação." });
  };

  const handleBanUser = (uid: string, name: string) => {
    if (!confirm(`Banir ${name} deste debate? O aluno não poderá mais postar aqui.`)) return;
    if (forumRef) {
      updateDocumentNonBlocking(forumRef, {
        blockedUsers: arrayUnion(uid)
      });
      toast({ title: "Usuário removido do fórum." });
    }
  };

  const handleUnbanUser = (uid: string) => {
    if (forumRef) {
      updateDocumentNonBlocking(forumRef, {
        blockedUsers: arrayRemove(uid)
      });
      toast({ title: "Acesso restaurado." });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [posts]);

  if (isForumLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 animate-spin text-accent" />
        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando...</p>
      </div>
    );
  }

  const isUserBlocked = forum?.blockedUsers?.includes(user?.uid);

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100vh-100px)] max-w-full mx-auto w-full animate-in fade-in overflow-hidden space-y-2 px-1">
      <div className="flex items-center justify-between px-2 py-2 md:py-3 shrink-0 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-9 w-9 shrink-0 hover:bg-primary/5">
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-black text-primary italic leading-none truncate">
              {forum?.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-accent text-accent-foreground border-none font-black text-[6px] md:text-[8px] uppercase px-2 h-4 tracking-widest">
                {forum?.category || "Geral"}
              </Badge>
              {isUserBlocked && <Badge className="bg-red-600 text-white border-none font-black text-[6px] uppercase px-2 h-4">Acesso Restrito</Badge>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {isTeacher && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-dashed border-accent text-accent font-black text-[8px] uppercase gap-2 h-8">
                  <ShieldAlert className="h-3 w-3" /> Moderação
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary italic">Painel do Mestre</DialogTitle>
                  <DialogDescription>Gerencie o acesso e a saúde do debate.</DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Usuários Removidos ({forum?.blockedUsers?.length || 0})</p>
                    <div className="space-y-2 max-h-48 overflow-auto pr-2">
                      {forum?.blockedUsers?.length > 0 ? (
                        forum.blockedUsers.map((uid: string) => (
                          <div key={uid} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                            <span className="text-xs font-bold text-primary italic">UID: {uid.substring(0, 8)}...</span>
                            <Button variant="ghost" size="sm" onClick={() => handleUnbanUser(uid)} className="text-accent font-black text-[10px] uppercase">Restaurar</Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs italic text-muted-foreground">Nenhum aluno removido deste tópico.</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <p className="text-[8px] font-bold uppercase text-muted-foreground text-center w-full">Use a moderação com sabedoria pedagógica.</p>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Badge className="bg-green-100 text-green-700 border-none font-black text-[7px] md:text-[9px] px-2 py-1 uppercase tracking-tighter animate-pulse">Debate Ativo</Badge>
        </div>
      </div>

      <Card className="flex-1 border-none shadow-2xl shadow-accent/10 rounded-2xl md:rounded-[3rem] bg-white overflow-hidden flex flex-col min-w-0 relative animate-in zoom-in-95 duration-700">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="flex flex-col gap-4 py-6 md:py-10 px-4 md:px-12">
            <div className="mb-4 p-5 md:p-8 bg-primary text-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white/10 shadow-lg">
                      <AvatarImage src={`https://picsum.photos/seed/author-${forum?.authorId}/50/50`} />
                      <AvatarFallback className="bg-accent text-accent-foreground font-black text-xs italic">
                        {forum?.authorName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs md:text-sm font-black italic leading-tight">{forum?.authorName}</p>
                      <p className="text-[7px] md:text-[8px] font-bold text-white/60 uppercase tracking-[0.2em]">Líder do Tópico</p>
                    </div>
                  </div>
                  <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-accent animate-pulse" />
                </div>
                <p className="text-xs md:text-base font-medium italic leading-relaxed opacity-90 border-l-4 border-accent pl-4">
                  "{forum?.description}"
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
              {isPostsLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
              ) : posts && posts.length > 0 ? (
                posts.map((post, i) => {
                  const isMe = post.authorId === user?.uid;
                  const isTopicAuthor = post.authorId === forum?.authorId;

                  return (
                    <div key={post.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[95%] md:max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1.5`}>
                        {!isMe && (
                          <div className="flex items-center gap-2 px-2 w-full">
                            <span className="text-[10px] md:text-xs font-black text-primary italic">{post.authorName}</span>
                            {isTopicAuthor && <Badge className="bg-accent text-accent-foreground border-none text-[6px] md:text-[8px] font-black h-4 px-2 uppercase tracking-tighter">Autor</Badge>}
                            
                            {isTeacher && (
                              <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleBanUser(post.authorId, post.authorName)} 
                                  className="h-6 w-6 text-red-500 hover:bg-red-50 rounded-full"
                                  title="Banir Usuário"
                                >
                                  <UserX className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeletePost(post.id)} 
                                  className="h-6 w-6 text-primary hover:bg-muted rounded-full"
                                  title="Remover Mensagem"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`relative px-4 md:px-6 py-3 md:py-4 rounded-[1.25rem] md:rounded-[2rem] text-xs md:text-sm leading-relaxed font-medium shadow-sm border group transition-all ${
                          isMe 
                            ? 'bg-primary text-white rounded-tr-none border-primary/5 shadow-primary/10' 
                            : isTopicAuthor 
                              ? 'bg-accent/10 text-primary rounded-tl-none border-accent/20'
                              : 'bg-muted/30 text-primary rounded-tl-none border-muted/20'
                        }`}>
                          {post.content}
                          {isMe && isTeacher && (
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeletePost(post.id)} 
                                className="absolute -left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                          )}
                        </div>

                        <div className={`flex items-center gap-2 px-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[7px] md:text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                            {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-4 opacity-20">
                  <MessageSquare className="h-12 w-12 mb-2 text-primary" />
                  <p className="font-black italic text-sm text-primary uppercase tracking-widest">Inicie o debate acadêmico!</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 md:p-6 bg-muted/5 border-t shrink-0">
          <div className="max-w-4xl mx-auto">
            {isUserBlocked ? (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
                <Gavel className="h-6 w-6 text-red-600 animate-bounce" />
                <div>
                  <p className="text-xs font-black text-red-700 uppercase italic">Você foi removido deste fórum</p>
                  <p className="text-[9px] font-medium text-red-600/70">Sua participação foi restrita pela coordenação pedagógica por violação das normas.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendPost} className="flex items-center gap-3 bg-white p-2 md:p-2.5 pl-6 rounded-full shadow-2xl border border-muted/20 focus-within:ring-2 focus-within:ring-accent/30 transition-all duration-300 shadow-accent/5">
                <Input 
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Contribuir com o debate..."
                  className="flex-1 h-10 md:h-12 bg-transparent border-none text-primary text-xs md:text-sm font-medium italic focus-visible:ring-0 px-0"
                />
                <Button type="submit" disabled={!newPost.trim()} className="h-10 w-10 md:h-12 md:w-12 bg-primary hover:bg-primary/95 text-white rounded-full shadow-xl shrink-0 transition-all active:scale-90">
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </form>
            )}
            <div className="flex justify-center mt-3">
               <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
                 <ShieldCheck className="h-3 w-3 text-accent" />
                 Rede Social Monitorada • EduCore
               </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
