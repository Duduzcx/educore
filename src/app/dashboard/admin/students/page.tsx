
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  AlertCircle, 
  UserCircle, 
  Send, 
  Filter, 
  ShieldCheck, 
  Loader2, 
  Users,
  GraduationCap,
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const mockCohorts = [
  { id: "c1", name: "Turma A - ETEC", total: 45, status: "active" },
  { id: "c2", name: "Reforço Matemática", total: 12, status: "active" },
  { id: "c3", name: "Vestibular Medicina", total: 30, status: "active" },
];

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Gestão de Cohorts</h1>
          <p className="text-muted-foreground font-medium">Administração de turmas e matrículas em lote.</p>
        </div>
        <Button className="rounded-xl h-12 bg-accent text-accent-foreground font-black shadow-xl">
          <Users className="h-4 w-4 mr-2" /> Criar Nova Turma
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockCohorts.map((cohort) => (
          <Card key={cohort.id} className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden group hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 font-black text-[10px]">ATIVO</Badge>
              </div>
              <div className="mt-4">
                <p className="text-xl font-black text-primary italic leading-none">{cohort.name}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{cohort.total} Alunos</p>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-accent" asChild>
                    <Link href={`/dashboard/admin/students/${cohort.id}`}>Ver Detalhes <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-muted/10 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-black text-primary italic">Lista Mestra de Alunos</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar aluno..." 
              className="pl-10 h-10 bg-muted/30 border-none rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-none">
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Estudante</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Turma</TableHead>
                <TableHead className="font-black uppercase text-[10px] tracking-widest">Engajamento</TableHead>
                <TableHead className="text-right px-8 font-black uppercase text-[10px] tracking-widest">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Ana Beatriz", cohort: "Turma A", engagement: "92%", status: "high" },
                { name: "Marcos Silva", cohort: "Reforço", engagement: "45%", status: "low" },
                { name: "Julia Costa", cohort: "Turma A", engagement: "78%", status: "medium" },
              ].map((student, i) => (
                <TableRow key={i} className="border-b last:border-0 hover:bg-accent/5 transition-colors group">
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-xs">{student.name.charAt(0)}</div>
                      <span className="font-black text-primary text-sm">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{student.cohort}</TableCell>
                  <TableCell>
                    <Badge className={`border-none font-black text-[8px] uppercase ${student.status === 'high' ? 'bg-green-100 text-green-700' : student.status === 'low' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {student.engagement}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Button variant="ghost" size="icon" className="rounded-xl text-accent"><Send className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
