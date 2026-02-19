
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
  BarChart3, 
  ArrowUpRight, 
  Clock, 
  BookOpen,
  Filter
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Line, LineChart, CartesianGrid } from "recharts";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/app/lib/supabase";

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
  const { user, profile, loading: isUserLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    completionRate: 78,
    avgScore: 8.4
  });

  useEffect(() => {
    async function fetchAdminStats() {
      setLoading(true);
      // Simulação de busca de dados reais
      setTimeout(() => {
        setStats({
          totalStudents: 1250,
          totalTeachers: 42,
          completionRate: 82,
          avgScore: 8.7
        });
        setLoading(false);
      }, 1000);
    }
    fetchAdminStats();
  }, []);

  if (isUserLoading || loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando Gestão 360...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Dashboard Termômetro</h1>
          <p className="text-muted-foreground font-medium">Educori 360 • Visão Geral da Rede</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-dashed border-primary/20">
            <Filter className="h-4 w-4 mr-2" /> Filtrar Polo
          </Button>
          <Button className="rounded-xl h-11 bg-accent text-accent-foreground font-black shadow-xl" asChild>
            <Link href="/dashboard/teacher/analytics">Relatório Completo</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Alunos Ativos", value: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
          { label: "Corpo Docente", value: stats.totalTeachers, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50", trend: "+2" },
          { label: "Taxa de Conclusão", value: `${stats.completionRate}%`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", trend: "+5%" },
          { label: "Média Global", value: stats.avgScore, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", trend: "+0.3" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden group hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-none font-black text-[10px]">{stat.trend}</Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-primary leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-primary italic">Fluxo de Engajamento</CardTitle>
                <CardDescription className="font-medium">Acessos e resoluções de quizzes (Últimos 7 dias)</CardDescription>
              </div>
              <BarChart3 className="h-6 w-6 text-accent opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
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
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-black truncate italic">{alerta.name}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${alerta.severity === 'high' ? 'text-red-400' : 'text-accent'}`}>{alerta.reason}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/40 hover:text-white" asChild>
                    <Link href="/dashboard/admin/students"><ArrowUpRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              ))}
              <Button className="w-full h-12 rounded-xl bg-accent text-accent-foreground font-black text-[10px] uppercase shadow-lg">
                Ver Central de Intervenção
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8">
            <h3 className="text-xs font-black text-primary/40 uppercase tracking-[0.2em] mb-4">Trilhas Gargalo</h3>
            <div className="space-y-4">
              {[
                { title: 'Física: Eletrostática', drop: '45% abandono' },
                { title: 'Matemática: Funções', drop: 'Média 4.2' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-black text-primary text-xs italic">{i+1}</div>
                  <div>
                    <p className="text-xs font-black text-primary italic leading-none">{t.title}</p>
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
