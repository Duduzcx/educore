
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertCircle, UserCircle, Send, Filter, ShieldCheck, Clock, Download } from "lucide-react";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function TeacherStudentsPage() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "at_risk" | "financial_aid">("all");
  const firestore = useFirestore();

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users");
  }, [firestore, user]);

  const { data: students, isLoading } = useCollection(studentsQuery);

  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "at_risk") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && (!student.lastAccess || new Date(student.lastAccess) < sevenDaysAgo);
    }
    
    if (activeFilter === "financial_aid") {
      return matchesSearch && student.isFinancialAidEligible === true;
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-primary italic leading-none">Meus Alunos</h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">Gestão individualizada da rede.</p>
        </div>
        <Button variant="outline" className="rounded-xl h-10 md:h-11 border-primary/20 bg-white text-xs md:text-sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Button 
          onClick={() => setActiveFilter("all")}
          variant={activeFilter === "all" ? "default" : "outline"} 
          className="h-14 md:h-16 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest gap-2 md:gap-3 shadow-sm"
        >
          <UserCircle className="h-4 w-4 md:h-5 md:w-5" />
          Todos
        </Button>
        <Button 
          onClick={() => setActiveFilter("at_risk")}
          variant={activeFilter === "at_risk" ? "default" : "outline"}
          className={`h-14 md:h-16 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest gap-2 md:gap-3 shadow-sm ${activeFilter === "at_risk" ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200'}`}
        >
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
          Risco
        </Button>
        <Button 
          onClick={() => setActiveFilter("financial_aid")}
          variant={activeFilter === "financial_aid" ? "default" : "outline"}
          className={`h-14 md:h-16 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest gap-2 md:gap-3 shadow-sm ${activeFilter === "financial_aid" ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-200'}`}
        >
          <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
          Isenção
        </Button>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar..." 
            className="h-14 md:h-16 pl-12 bg-white border-none shadow-sm rounded-2xl focus-visible:ring-accent text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl md:rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="bg-muted/10 p-6 md:p-8">
          <CardTitle className="text-base md:text-lg font-bold text-primary flex items-center gap-2">
            <Filter className="h-4 w-4 md:h-5 md:w-5 text-accent" />
            Listagem de Estudantes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow className="border-none">
                    <TableHead className="px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] tracking-widest text-primary/50">Estudante</TableHead>
                    <TableHead className="font-black uppercase text-[9px] md:text-[10px] tracking-widest text-primary/50">Perfil</TableHead>
                    <TableHead className="font-black uppercase text-[9px] md:text-[10px] tracking-widest text-primary/50">Instituição</TableHead>
                    <TableHead className="font-black uppercase text-[9px] md:text-[10px] tracking-widest text-primary/50">Último Acesso</TableHead>
                    <TableHead className="font-black uppercase text-[9px] md:text-[10px] tracking-widest text-primary/50 text-right px-6 md:px-8">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id} className="border-b last:border-0 hover:bg-accent/5 transition-colors group">
                        <TableCell className="px-6 md:px-8 py-4 md:py-6">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs md:text-sm">
                              {student.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-black text-primary text-xs md:text-sm leading-none mb-1">{student.name}</p>
                              <p className="text-[9px] md:text-[10px] text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${student.profileType === 'etec' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'} border-none font-bold text-[8px] md:text-[10px] uppercase tracking-widest`}>
                            {student.profileType === 'etec' ? 'ETEC' : 'UNI'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] md:text-xs font-bold text-primary/70">{student.institution || student.schoolName || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {student.lastAccess ? new Date(student.lastAccess).toLocaleDateString() : "Nunca"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6 md:px-8">
                          <Button variant="ghost" size="icon" className="rounded-full text-accent hover:bg-accent hover:text-white transition-all shadow-sm h-8 w-8 md:h-9 md:w-9">
                            <Send className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30">
                          <UserCircle className="h-10 w-10 md:h-12 md:w-12 mb-3" />
                          <p className="font-black uppercase tracking-widest text-[8px] md:text-[10px]">Vazio</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
