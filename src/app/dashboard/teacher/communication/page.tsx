
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Bell, Send, Trash2, Loader2, Sparkles, AlertTriangle, Info, ShieldAlert, Eye, FlaskConical } from "lucide-react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc, orderBy, query } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function TeacherCommunicationPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal" as "banner" | "popup" | "normal" | "fullscreen"
  });

  const noticesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "notices"), orderBy("createdAt", "desc"));
  }, [firestore, user]);

  const { data: notices, isLoading: isNoticesLoading } = useCollection(noticesQuery);

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content || !firestore || !user) return;

    setLoading(true);
    try {
      addDocumentNonBlocking(collection(firestore, "notices"), {
        ...form,
        author: user.displayName || "Coordenação Geral",
        readBy: [],
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Comunicado Enviado!",
        description: `O aviso foi publicado com sucesso.`
      });

      setForm({ title: "", content: "", priority: "normal" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestNotices = () => {
    if (!firestore || !user) return;
    
    const tests = [
      { title: "📚 Biblioteca Atualizada", content: "Novos livros de matemática e física foram adicionados ao acervo digital.", priority: "normal" },
      { title: "⚠️ Manutenção Programada", content: "O portal passará por manutenção para atualização de BI às 23h de hoje.", priority: "banner" },
      { title: "🔔 Lembrete de Redação", content: "Não esqueça de enviar sua redação semanal. O tema é Sustentabilidade Urbana.", priority: "popup" },
      { title: "🚨 ALERTA MÁXIMA: Protocolo de Segurança", content: "É obrigatório confirmar que você leu o novo manual de segurança digital e boas práticas do portal para continuar acessando o conteúdo. Esta confirmação tem validade jurídica junto à Secretaria.", priority: "fullscreen" }
    ];

    tests.forEach(t => {
      addDocumentNonBlocking(collection(firestore, "notices"), {
        ...t,
        author: user.displayName || "Coordenação de Teste",
        readBy: [],
        createdAt: new Date().toISOString()
      });
    });

    toast({ title: "Modo de Teste Ativado", description: "Verifique o Dashboard do Aluno para ver os 4 níveis de aviso." });
  };

  const handleDeleteNotice = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "notices", id));
      toast({ title: "Comunicado removido" });
    } catch (e) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-500 pb-20">
      <div className="lg:col-span-2 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-primary italic leading-none">Mural de Avisos</h1>
          <p className="text-muted-foreground font-medium">Crie e gerencie comunicados estratégicos.</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden border-t-8 border-accent">
          <CardHeader className="bg-primary text-white p-8">
            <CardTitle className="text-xl font-bold flex items-center gap-3 italic">
              <Sparkles className="h-6 w-6 text-accent" />
              Novo Comunicado
            </CardTitle>
            <CardDescription className="text-white/60">Escolha o nível de impacto para o aluno.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSendNotice} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Título do Aviso</Label>
                <Input 
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="Ex: Prazo para Isenção" 
                  className="h-12 rounded-xl bg-muted/30 border-none font-bold"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Nível de Prioridade</Label>
                <Select value={form.priority} onValueChange={(v: any) => setForm({...form, priority: v})}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none font-bold">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="normal" className="font-bold">Normal (Mural)</SelectItem>
                    <SelectItem value="banner" className="font-bold">⚠️ Banner (Topo)</SelectItem>
                    <SelectItem value="popup" className="font-bold">🔔 Pop-up (Destaque)</SelectItem>
                    <SelectItem value="fullscreen" className="font-bold text-red-600">🚨 TELA CHEIA (Interrupção Crítica)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Conteúdo do Comunicado</Label>
                <Textarea 
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                  placeholder="Descreva as orientações oficiais..." 
                  className="min-h-[150px] rounded-xl bg-muted/30 border-none resize-none p-4 font-medium"
                />
              </div>

              <div className="grid gap-4 pt-4">
                <Button type="submit" disabled={loading} className="w-full bg-primary text-white font-black h-14 rounded-2xl shadow-xl transition-all active:scale-95">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                  Publicar Comunicado
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleCreateTestNotices}
                  className="w-full h-12 rounded-xl border-dashed gap-2 font-black text-[10px] uppercase text-accent hover:bg-accent/5"
                >
                  <FlaskConical className="h-4 w-4" />
                  Gerar Todos para Teste
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-primary italic">Comunicados Ativos</h2>
          <Badge className="bg-primary/5 text-primary border-none font-bold">{notices?.length || 0} avisos</Badge>
        </div>

        <div className="space-y-4">
          {isNoticesLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
          ) : notices && notices.length > 0 ? (
            notices.map((notice) => (
              <Card key={notice.id} className={`border-none shadow-xl rounded-3xl bg-white overflow-hidden hover:shadow-2xl transition-all group ${notice.priority === 'fullscreen' ? 'border-l-8 border-red-600' : ''}`}>
                <CardHeader className="p-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      notice.priority === 'banner' ? 'bg-orange-50 text-orange-600' : 
                      notice.priority === 'popup' ? 'bg-accent/10 text-accent' : 
                      notice.priority === 'fullscreen' ? 'bg-red-50 text-red-600' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {notice.priority === 'banner' ? <AlertTriangle className="h-6 w-6" /> : 
                       notice.priority === 'popup' ? <Bell className="h-6 w-6" /> : 
                       notice.priority === 'fullscreen' ? <ShieldAlert className="h-6 w-6" /> :
                       <Info className="h-6 w-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-primary leading-tight italic">{notice.title}</CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">
                        {notice.priority.toUpperCase()} • {new Date(notice.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="opacity-0 group-hover:opacity-100 rounded-full text-muted-foreground hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-8 pb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-4">{notice.content}</p>
                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary/40" />
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                        {notice.readBy?.length || 0} Alunos Confirmaram
                      </span>
                    </div>
                    {notice.priority === 'fullscreen' && (
                      <Badge className="bg-red-600 text-white border-none font-black text-[8px] uppercase px-2 py-0.5 animate-pulse">Registro Obrigatório</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-32 text-center border-4 border-dashed border-muted/20 rounded-[3rem] bg-muted/5">
              <Bell className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-black text-primary italic">Nenhum comunicado ativo</h3>
              <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">Sua rede está silenciosa agora. Que tal enviar um aviso de boas-vindas?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
