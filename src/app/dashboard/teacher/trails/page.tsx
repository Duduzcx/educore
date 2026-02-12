"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, LayoutDashboard, Search, Loader2, AlertCircle, FlaskConical, Database, Eye, Globe, Lock, Sparkles } from "lucide-react";
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

  const fetchTrails = async () => {
    if (!user) return;
    setLoading(true);
    setErrorState("none");
    
    const { data, error } = await supabase
      .from('learning_trails')
      .select('id, title, category, description, status, image_url, teacher_id, teacher_name')
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
  };

  useEffect(() => {
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
      toast({ title: "Trilha Criada em Rascunho!" });
      setIsCreateDialogOpen(false);
      setNewTrail({ title: "", category: "", description: "" });
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateTopics = () => {
    // Lógica para chamar a IA generativa será implementada aqui.
    toast({ title: "Funcionalidade em desenvolvimento", description: "Em breve, a IA irá sugerir tópicos para você." });
  };

  const handleSeedTrails = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const { data: trailsData, error: trailsError } = await supabase.from('learning_trails').insert([
        {
          title: "IA Generativa: Do Zero ao Avançado",
          category: "Tecnologia",
          description: "Domine as ferramentas de Inteligência Artificial que estão transformando o mercado de trabalho.",
          teacher_id: user.id,
          teacher_name: user.user_metadata?.full_name || "Professor Demo",
          status: "active",
          image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
          created_at: new Date().toISOString()
        },
        {
          title: "Matemática ENEM: Foco em Aprovação",
          category: "Matemática",
          description: "Revisão intensiva dos temas com maior recorrência no exame nacional.",
          teacher_id: user.id,
          teacher_name: user.user_metadata?.full_name || "Professor Demo",
          status: "active",
          image_url: "https://images.unsplash.com/photo-1613563696452-c7239f5ae99c?auto=format&fit=crop&q=80&w=800",
          created_at: new Date().toISOString()
        }
      ]).select();

      if (trailsError) throw trailsError;

      for (const trail of trailsData || []) {
        const { data: moduleData, error: moduleError } = await supabase.from('learning_modules').insert({
          trail_id: trail.id,
          title: "Unidade 1: Fundamentos e Visão Geral",
          order_index: 0,
          created_at: new Date().toISOString()
        }).select().single();

        if (moduleError || !moduleData) continue;

        await supabase.from('learning_contents').insert([
          {
            module_id: moduleData.id,
            title: "Aula 01 - Introdução e Boas-vindas",
            type: "video",
            url: "y6U-XRymBlU",
            description: "Nesta aula inaugural, o mentor apresenta o roteiro da trilha e os principais conceitos abordados.",
            created_at: new Date().toISOString()
          },
          {
            module_id: moduleData.id,
            title: "Material de Apoio: Guia do Estudante",
            type: "text",
            description: "Este guia contém os pontos chaves discutidos na aula em vídeo. Recomendamos a leitura atenta.",
            created_at: new Date().toISOString()
          }
        ]);
      }
      
      toast({ 
        title: "Estrutura Digital Gerada!", 
        description: "Trilhas ativas, módulos e aulas completas foram adicionados ao seu perfil." 
      });
      fetchTrails();
    } catch (err: any) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "Erro no Processamento", 
        description: "Verifique seu banco de dados." 
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
        <p className="text-muted-foreground mt-2 max-w-md font-medium">A tabela learning_trails não foi encontrada no banco de dados.</p>
        <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Gestão de Trilhas</h1>
          <p className="text-muted-foreground font-medium">Administre caminhos pedagógicos e publique para a rede.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSeedTrails} 
            disabled={isSubmitting}
            className="rounded-xl h-14 border-dashed border-accent text-accent font-black hover:bg-accent/5 px-6 shadow-sm"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <FlaskConical className="h-5 w-5 mr-2" />}
            Gerar Trilhas Ativas (Demos)
          </Button>
          
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
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase opacity-40">Título da Trilha</Label>
                    <Button variant="ghost" size="sm" onClick={handleGenerateTopics} className="text-xs text-accent font-bold hover:bg-accent/10">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Tópicos com IA
                    </Button>
                  </div>
                  <Input placeholder="Ex: Fundamentos de IA" className="h-12 rounded-xl bg-muted/30 border-none font-bold" value={newTrail.title} onChange={(e) => setNewTrail({ ...newTrail, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Categoria</Label>
                  <Input placeholder="Ex: Tecnologia" className="h-12 rounded-xl bg-muted/30 border-none font-bold" value={newTrail.category} onChange={(e) => setNewTrail({ ...newTrail, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Descrição Geral</Label>
                  <Textarea placeholder="O que o aluno aprenderá nesta jornada?" className="min-h-[120px] rounded-xl bg-muted/30 border-none font-medium" value={newTrail.description} onChange={(e) => setNewTrail({ ...newTrail, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateTrail} disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-xl">
                  {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Criar Trilha Pedagógica"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Pesquisar entre suas trilhas..." className="pl-12 h-14 bg-white border-none shadow-xl rounded-[1.25rem] italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sincronizando Banco de Dados...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trails.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map((trail) => {
            const isActive = trail.status === 'active';
            
            return (
              <Card key={trail.id} className="border-none shadow-xl overflow-hidden group bg-white rounded-[2.5rem] flex flex-col hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <Image src={trail.image_url || `https://picsum.photos/seed/trail-${trail.id}/600/400`} alt={trail.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${isActive ? 'bg-green-600' : 'bg-orange-500'} text-white border-none px-4 py-1 font-black text-[10px] uppercase shadow-lg flex items-center gap-2`}>
                      {isActive ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {isActive ? 'PÚBLICA' : 'RASCUNHO'}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-8 pb-4">
                  <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{trail.category}</span>
                  <CardTitle className="text-xl font-black italic truncate mt-2 group-hover:text-accent transition-colors">{trail.title}</CardTitle>
                </CardHeader>
                <CardFooter className="p-8 pt-4 border-t border-muted/10 mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-accent hover:bg-accent/10" asChild title="Simular Visão do Aluno">
                      <Link href={`/dashboard/classroom/${trail.id}`}>
                        <Eye className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                  <Button variant="ghost" className="text-accent font-black text-[10px] uppercase group/btn" asChild>
                    <Link href={`/dashboard/teacher/trails/${trail.id}`}>Gerenciar <LayoutDashboard className="h-4 w-4 ml-2 group-hover/btn:rotate-12 transition-transform" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {trails.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-muted/20 rounded-[3rem] bg-muted/5 animate-in fade-in duration-1000">
              <Database className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="font-black text-primary italic text-xl">Nenhuma trilha encontrada</p>
              <p className="text-muted-foreground font-medium mt-2">Inicie uma nova trilha ou gere as demos acima.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
