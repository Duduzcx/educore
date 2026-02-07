
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  ChevronLeft, 
  Trash2, 
  FileText, 
  Loader2, 
  Layout, 
  Youtube, 
  Sparkles,
  Globe,
  Settings2,
  CheckCircle2,
  Eye,
  Link as LinkIcon,
  BookOpen,
  Flame
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TrailManagementPage() {
  const params = useParams();
  const trailId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [trail, setTrail] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  const [moduleForm, setModuleForm] = useState({ title: "" });
  const [contentForm, setContentForm] = useState({ title: "", type: "video", url: "", description: "" });

  useEffect(() => {
    async function loadTrailData() {
      if (!user || !trailId) return;
      setLoading(true);
      
      const { data: trailData } = await supabase.from('learning_trails').select('*').eq('id', trailId).single();
      setTrail(trailData);

      const { data: modulesData } = await supabase.from('learning_modules').select('*').eq('trail_id', trailId).order('order_index', { ascending: true });
      setModules(modulesData || []);
      
      setLoading(false);
    }
    loadTrailData();
  }, [user, trailId]);

  const handleAddModule = async () => {
    if (!moduleForm.title.trim() || !user) return;
    
    const { data, error } = await supabase.from('learning_modules').insert({
      trail_id: trailId,
      title: moduleForm.title,
      order_index: modules.length,
      created_at: new Date().toISOString()
    }).select().single();

    if (!error) {
      setModules([...modules, data]);
      toast({ title: "Módulo adicionado" });
      setModuleForm({ title: "" });
      setIsModuleDialogOpen(false);
    }
  };

  const handleAddContent = async () => {
    if (!activeModuleId || !user) return;
    
    const { error } = await supabase.from('learning_contents').insert({
      module_id: activeModuleId,
      title: contentForm.title,
      type: contentForm.type,
      url: contentForm.url,
      description: contentForm.description,
      created_at: new Date().toISOString()
    });

    if (!error) {
      toast({ title: "Material anexado!" });
      setContentForm({ title: "", type: "video", url: "", description: "" });
      setIsContentDialogOpen(false);
      setActiveModuleId(null);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-accent" /></div>;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-12 w-12"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary italic leading-none">{trail?.title}</h1>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{trail?.category}</p>
          </div>
        </div>
        <Button onClick={() => setIsModuleDialogOpen(true)} className="bg-accent text-accent-foreground font-black rounded-xl shadow-xl h-12 px-8">
          <Plus className="h-5 w-5 mr-2" /> Novo Módulo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {modules.map((mod, idx) => (
            <Card key={mod.id} className="border-none shadow-lg bg-white overflow-hidden rounded-[2.5rem]">
              <CardHeader className="bg-muted/5 p-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic shadow-lg">{idx + 1}</div>
                  <CardTitle className="text-xl font-black text-primary italic">{mod.title}</CardTitle>
                </div>
                <Button variant="ghost" onClick={() => { setActiveModuleId(mod.id); setIsContentDialogOpen(true); }} className="text-accent font-black text-[10px] uppercase">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Aula
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="rounded-[2rem] p-10 bg-white">
          <DialogHeader><DialogTitle className="text-2xl font-black italic">Novo Módulo</DialogTitle></DialogHeader>
          <div className="py-6">
            <Input placeholder="Título do Bloco" value={moduleForm.title} onChange={(e) => setModuleForm({title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold italic text-lg" />
          </div>
          <Button onClick={handleAddModule} className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl">Confirmar Módulo</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-md bg-white">
          <DialogHeader><DialogTitle className="text-2xl font-black italic">Anexar Material</DialogTitle></DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Tipo</Label>
              <Select value={contentForm.type} onValueChange={(v) => setContentForm({...contentForm, type: v})}>
                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="video">Videoaula</SelectItem>
                  <SelectItem value="pdf">Documento PDF</SelectItem>
                  <SelectItem value="text">Explicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">Título</Label>
              <Input value={contentForm.title} onChange={(e) => setContentForm({...contentForm, title: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-40">URL</Label>
              <Input value={contentForm.url} onChange={(e) => setContentForm({...contentForm, url: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none" />
            </div>
          </div>
          <Button onClick={handleAddContent} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl">Confirmar Aula</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
