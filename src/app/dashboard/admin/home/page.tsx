
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Activity,
  BookOpen,
  Filter,
  ArrowUpRight,
  Zap,
  Database
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/app/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const engagementData = [
  { name: "Seg", acessos: 120, quizzes: 45 },
  { name: "Ter", acessos: 150, quizzes: 52 },
  { name: "Qua", acessos: 180, quizzes: 61 },
  { name: "Qui", acessos: 140, quizzes: 48 },
  { name: "Sex", acessos: 160, quizzes: 55 },
  { name: "Sáb", acessos: 90, quizzes: 20 },
  { name: "Dom", acessos: 70, quizzes: 15 },
];

export default function CoordinatorDashboard() {
  const { profile, loading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalTeachers: 42,
    completionRate: 82,
    avgScore: 8.7
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      // 1. Criar Trilha de Exemplo
      const { data: trail, error: tError } = await supabase.from('trails').insert([{
        title: "Redação Master: Rumo ao 1000",
        category: "Linguagens",
        description: "Domine a estrutura do texto dissertativo-argumentativo padrão ENEM com técnicas de argumentação e repertório sociocultural.",
        image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
        teacher_name: "Prof. Ana Lúcia",
        status: "published",
        target_audience: "all"
      }]).select().single();

      if (tError) throw tError;

      // 2. Criar Módulos
      const { data: module, error: mError } = await supabase.from('modules').insert([{
        trail_id: trail.id,
        title: "Fundamentos da Escrita",
        order_index: 0
      }]).select().single();

      if (mError) throw mError;

      // 3. Criar Conteúdos
      await supabase.from('learning_contents').insert([
        {
          module_id: module.id,
          title: "Introdução à Redação ENEM",
          type: "video",
          url: "https://www.youtube.com/watch?v=6X8De_m5ls0",
          description: "Aprenda como começar sua redação do zero seguindo as 5 competências.",
          order_index: 0
        },
        {
          module_id: module.id,
          title: "Guia de Conectivos (PDF)",
          type: "pdf",
          url: "https://www.ufsm.br/app/uploads/sites/416/2020/05/Guia-de-Conectivos.pdf",
          description: "Tabela completa de conectivos para usar no seu texto.",
          order_index: 1
        }
      ]);

      toast({ title: "Dados de Demonstração Criados!", description: "As trilhas funcionais já estão disponíveis para os alunos." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro ao gerar dados", description: e.message, variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isUserLoading || loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Sincronizando Gestão 360...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-primary italic leading-none">Gestão 360</h1>
            <Badge className="bg-primary text-white border-none font-black text-[10px] px-3 shadow-lg">CORE</Badge>
          </div>
          <p className="text-muted-foreground font-medium text-sm md:text-lg italic">Monitoramento térmico e analítico da rede.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSeedDemoData} 
            disabled={isSeeding}
            variant="outline" 
            className="rounded-xl h-12 border-dashed border-accent/40 bg-white hover:bg-accent/5 text-accent"
          >
            {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Gerar Trilhas Demo
          </Button>
          <Button className="rounded-xl h-12 bg-accent text-accent-foreground font-black shadow-xl hover:scale-105 transition-all" asChild>
            <Link href="/dashboard/teacher/analytics">Relatório Global</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Alunos Ativos", value: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
          { label: "Corpo Docente", value: stats.totalTeachers, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50", trend: "+2" },
          { label: "Taxa Conclusão", value: `${stats.completionRate}%`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", trend: "+5%" },
          { label: "Média Global", value: stats.avgScore, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", trend: "+0.3" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-none font-black text-[10px]">{stat.trend}</Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-primary leading-none italic">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden group">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-primary italic">Fluxo de Engajamento</CardTitle>
                <CardDescription className="font-medium">Acessos e resoluções de quizzes (7 dias)</CardDescription>
              </div>
              <Activity className="h-6 w-6 text-accent opacity-20 group-hover:animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="acessos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="quizzes" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <CardHeader className="pb-2 p-8">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-accent" />
                Alertas de Risco
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              {[
                { name: 'Ana Beatriz', reason: 'Inativa há 10 dias', severity: 'high' },
                { name: 'Marcos Silva', reason: 'Nota Quiz < 5.0', severity: 'medium' },
                { name: 'Julia Costa', reason: 'Evasão Detectada', severity: 'high' },
              ].map((alerta, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-black truncate italic group-hover:text-accent transition-colors">{alerta.name}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${alerta.severity === 'high' ? 'text-red-400' : 'text-accent'}`}>{alerta.reason}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/40 hover:text-white" asChild>
                    <Link href="/dashboard/admin/students"><ArrowUpRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              ))}
              <Button className="w-full h-12 rounded-xl bg-accent text-accent-foreground font-black text-[10px] uppercase shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform">
                Central de Intervenção
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8 overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-primary/40 uppercase tracking-[0.2em]">Trilhas Gargalo</h3>
              <Zap className="h-4 w-4 text-accent opacity-20 group-hover:animate-bounce" />
            </div>
            <div className="space-y-4">
              {[
                { title: 'Física: Eletrostática', drop: '45% abandono' },
                { title: 'Matemática: Funções', drop: 'Média 4.2' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-4 group/item">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-black text-primary text-xs italic shadow-inner group-hover/item:bg-primary group-hover/item:text-white transition-colors">{i+1}</div>
                  <div>
                    <p className="text-xs font-black text-primary italic leading-none group-hover/item:text-accent transition-colors">{t.title}</p>
                    <p className="text-[9px] font-bold text-red-500 uppercase mt-1">{t.drop}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
