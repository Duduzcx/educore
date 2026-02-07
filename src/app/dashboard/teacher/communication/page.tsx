
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Trash2, Loader2, Sparkles, AlertTriangle, Info, ShieldAlert, Eye, FlaskConical } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function TeacherCommunicationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal" as "banner" | "popup" | "normal" | "fullscreen"
  });

  useEffect(() => {
    async function fetchNotices() {
      if (!user) return;
      setNoticesLoading(true);
      const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (!error) setNotices(data || []);
      setNoticesLoading(false);
    }
    fetchNotices();
  }, [user]);

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content || !user) return;

    setLoading(true);
    const { data, error } = await supabase.from('notices').insert({
      ...form,
      author: user.user_metadata?.full_name || "Coordenação Geral",
      read_by: [],
      created_at: new Date().toISOString()
    }).select().single();

    if (!error) {
      setNotices([data, ...notices]);
      toast({ title: "Comunicado Enviado!" });
      setForm({ title: "", content: "", priority: "normal" });
    }
    setLoading(false);
  };

  const handleDeleteNotice = async (id: string) => {
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (!error) {
      setNotices(notices.filter(n => n.id !== id));
      toast({ title: "Comunicado removido" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-500 pb-20">
      <div className="lg:col-span-2 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-primary italic leading-none">Mural de Avisos</h1>
          <p className="text-muted-foreground font-medium">Crie comunicados estratégicos no Supabase.</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden border-t-8 border-accent">
          <CardHeader className="bg-primary text-white p-8">
            <CardTitle className="text-xl font-bold flex items-center gap-3 italic">
              <Sparkles className="h-6 w-6 text-accent" />
              Novo Comunicado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSendNotice} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Título do Aviso</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Nível de Prioridade</Label>
                <Select value={form.priority} onValueChange={(v: any) => setForm({...form, priority: v})}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="normal">Normal (Mural)</SelectItem>
                    <SelectItem value="banner">⚠️ Banner (Topo)</SelectItem>
                    <SelectItem value="popup">🔔 Pop-up (Destaque)</SelectItem>
                    <SelectItem value="fullscreen">🚨 TELA CHEIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Conteúdo</Label>
                <Textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="min-h-[150px] rounded-xl bg-muted/30 border-none resize-none p-4" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-white font-black h-14 rounded-2xl shadow-xl">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5 mr-2" />}
                Publicar Comunicado
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-primary italic">Comunicados Ativos</h2>
          <Badge className="bg-primary/5 text-primary border-none font-bold">{notices.length} avisos</Badge>
        </div>

        <div className="space-y-4">
          {noticesLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>
          ) : notices.map((notice) => (
            <Card key={notice.id} className="border-none shadow-xl rounded-3xl bg-white overflow-hidden hover:shadow-2xl transition-all group">
              <CardHeader className="p-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${notice.priority === 'banner' ? 'bg-orange-50 text-orange-600' : notice.priority === 'popup' ? 'bg-accent/10 text-accent' : 'bg-blue-50 text-blue-600'}`}>
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-primary leading-tight italic">{notice.title}</CardTitle>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">{notice.priority.toUpperCase()}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteNotice(notice.id)} className="opacity-0 group-hover:opacity-100 rounded-full hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="px-8 pb-6">
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{notice.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
