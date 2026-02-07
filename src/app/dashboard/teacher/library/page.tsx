
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, CheckCircle2, ExternalLink, Trash2, Loader2, Search, FileText, Video, RadioTower, Clock } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeacherLibraryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [resourceForm, setResourceForm] = useState({
    title: "",
    type: "PDF",
    category: "Geral",
    url: "",
    description: ""
  });

  useEffect(() => {
    async function fetchResources() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase.from('library_items').select('*').order('created_at', { ascending: false });
      if (!error) setResources(data || []);
      setLoading(false);
    }
    fetchResources();
  }, [user]);

  const handleAddOfficial = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('library_items').insert({
      ...resourceForm,
      status: "approved",
      author: user.user_metadata?.full_name || "Docente da Rede",
      user_id: user.id,
      created_at: new Date().toISOString(),
      image_url: `https://picsum.photos/seed/${resourceForm.title}/400/250`
    }).select().single();

    if (!error) {
      setResources([data, ...resources]);
      toast({ title: "Material Adicionado!" });
      setIsAddOpen(false);
      setResourceForm({ title: "", type: "PDF", category: "Geral", url: "", description: "" });
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
            <Button onClick={handleAddOfficial} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl">Publicar Material</Button>
          </DialogContent>
        </Dialog>
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
