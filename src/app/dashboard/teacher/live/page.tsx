
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MonitorPlay, 
  Plus, 
  Trash2, 
  Youtube, 
  Loader2, 
  Search, 
  Clock, 
  Radio, 
  Globe, 
  ExternalLink,
  ShieldCheck,
  Video
} from "lucide-react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, deleteDoc, orderBy } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function TeacherLiveManagement() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [liveForm, setForm] = useState({
    title: "",
    description: "",
    youtubeId: "",
    startTime: ""
  });

  const livesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "lives"), where("teacherId", "==", user.uid), orderBy("startTime", "desc"));
  }, [firestore, user]);

  const { data: myLives, isLoading } = useCollection(livesQuery);

  const handleCreateLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveForm.title || !liveForm.youtubeId || !firestore || !user) return;

    setLoading(true);
    try {
      const scheduledTime = liveForm.startTime ? new Date(liveForm.startTime) : new Date();
      
      addDocumentNonBlocking(collection(firestore, "lives"), {
        title: liveForm.title,
        description: liveForm.description,
        teacherName: user.displayName || "Docente da Rede",
        teacherId: user.uid,
        youtubeId: liveForm.youtubeId,
        youtubeUrl: `https://www.youtube.com/watch?v=${liveForm.youtubeId}`,
        startTime: { seconds: Math.floor(scheduledTime.getTime() / 1000) },
        active: true,
        createdAt: new Date().toISOString()
      });

      toast({ title: "Aula Agendada!", description: "Os alunos já podem visualizar no mural." });
      setForm({ title: "", description: "", youtubeId: "", startTime: "" });
      setIsAddOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remover esta transmissão permanentemente?")) return;
    const ref = doc(firestore!, "lives", id);
    deleteDocumentNonBlocking(ref);
    toast({ title: "Transmissão removida." });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none flex items-center gap-3">
            Gerenciar Lives
            <MonitorPlay className="h-8 w-8 text-accent" />
          </h1>
          <p className="text-muted-foreground font-medium">Controle suas transmissões ao vivo para a rede EduCore.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 bg-primary text-white font-black px-8 shadow-xl active:scale-95 transition-all">
              <Plus className="h-6 w-6 mr-2" />
              Nova Transmissão
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-primary italic">Abrir Live</DialogTitle>
              <DialogDescription>Preencha os dados do YouTube para iniciar.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLive} className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Título do Aulão</Label>
                <Input 
                  value={liveForm.title} 
                  onChange={(e) => setForm({...liveForm, title: e.target.value})} 
                  placeholder="Ex: Revisão de Cálculo I" 
                  className="h-12 rounded-xl bg-muted/30 border-none font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">YouTube Video ID</Label>
                <div className="relative">
                  <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                  <Input 
                    value={liveForm.youtubeId} 
                    onChange={(e) => setForm({...liveForm, youtubeId: e.target.value})} 
                    placeholder="Ex: rfscVS0vtbw" 
                    className="h-12 pl-12 rounded-xl bg-muted/30 border-none font-bold"
                    required
                  />
                </div>
                <p className="text-[8px] text-muted-foreground font-bold px-2">O código após o "v=" na URL do vídeo.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Data e Hora de Início</Label>
                <Input 
                  type="datetime-local" 
                  value={liveForm.startTime} 
                  onChange={(e) => setForm({...liveForm, startTime: e.target.value})} 
                  className="h-12 rounded-xl bg-muted/30 border-none font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Descrição/Objetivos</Label>
                <Textarea 
                  value={liveForm.description} 
                  onChange={(e) => setForm({...liveForm, description: e.target.value})} 
                  className="min-h-[100px] rounded-xl bg-muted/30 border-none resize-none p-4"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-16 bg-accent text-accent-foreground font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Globe className="h-6 w-6 mr-2" />}
                Publicar Live na Rede
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-primary italic flex items-center gap-2 px-2">
            <Radio className="h-5 w-5 text-red-600" />
            Minhas Transmissões
          </h2>

          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-accent" /></div>
          ) : myLives?.length === 0 ? (
            <Card className="border-4 border-dashed rounded-[3rem] p-20 text-center opacity-30 bg-white/50">
              <Video className="h-16 w-16 mx-auto mb-4" />
              <p className="font-black italic text-xl">Você ainda não abriu nenhuma live.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {myLives?.map((live) => (
                <Card key={live.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden hover:shadow-2xl transition-all group">
                  <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative aspect-video w-full md:w-48 bg-black rounded-2xl overflow-hidden shadow-lg shrink-0">
                      <img src={`https://img.youtube.com/vi/${live.youtubeId}/mqdefault.jpg`} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Youtube className="h-10 w-10 text-red-600 drop-shadow-2xl" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-between">
                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">
                          {new Date(live.startTime.seconds * 1000).toLocaleDateString('pt-BR')} às {new Date(live.startTime.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-black text-primary italic leading-none">{live.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium line-clamp-1 italic">{live.description || "Sem descrição."}</p>
                      
                      <div className="pt-4 flex items-center justify-center md:justify-start gap-4">
                        <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 px-6 gap-2" asChild>
                          <a href={live.youtubeUrl} target="_blank"><ExternalLink className="h-4 w-4" /> Ver no YouTube</a>
                        </Button>
                        <Button onClick={() => handleDelete(live.id)} variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-red-500 transition-all">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-10 overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 italic">Segurança & BI</p>
                  <p className="text-2xl font-black italic">Monitoramento Ativo</p>
                </div>
              </div>
              <p className="text-sm font-medium opacity-80 leading-relaxed italic">
                "Suas transmissões são gravadas automaticamente pelo YouTube e vinculadas ao portfólio dos alunos."
              </p>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Dica do Tech Lead</p>
                <p className="text-[11px] font-medium opacity-60 italic">
                  Use sempre o ID do vídeo para garantir o carregamento do player integrado.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
