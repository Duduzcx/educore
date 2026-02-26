
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, ShieldCheck, Loader2, ClipboardCheck, BrainCircuit } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/app/lib/supabase";

const COLORS = ["#1a2c4b", "#f59e0b", "#64748b", "#94a3b8", "#cbd5e1"];

export default function TeacherAnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgScore: 0,
    totalSimulations: 0
  });
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [engagementByClass, setEngagementByClass] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Contagem Total de Alunos
        const { count: studentsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('profile_type', 'student');

        // 2. Dados de Simulados Reais
        const { data: attempts } = await supabase
          .from('simulation_attempts')
          .select('score, total_questions, subject:subjects(name)');

        if (attempts && attempts.length > 0) {
          const totalAttempts = attempts.length;
          const totalScore = attempts.reduce((acc, curr) => acc + (curr.score / curr.total_questions), 0);
          
          // Agrupar por matéria
          const subjectMap: Record<string, { total: number, count: number }> = {};
          attempts.forEach(att => {
            const name = (att.subject as any)?.name || 'Outros';
            if (!subjectMap[name]) subjectMap[name] = { total: 0, count: 0 };
            subjectMap[name].total += (att.score / att.total_questions) * 100;
            subjectMap[name].count += 1;
          });

          const formattedSubjectPerf = Object.entries(subjectMap).map(([name, data]) => ({
            name,
            performance: Math.round(data.total / data.count)
          })).sort((a, b) => b.performance - a.performance);

          setSubjectPerformance(formattedSubjectPerf);
          setStats({
            totalStudents: studentsCount || 0,
            avgScore: Math.round((totalScore / totalAttempts) * 100),
            totalSimulations: totalAttempts
          });
        } else {
          setStats(prev => ({ ...prev, totalStudents: studentsCount || 0 }));
        }

        // 3. Engajamento por Turma (Mock para apresentação, mas estrutura pronta)
        setEngagementByClass([
          { name: "Turma Alpha", value: 85 },
          { name: "Turma Beta", value: 62 },
          { name: "Turma Delta", value: 45 },
        ]);

      } catch (e) {
        console.error("Erro ao carregar inteligência de dados:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [user]);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin h-12 w-12 text-accent" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Processando Big Data...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Inteligência Pedagógica (BI)</h1>
          <p className="text-muted-foreground font-medium">Desempenho consolidado da rede em tempo real.</p>
        </div>
        <Badge className="bg-accent/10 text-accent font-black px-4 py-2 border-none flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          SISTEMA MONITORADO
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-primary text-white overflow-hidden rounded-[2.5rem] p-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-black">{stats.totalStudents}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Alunos na Rede</p>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem] p-8 group">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center shadow-inner group-hover:bg-accent group-hover:text-white transition-all">
              <ClipboardCheck className="h-8 w-8 text-accent group-hover:text-white" />
            </div>
            <div>
              <p className="text-3xl font-black text-primary">{stats.avgScore}%</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Média de Acertos</p>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem] p-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center">
              <BrainCircuit className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-black text-primary">{stats.totalSimulations}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Simulados Feitos</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-10 pb-0">
            <CardTitle className="text-xl font-black text-primary italic flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-accent" />
              Performance por Matéria
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            {subjectPerformance.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="performance" fill="hsl(var(--primary))" radius={[0, 10, 10, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center opacity-20 border-4 border-dashed rounded-[2rem]">
                <BrainCircuit className="h-12 w-12 mb-4" />
                <p className="font-black italic">Aguardando dados de simulados...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-10 pb-0 text-center">
            <CardTitle className="text-xl font-black text-primary italic">Interesses de Carreira</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[
                      { name: "Tecnologia", value: 45 },
                      { name: "Saúde", value: 25 },
                      { name: "Engenharia", value: 15 },
                      { name: "Humanas", value: 15 },
                    ]} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={80} 
                    outerRadius={120} 
                    paddingAngle={8} 
                    dataKey="value"
                  >
                    {[0,1,2,3,4].map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
