"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  ArrowRight, 
  Loader2, 
  Filter, 
  Hash,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Languages,
  History,
  Globe,
  HelpCircle,
  Zap,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FORUM_CATEGORIES = [
  "Todos", 
  "Dúvidas", 
  "Matemática", 
  "Física", 
  "Química", 
  "Biologia", 
  "Linguagens", 
  "História", 
  "Geografia", 
  "Carreira", 
  "Off-Topic"
];

export default function ForumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newForum, setNewForum] = useState({ name: "", description: "", category: "Dúvidas" });
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForums() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase.from('forums').select('*').order('created_at', { ascending: false });
      if (!error) setForums(data || []);
      setLoading(false);
    }
    fetchForums();
  }, [user]);

  const handleCreateForum = async () => {
    if (!newForum.name.trim() || !user) return;

    setIsSubmitting(true);
    const { data, error } = await supabase.from('forums').insert({
      name: newForum.name,
      description: newForum.description,
      category: newForum.category,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || "Usuário",
      created_at: new Date().toISOString()
    }).select().single();

    if (!error) {
      setForums([data, ...forums]);
      toast({ title: "Discussão Iniciada!", description: "Sua pergunta já está na rede." });
      setIsCreateOpen(false);
      setNewForum({ name: "", description: "", category: "Dúvidas" });
    } else {
      toast({ title: "Erro ao publicar", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const filteredForums = forums?.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Matemática": return <Calculator className="h-5 w-5 md:h-6 md:w-6" />;
      case "Física": return <Atom className="h-5 w-5 md:h-6 md:w-6" />;
      case "Química": return <FlaskConical className="h-5 w-5 md:h-6 md:w-6" />;
      case "Biologia": return <Dna className="h-5 w-5 md:h-6 md:w-6" />;
      case "Linguagens": return <Languages className="h-5 w-5 md:h-6 md:w-6" />;
      case "História": return <History className="h-5 w-5 md:h-6 md:w-6" />;
      case "Geografia": return <Globe className="h-5 w-5 md:h-6 md:w-6" />;
      case "Dúvidas": return <HelpCircle className="h-5 w-5 md:h-6 md:w-6" />;
      default: return <Hash className="h-5 w-5 md:h-6 md:w-6" />;
    }
  };

  return (
    <div className="flex flex-col space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 max-w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1 shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-primary italic tracking-tight leading-none">
            Comunidade EduCore
          </h1>
          <p className="text-muted-foreground font-medium text-sm md:text-lg italic">Onde o conhecimento se torna colaborativo.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="rounded-xl md:rounded-[1.25rem] h-12 md:h-14 bg-accent text-accent-foreground font-black px-6 md:px-8 shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 w-full md:w-auto border-none">
              <Plus className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-sm md:text-base">Novo Tópico</span>
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-none shadow-2xl p-6 md:p-10 max-w-[95vw] md:max-w-lg bg-white mx-auto">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-black italic text-primary">Iniciar Discussão</DialogTitle>
              <DialogDescription className="font-medium text-xs">Compartilhe sua dúvida com a rede.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 md:space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase opacity-40">Título</Label>
                <Input 
                  placeholder="Ex: Como resolver limites?" 
                  value={newForum.name}
                  onChange={(e) => setNewForum({...newForum, name: e.target.value})}
                  className="rounded-xl bg-muted/30 border-none h-12 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase opacity-40">Categoria</Label>
                <Select value={newForum.category} onValueChange={(v) => setNewForum({...newForum, category: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {FORUM_CATEGORIES.filter(c => c !== "Todos").map(cat => (
                      <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase opacity-40">Pergunta</Label>
                <Input 
                  placeholder="Descreva o assunto..." 
                  value={newForum.description}
                  onChange={(e) => setNewForum({...newForum, description: e.target.value})}
                  className="rounded-xl bg-muted/30 border-none h-12"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateForum} disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-xl active:scale-95 transition-all border-none">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publicar no Mural"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 px-1 shrink-0">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input 
            placeholder="Pesquisar discussões..." 
            className="pl-12 h-12 md:h-14 bg-white border-none shadow-xl shadow-accent/5 rounded-2xl md:rounded-[1.5rem] text-sm md:text-lg font-medium italic focus-visible:ring-accent w-full transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full px-1 overflow-hidden shrink-0">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-white/50 backdrop-blur-md p-1.5 h-12 md:h-16 rounded-xl border-none shadow-sm flex items-center gap-2 w-max min-w-full">
            {FORUM_CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg md:rounded-xl px-5 md:px-8 h-full font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all duration-300 border-none whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-muted/50 text-muted-foreground'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 w-full">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="font-black text-muted-foreground uppercase text-[10px] tracking-[0.3em] animate-pulse">Sincronizando Rede Social...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-2 px-1 max-w-full min-w-0">
            {filteredForums?.map((forum, index) => (
              <Card 
                key={forum.id} 
                className="group relative overflow-hidden border-none bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_10px_40px_-15px_hsl(var(--accent)/0.15)] hover:shadow-[0_20px_80px_-15px_hsl(var(--accent)/0.3)] transition-all duration-500 hover:-translate-y-2 flex flex-col animate-in fade-in" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="p-6 md:p-8 pb-3 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/5 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white shadow-sm">
                      {getCategoryIcon(forum.category)}
                    </div>
                    <Badge variant="secondary" className="text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-muted/30 text-primary border-none px-2 h-5">
                      {forum.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg md:text-2xl font-black text-primary italic leading-tight line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
                    {forum.name}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm font-medium line-clamp-2 mt-2 opacity-80 italic">
                    "{forum.description}"
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-6 md:p-8 pb-6 pt-3 mt-auto relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 md:-space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-6 w-6 md:h-7 md:w-7 rounded-full border-2 border-white bg-muted overflow-hidden shadow-sm">
                            <img src={`https://picsum.photos/seed/user-${forum.id}-${i}/50/50`} alt="Participante" className="object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[7px] md:text-[8px] font-black text-primary/40 uppercase">Membros Ativos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[7px] md:text-[8px] font-black text-accent">
                      <Zap className="h-2.5 w-2.5 fill-accent animate-pulse" />
                      <span>HOT TOPIC</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                    <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                      <Avatar className="h-7 w-7 md:h-8 md:w-8 border-2 border-primary/10 shadow-sm shrink-0">
                        <AvatarImage src={`https://picsum.photos/seed/author-${forum.author_id}/50/50`} />
                        <AvatarFallback className="text-[8px] md:text-[10px] font-black bg-primary text-white italic">
                          {forum.author_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[9px] md:text-[10px] font-bold text-primary italic truncate max-w-[80px] md:max-w-[100px]">{forum.author_name}</span>
                    </div>
                    <Button variant="ghost" className="font-black text-[9px] md:text-[11px] uppercase text-accent hover:bg-accent/10 gap-1.5 h-9 md:h-10 px-3 md:px-4 rounded-xl group/btn active:scale-90 transition-all" asChild>
                      <Link href={`/dashboard/forum/${forum.id}`}>
                        Debater
                        <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
