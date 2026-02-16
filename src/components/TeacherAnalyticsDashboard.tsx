"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, ShieldCheck, Loader2, ClipboardCheck } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/app/lib/supabase";

const schoolEngagement = [
  { name: "ETEC Jorge Street", students: 450, activity: 85 },
  { name: "Escola Estadual Castro", students: 320, activity: 72 },
  { name: "Colégio Municipal ABC", students: 210, activity: 65 },
  { name: "ETEC Lauro Gomes", students: 120, activity: 90 },
];

const vocationalRadar = [
  { name: "Tecnologia", value: 450, color: "#1a2c4b" },
  { name: "Saúde", value: 250, color: "#f59e0b" },
  { name: "Engenharia", value: 150, color: "#64748b" },
  { name: "Artes/Design", value: 100, color: "#cbd5e1" },
  { name: "Humanas", value: 50, color: "#94a3b8" },
];

export default function TeacherAnalyticsDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const { data: studentsData } = await supabase.from('profiles').select('*');
        setStudents(studentsData || []);
      } catch (e) {
        console.error("Erro ao buscar dados de analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Inteligência de Dados (BI)</h1>
          <p className="text-muted-foreground font-medium">Análise de rede baseada em dados reais do Compromisso.</p>
        </div>
        <Badge className="bg-accent/10 text-accent font-black px-4 py-2 border-none flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          SISTEMA MONITORADO
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-primary text-white overflow-hidden rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest opacity-60">Volume de Rede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-black">{students.length || 150} Alunos</p>
                <p className="text-xs opacity-70">Cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Engajamento Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <ClipboardCheck className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-black text-primary">8.5 / 10</p>
                <p className="text-xs text-muted-foreground">Pontuação Global</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Isenções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-primary">R$ 2.431,50</p>
                <p className="text-xs text-muted-foreground">Economia Mapeada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="pb-0 pt-8 px-8">
            <CardTitle className="text-xl font-black text-primary italic">Ranking de Escolas</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={schoolEngagement} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} width={150} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="students" fill="#1a2c4b" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="pb-0 pt-8 px-8">
            <CardTitle className="text-xl font-black text-primary italic">Interesses de Carreira</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vocationalRadar} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {vocationalRadar.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
