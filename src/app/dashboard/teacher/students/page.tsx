
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertCircle, UserCircle, Send, Filter, ShieldCheck, Clock, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "at_risk" | "financial_aid">("all");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error) setStudents(data || []);
      setLoading(false);
    }
    fetchStudents();
  }, [user]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "at_risk") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && (!student.last_access || new Date(student.last_access) < sevenDaysAgo);
    }
    
    if (activeFilter === "financial_aid") {
      return matchesSearch && student.is_financial_aid_eligible === true;
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-primary italic leading-none">Meus Alunos</h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">Gestão baseada em dados do Supabase.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Button onClick={() => setActiveFilter("all")} variant={activeFilter === "all" ? "default" : "outline"} className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2">
          <UserCircle className="h-4 w-4" /> Todos
        </Button>
        <Button onClick={() => setActiveFilter("at_risk")} variant={activeFilter === "at_risk" ? "default" : "outline"} className={`h-14 rounded-2xl font-black text-[10px] uppercase gap-2 ${activeFilter === "at_risk" ? 'bg-red-600' : 'text-red-600'}`}>
          <AlertCircle className="h-4 w-4" /> Risco
        </Button>
        <Button onClick={() => setActiveFilter("financial_aid")} variant={activeFilter === "financial_aid" ? "default" : "outline"} className={`h-14 rounded-2xl font-black text-[10px] uppercase gap-2 ${activeFilter === "financial_aid" ? 'bg-green-600' : 'text-green-600'}`}>
          <ShieldCheck className="h-4 w-4" /> Isenção
        </Button>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." className="h-14 pl-12 bg-white border-none shadow-sm rounded-2xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/5">
                    <TableRow className="border-none">
                      <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-primary/50">Estudante</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-primary/50">Instituição</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-primary/50">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="border-b last:border-0 hover:bg-accent/5 transition-colors group">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{student.name?.charAt(0) || "U"}</div>
                            <div>
                              <p className="font-black text-primary text-sm leading-none mb-1">{student.name}</p>
                              <p className="text-[10px] text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-primary/70">{student.institution || "-"}</TableCell>
                        <TableCell className="text-right px-8">
                          <Button variant="ghost" size="icon" className="rounded-full text-accent hover:bg-accent hover:text-white transition-all">
                            <Send className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
