
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, LayoutDashboard, Search, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function TeacherTrailsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [trails, setTrails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<"none" | "missing_table" | "rls_error">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTrail, setNewTrail] = useState({ title: "", category: "", description: "" });

  useEffect(() => {
    async function fetchTrails() {
      if (!user) return;
      setLoading(true);
      setErrorState("none");
      
      const { data, error } = await supabase
        .from('learning_trails')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === '42P01') {
          setErrorState("missing_table");
        } else if (error.message.includes('row-level security')) {
          setErrorState("rls_error");
        } else {
          console.error(error);
        }
      } else {
        setTrails(data || []);
      }
      setLoading(false);
    }
    fetchTrails();
  }, [user]);

  const handleCreateTrail = async () => {
    if (!newTrail.title || !user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('learning_trails').insert({
        title: newTrail.title,
        category: newTrail.category || "Geral",
        description: newTrail.description,
        teacher_id: user.id,
        teacher_name: user.user_metadata?.full_name || "Professor",
        status: "draft",
        created_at: new Date().toISOString()
      }).select().single();

      if (error) throw error;

      setTrails([data, ...trails]);
      toast({ title: "Trilha Criada!" });
      setIsCreateDialogOpen(false);
      setNewTrail({ title: "", category: "", description: "" });
    } catch (err: any) {
      let errorMsg = err.message;
      if (err.message.includes('violates row level security')) {
        errorMsg = "Bloqueio de Segurança (RLS). Desative o RLS no console do Supabase.";
      }
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (errorState === "missing_table") {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-white rounded-[2rem] shadow-xl border-2 border-dashed border-accent/20">
        <AlertCircle className="h-12 w-12 text-accent mb-4 animate-pulse" />
        <h2 className="text-2xl font-black text-primary italic">Configuração Pendente</h2>
        <p className="text-muted-foreground mt-2 max-w-md font-medium">
          A tabela <code className="bg-muted px-2 py-1 rounded">learning_trails</code> não foi encontrada no seu projeto Supabase. 
        </p>
        <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  if (errorState === "rls_error") {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-white rounded-[2rem] shadow-xl border-2 border-dashed border-red-200">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-primary italic">Bloqueio de Segurança (RLS)</h2>
        <p className="text-muted-foreground mt-2 max-w-md font-medium">
          O Supabase está bloqueando o acesso devido a políticas de segurança (RLS). 
          Vá no SQL Editor e execute: <code className="bg-muted px-2 py-1 rounded">ALTER TABLE learning_trails DISABLE ROW LEVEL SECURITY;</code>
        </p>
        <Button variant="outline" className="mt-6 border-red-200 text-red-600" onClick={() => window.location.reload()}>Verificar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Gestão de Trilhas</h1>
          <p className="text-muted-foreground font-medium">Administre caminhos pedagógicos no Supabase.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl">
              <Plus className="h-6 w-6 mr-2" /> Nova Trilha Digital
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-10 bg-white max-w-lg">
            <DialogHeader><DialogTitle className="text-2xl font-black italic">Configurar Trilha</DialogTitle></DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Título</Label>
                <Input placeholder="Ex: Fundamentos de IA" className="h-12 rounded-xl bg-muted/30 border-none font-bold" value={newTrail.title} onChange={(e) => setNewTrail({ ...newTrail, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Categoria</Label>
                <Input placeholder="Ex: Tecnologia" className="h-12 rounded-xl bg-muted/30 border-none font-bold" value={newTrail.category} onChange={(e) => setNewTrail({ ...newTrail, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Descrição</Label>
                <Textarea placeholder="O que o aluno aprenderá?" className="min-h-[120px] rounded-xl bg-muted/30 border-none font-medium" value={newTrail.description} onChange={(e) => setNewTrail({ ...newTrail, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTrail} disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl">
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Criar Trilha"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Pesquisar entre suas trilhas..." className="pl-12 h-14 bg-white border-none shadow-xl rounded-[1.25rem] italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="h-12 w-12 animate-spin text-accent" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trails.map((trail) => (
            <Card key={trail.id} className="border-none shadow-xl overflow-hidden group bg-white rounded-[2.5rem] flex flex-col">
              <div className="relative aspect-video bg-muted overflow-hidden">
                <Image src={trail.image_url || `https://picsum.photos/seed/trail-${trail.id}/600/400`} alt={trail.title} fill className="object-cover" />
                <div className="absolute top-4 left-4">
                  <Badge className={`${trail.status === 'active' ? 'bg-green-600' : 'bg-orange-500'} text-white border-none px-4 py-1 font-black text-[10px] uppercase`}>
                    {trail.status === 'active' ? 'PUBLICADA' : 'RASCUNHO'}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-8 pb-4">
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{trail.category}</span>
                <CardTitle className="text-xl font-black italic truncate mt-2">{trail.title}</CardTitle>
              </CardHeader>
              <CardFooter className="p-8 pt-4 border-t border-muted/10 mt-auto flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Gerenciar</span>
                <Button variant="ghost" className="text-accent font-black text-[10px] uppercase" asChild>
                  <Link href={`/dashboard/teacher/trails/${trail.id}`}>Painel <LayoutDashboard className="h-4 w-4 ml-2" /></Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {trails.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center opacity-40">
              <p className="font-black italic">Nenhuma trilha encontrada.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
