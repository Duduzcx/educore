"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  Send, 
  Loader2, 
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// TODO: Refatorar para usar o Firebase
// A lógica de carregamento de posts e criação de novas postagens foi removida.
// É preciso reimplementar usando o Firestore, possivelmente com listeners em tempo real.

export default function ForumDetailPage() {
  const params = useParams();
  const forumId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [newPost, setNewPost] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [forum, setForum] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lógica de carregar dados e inscrição em canal foi removida e substituída por mock
    setLoading(true);
    setForum({
        id: forumId,
        name: "Qual a melhor forma de estudar para a prova de Matemática?",
        description: "Estou com dificuldade em matemática e queria saber como vocês organizam os estudos para o ENEM. Quais assuntos focam mais?",
        category: "Matemática",
        author_id: "mock-author-id",
        author_name: "Estudante Curioso"
    });
    setPosts([
        { id: '1', author_id: 'mock-author-id', author_name: 'Estudante Curioso', content: 'Alguém tem alguma dica?' },
        { id: '2', author_id: user?.id, author_name: 'Você', content: 'Eu costumo focar em geometria e probabilidade!' },
    ]);
    setLoading(false);
  }, [user, forumId]);

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    const newPostData = {
        id: new Date().toISOString(),
        author_id: user.id,
        author_name: user.user_metadata?.full_name || "Você",
        content: newPost,
        created_at: new Date().toISOString(),
    };

    setPosts(prev => [...prev, newPostData]);
    setNewPost("");
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
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 animate-spin text-accent" />
        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest animate-pulse">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-full mx-auto w-full animate-in fade-in overflow-hidden space-y-2 px-1">
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

      <Card className="flex-1 min-h-0 border-none shadow-2xl shadow-accent/10 rounded-2xl md:rounded-[3rem] bg-white overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-700">
        <ScrollArea className="flex-1" ref={scrollRef}>
           <div className="flex flex-col gap-4 py-6 md:py-10 px-4 md:px-12">
                {posts.map((post) => {
                    const isMe = post.author_id === user?.id;
                    return (
                        <div key={post.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-primary text-white' : 'bg-muted'}`}>
                                <p className="font-bold">{post.author_name}</p>
                                <p>{post.content}</p>
                            </div>
                        </div>
                    );
                })}
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