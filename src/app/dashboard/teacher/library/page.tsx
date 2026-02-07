
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Trash2, Loader2, Search, FileText, Video, FlaskConical } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeacherLibraryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "PDF",
    category: "Geral",
    url: "",
    description: ""
  });

  const fetchResources = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('library_items').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setResources(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar recursos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [user]);

  const handleAddOfficial = async () => {
    if (!resourceForm.title || !user) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('library_items').insert({
        ...resourceForm,
        status: "approved",
        author: user.user_metadata?.full_name || "Docente da Rede",
        user_id: user.id,
        created_at: new Date().toISOString(),
        image_url: `https://picsum.photos/seed/${encodeURIComponent(resourceForm.title)}/400/250`
      }).select().single();

      if (error) throw error;

      setResources([data, ...resources]);
      toast({ title: "Material Adicionado!" });
      setIsAddOpen(false);
      setResourceForm({ title: "", type: "PDF", category: "Geral", url: "", description: "" });
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao Salvar", 
        description: err.message.includes('library_items') 
          ? "Tabela 'library_items' não configurada. Execute o SQL de emergência." 
          : err.message 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedLibrary = async () => {
    if (!user) return;
    setIsSeeding(true);
    
    const demoItems = [
      {
        title: "Guia Definitivo: Citologia",
        type: "PDF",
        category: "Biologia",
        url: "https://example.com/citologia.pdf",
        description: "Um resumo visual completo sobre as organelas celulares.",
        status: "approved",
        author: user.user_metadata?.full_name || "Mentor Demo",
        user_id: user.id,
        created_at: new Date().toISOString(),
        image_url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=400"
      },
      {
        title: "Videoaula: Funções do 2º Grau",
        type: "Video",
        category: "Matemática",
        url: "https://youtube.com/watch?v=rfscVS0vtbw",
        description: "Domine as parábolas e raízes de forma definitiva.",
        status: "approved",
        author: user.user_metadata?.full_name || "Mentor Demo",
        user_id: user.id,
        created_at: new Date().toISOString(),
        image_url: "https://images.unsplash.com/photo-1613563696452-c7239f5ae99c?auto=format&fit=crop&q=80&w=400"
      },
      {
        title: "E-book: Revolução Industrial",
        type: "E-book",
        category: "História",
        url: "https://example.com/historia.pdf",
        description: "Impactos sociais e tecnológicos do século XIX.",
        status: "approved",
        author: user.user_metadata?.full_name || "Mentor Demo",
        user_id: user.id,
        created_at: new Date().toISOString(),
        image_url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400"
      }
    ];

    try {
      const { error } = await supabase.from('library_items').insert(demoItems);
      if (error) throw error;
      toast({ title: "Biblioteca Populada!", description: "3 novos itens oficiais adicionados." });
      fetchResources();
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro no Seed", 
        description: "Verifique se a tabela 'library_items' existe no seu banco de dados." 
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('library_items').delete().eq('id', id);
    if (!error) {
      setResources(resources.filter(r => r.id !== id));
      toast({ title: "Recurso removido" });
    }
  };

  const filteredResources = resources.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Gestão da Biblioteca</h1>
          <p className="text-muted-foreground font-medium">Curadoria do acervo digital no Supabase.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSeedLibrary} 
            disabled={isSeeding}
            className="rounded-xl h-14 border-dashed border-accent text-accent font-black hover:bg-accent/5 px-6 shadow-sm"
          >
            {isSeeding ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
            Gerar Acervo de Teste
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl">
                <Plus className="h-6 w-6 mr-2" /> Novo Material
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-lg bg-white">
              <DialogHeader><DialogTitle className="text-2xl font-black italic">Upload Oficial</DialogTitle></DialogHeader>
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Tipo</Label>
                    <Select value={resourceForm.type} onValueChange={(v) => setResourceForm({...resourceForm, type: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {["PDF", "Video", "E-book", "Artigo"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-40">Categoria</Label>
                    <Input value={resourceForm.category} onChange={(e) => setResourceForm({...resourceForm, category: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Título</Label>
                  <Input value={resourceForm.title} onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">URL</Label>
                  <Input value={resourceForm.url} onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-40">Resumo</Label>
                  <Textarea value={resourceForm.description} onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/30 border-none resize-none p-4" />
                </div>
              </div>
              <Button onClick={handleAddOfficial} disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl">
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Publicar Material"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Filtrar acervo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-14 bg-white border-none shadow-xl rounded-2xl font-medium italic" />
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-accent" /></div>
          ) : (
            <div className="grid gap-6">
              {filteredResources.map((item) => (
                <Card key={item.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
                  <div className="p-8 flex items-start gap-8">
                    <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center shrink-0">
                      {item.type === 'Video' ? <Video className="h-10 w-10" /> : <FileText className="h-10 w-10" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">{item.type} • {item.category}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="rounded-full text-muted-foreground hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <h3 className="text-xl font-black text-primary italic leading-none">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {resources.length === 0 && (
                <div className="p-20 text-center border-4 border-dashed border-muted/20 rounded-[2.5rem] bg-muted/5 opacity-40">
                  <BookOpen className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black italic text-xl">Acervo Vazio</p>
                  <p className="text-sm font-medium mt-2">Clique em "Gerar Acervo de Teste" para popular sua biblioteca.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-8 overflow-hidden relative">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center"><BookOpen className="h-6 w-6 text-accent" /></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">Total de Itens</p>
                  <p className="text-3xl font-black italic">{resources.length} Materiais</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
