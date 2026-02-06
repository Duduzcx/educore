
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FilePenLine, PlayCircle, TrendingUp, Bell, ArrowRight, Video, FileText, ClipboardCheck, Sparkles } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";
import { useUser, useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

const performanceData = [
  { name: "Seg", avg: 7.2 },
  { name: "Ter", avg: 8.5 },
  { name: "Qua", avg: 6.8 },
  { name: "Qui", avg: 9.1 },
  { name: "Sex", avg: 7.8 },
];

export default function TeacherHomePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Buscar total de alunos reais
  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users");
  }, [firestore, user]);
  const { data: students } = useCollection(studentsQuery);

  // Buscar alunos em risco (apoio social)
  const socialSupportQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users"), where("isFinancialAidEligible", "==", true));
  }, [firestore, user]);
  const { data: socialSupportAlunos } = useCollection(socialSupportQuery);

  // Buscar trilhas do professor na coleção GLOBAL
  const myTrailsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "learning_trails"), where("teacherId", "==", user.uid));
  }, [firestore, user]);
  const { data: myTrails } = useCollection(myTrailsQuery);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-primary italic">Painel de Gestão Docente</h1>
          <p className="text-muted-foreground font-medium">Controle pedagógico para a base de 1.000 alunos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-primary/20 bg-white" asChild>
            <Link href="/dashboard/teacher/communication">
              <Bell className="h-4 w-4 mr-2" />
              Mural Institucional
            </Link>
          </Button>
          <Button className="rounded-xl h-11 bg-accent text-accent-foreground font-black hover:bg-accent/90" asChild>
            <Link href="/dashboard/teacher/trails">Nova Trilha de Estudo</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Alunos", value: students?.length || "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Apoio Social", value: socialSupportAlunos?.length || "0", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Minhas Trilhas", value: myTrails?.length || "0", icon: PlayCircle, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Média Turma", value: "7.8", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl overflow-hidden group hover:shadow-2xl transition-all rounded-[2rem] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 shadow-sm`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest bg-muted/30">Tempo Real</Badge>
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
            <CardTitle className="text-xl font-black text-primary italic">Engajamento Semanal</CardTitle>
            <CardDescription className="font-medium">Média de desempenho da rede em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    content={({active, payload}) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-primary text-white p-3 rounded-xl shadow-xl border-none">
                            <p className="text-xs font-bold">{payload[0].payload.name}</p>
                            <p className="text-sm font-black text-accent">Média: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avg" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <CardHeader className="pb-2 p-8">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <Bell className="h-4 w-4 text-accent" />
                Busca Ativa (Social)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              {socialSupportAlunos && socialSupportAlunos.length > 0 ? (
                socialSupportAlunos.slice(0, 3).map((aluno, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10">
                    <div className="flex flex-col">
                      <span className="text-xs font-black truncate max-w-[120px] italic">{aluno.name}</span>
                      <span className="text-[8px] font-black text-accent uppercase tracking-widest">Elegível Isenção</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-accent hover:bg-white hover:text-primary transition-all px-3 rounded-lg" asChild>
                      <Link href="/dashboard/teacher/students">Orientar</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center">
                  <p className="text-[10px] font-black uppercase text-white/40">Nenhum alerta social hoje</p>
                </div>
              )}
              <Button asChild variant="secondary" className="w-full h-11 rounded-xl bg-accent text-accent-foreground font-black text-[10px] uppercase shadow-lg">
                <Link href="/dashboard/teacher/students">Ver Todos os Alunos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/40">Minhas Trilhas Gerenciadas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {myTrails && myTrails.length > 0 ? (
                  myTrails.slice(0, 3).map((trail, i) => (
                    <Link key={i} href={`/dashboard/teacher/trails/${trail.id}`} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors border-b last:border-0">
                      <div>
                        <p className="text-sm font-black text-primary italic truncate max-w-[180px]">{trail.title}</p>
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest px-2 mt-1">
                          {trail.status === 'active' ? 'Publicada' : 'Rascunho'}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Sem trilhas criadas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
