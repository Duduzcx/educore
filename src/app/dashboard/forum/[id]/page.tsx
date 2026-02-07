
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
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function ForumDetailPage() {
  const params = useParams();
  const forumId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [newPost, setNewPost] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [forum, setForum] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user || !forumId) return;
      setLoading(true);

      // 1. Verificar se é professor
      const { data: teacher } = await supabase.from('teachers').select('*').eq('id', user.id).single();
      setIsTeacher(!!teacher);

      // 2. Carregar fórum
      const { data: forumData } = await supabase.from('forums').select('*').eq('id', forumId).single();
      setForum(forumData);

      // 3. Carregar posts
      const { data: postsData } = await supabase.from('forum_posts').select('*').eq('forum_id', forumId).order('created_at', { ascending: true });
      setPosts(postsData || []);
      
      setLoading(false);
    }
    loadData();

    // Inscrição em tempo real
    const channel = supabase
      .channel(`forum_${forumId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'forum_posts',
        filter: `forum_id=eq.${forumId}`
      }, (payload) => {
        setPosts(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, forumId]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    if (forum?.blocked_users?.includes(user.id)) {
      toast({ title: "Ação bloqueada", description: "Você foi removido deste debate pela moderação.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('forum_posts').insert({
      forum_id: forumId,
      content: newPost,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || "Usuário",
      created_at: new Date().toISOString()
    });

    if (!error) setNewPost("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [posts]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 animate-spin text-accent" />
        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando...</p>
      </div>
    );
  }

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
            <Badge variant="outline" className="bg-accent text-accent-foreground border-none font-black text-[6px] md:text-[8px] uppercase px-2 h-4 tracking-widest mt-1">
              {forum?.category || "Geral"}
            </Badge>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 border-none font-black text-[7px] md:text-[9px] px-2 py-1 uppercase tracking-tighter animate-pulse">Debate Ativo</Badge>
      </div>

      <Card className="flex-1 border-none shadow-2xl shadow-accent/10 rounded-2xl md:rounded-[3rem] bg-white overflow-hidden flex flex-col min-w-0 relative animate-in zoom-in-95 duration-700">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="flex flex-col gap-4 py-6 md:py-10 px-4 md:px-12">
            <div className="mb-4 p-5 md:p-8 bg-primary text-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white/10 shadow-lg">
                      <AvatarImage src={`https://picsum.photos/seed/author-${forum?.author_id}/50/50`} />
                      <AvatarFallback className="bg-accent text-accent-foreground font-black text-xs italic">
                        {forum?.author_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs md:text-sm font-black italic leading-tight">{forum?.author_name}</p>
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
              {posts.map((post, i) => {
                const isMe = post.author_id === user?.id;
                const isTopicAuthor = post.author_id === forum?.author_id;

                return (
                  <div key={post.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[95%] md:max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1.5`}>
                      {!isMe && (
                        <div className="flex items-center gap-2 px-2 w-full">
                          <span className="text-[10px] md:text-xs font-black text-primary italic">{post.author_name}</span>
                          {isTopicAuthor && <Badge className="bg-accent text-accent-foreground border-none text-[6px] md:text-[8px] font-black h-4 px-2 uppercase tracking-tighter">Autor</Badge>}
                        </div>
                      )}
                      <div className={`px-4 md:px-6 py-3 md:py-4 rounded-[1.25rem] md:rounded-[2rem] text-xs md:text-sm leading-relaxed font-medium shadow-sm border ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none border-primary/5 shadow-primary/10' 
                          : isTopicAuthor 
                            ? 'bg-accent/10 text-primary rounded-tl-none border-accent/20'
                            : 'bg-muted/30 text-primary rounded-tl-none border-muted/20'
                      }`}>
                        {post.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 md:p-6 bg-muted/5 border-t shrink-0">
          <form onSubmit={handleSendPost} className="flex items-center gap-3 bg-white p-2 md:p-2.5 pl-6 rounded-full shadow-2xl border border-muted/20 focus-within:ring-2 focus-within:ring-accent/30 transition-all duration-300">
            <Input 
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Contribuir com o debate..."
              className="flex-1 h-10 md:h-12 bg-transparent border-none text-primary text-xs md:text-sm font-medium italic focus-visible:ring-0 px-0"
            />
            <Button type="submit" disabled={!newPost.trim()} className="h-10 w-10 md:h-12 md:w-12 bg-primary hover:bg-primary/95 text-white rounded-full shadow-xl shrink-0 transition-all">
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
