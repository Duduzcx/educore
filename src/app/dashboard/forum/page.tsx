
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

const initialForums = [
    { 
      id: '1',
      name: "Qual a melhor forma de estudar para a prova de Matemática do ENEM?", 
      description: "Estou com dificuldade em matemática e queria saber como vocês organizam os estudos para o ENEM. Quais assuntos focam mais?", 
      category: "Matemática", 
      author_id: 'user1', 
      author_name: "Estudante Curioso"
    },
    { 
      id: '2',
      name: "Dicas para a redação: como fazer uma boa proposta de intervenção?", 
      description: "Sempre perco pontos na competência 5. Alguém tem um passo a passo ou algum modelo que ajude a detalhar a proposta de intervenção?", 
      category: "Linguagens", 
      author_id: 'user2', 
      author_name: "Futuro Calouro"
    }
];

export default function ForumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newForum, setNewForum] = useState({ name: "", description: "", category: "Dúvidas" });
  const [forums, setForums] = useState<any[]>(initialForums);
  const [loading, setLoading] = useState(false);

  const handleCreateForum = async () => {
    if (!newForum.name.trim() || !user) return;

    setIsSubmitting(true);
    const newForumData = {
        id: new Date().toISOString(),
        name: newForum.name,
        description: newForum.description,
        category: newForum.category,
        author_id: user.id,
        author_name: user.user_metadata?.full_name || "Você",
        created_at: new Date().toISOString()
    };
    
    setForums(prev => [newForumData, ...prev]);
    toast({ title: "Discussão Iniciada!", description: "Sua pergunta já está na rede (simulação)." });
    setIsCreateOpen(false);
    setNewForum({ name: "", description: "", category: "Dúvidas" });
    setIsSubmitting(false);
  };

  const filteredForums = forums?.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === "Todos" || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Matemática": return <Calculator className="h-5 w-5 md:h-6 md:w-6" />;
      case "Física": return <Atom className="h-5 w-5 md:h-6 md:w-6" />;
      case "Química": return <FlaskConical className="h-5 w-5 md:h-6 md:w-6" />;
      default: return <Hash className="h-5 w-5 md:h-6 md:w-6" />;
    }
  };

  return (
    <div className="flex flex-col space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 max-w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1 shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-primary italic tracking-tight leading-none">
            Comunidade Compromisso
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
              <div className="space-y-4 py-4">
                  <Input placeholder="Título da discussão" value={newForum.name} onChange={(e) => setNewForum({...newForum, name: e.target.value})} />
                  <Select value={newForum.category} onValueChange={(v) => setNewForum({...newForum, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{FORUM_CATEGORIES.filter(c=>c!=="Todos").map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Descreva sua dúvida" value={newForum.description} onChange={(e) => setNewForum({...newForum, description: e.target.value})} />
              </div>
              <DialogFooter>
                  <Button onClick={handleCreateForum} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publicar"}</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-2 px-1">
        {filteredForums?.map((forum, index) => (
            <Card key={forum.id} className="group relative overflow-hidden flex flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white">{getCategoryIcon(forum.category)}</div>
                        <Badge variant="secondary">{forum.category}</Badge>
                    </div>
                    <CardTitle className="pt-4">{forum.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription>"{forum.description}"</CardDescription>
                    <Button asChild className="mt-4 w-full"><Link href={`/dashboard/forum/${forum.id}`}>Debater <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
