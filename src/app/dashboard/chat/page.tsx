"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserCircle, Loader2, Sparkles, Send, Users, BookOpen, School, Bot } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function ChatListPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      
      // Busca cirúrgica apenas dos campos necessários
      const [profilesRes, teachersRes] = await Promise.all([
        supabase.from('profiles').select('id, name, course').limit(50),
        supabase.from('teachers').select('id, name, subjects').limit(50)
      ]);
      
      setStudents(profilesRes.data || []);
      setTeachers(teachersRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const allContacts = [
    ...(students || []).map(s => ({ ...s, type: 'student', expertise: s.course || 'Estudante' })),
    ...(teachers || []).map(t => ({ ...t, type: 'teacher', expertise: t.subjects || 'Mentor' }))
  ].filter(c => c.id !== user?.id);

  const filteredContacts = allContacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-full mx-auto px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-primary italic leading-none">Mentoria</h1>
          <p className="text-muted-foreground font-medium text-sm italic">Conecte-se com especialistas.</p>
        </div>
      </div>

      <div className="relative max-w-xl group w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors" />
        <Input 
          placeholder="Pesquisar mentor ou matéria..." 
          className="pl-12 h-12 md:h-14 bg-white border-none shadow-xl rounded-2xl text-sm md:text-lg font-medium italic focus-visible:ring-accent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-[0_10px_40px_-15px_hsl(var(--accent)/0.3)] rounded-[2.5rem] bg-primary text-white overflow-hidden group transition-all duration-500">
        <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 md:h-24 md:w-24 rounded-[2rem] bg-accent text-accent-foreground flex items-center justify-center shadow-2xl rotate-3">
              <Bot className="h-10 w-10 md:h-14 md:w-14" />
            </div>
            <div>
              <CardTitle className="text-xl md:text-3xl font-black italic">Aurora IA</CardTitle>
              <p className="text-white/60 font-medium text-xs md:text-base">Mentora Pedagógica 24/7 disponível agora.</p>
            </div>
          </div>
          <Button className="bg-white text-primary hover:bg-white/90 font-black h-12 md:h-14 px-8 md:px-10 rounded-2xl shadow-xl transition-all" asChild>
            <Link href="/dashboard/chat/aurora-ai">Conversar com a Aurora</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-accent" /></div>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-primary/5 shadow-2xl">
                    <AvatarImage src={`https://picsum.photos/seed/${contact.id}/200/200`} />
                    <AvatarFallback className="bg-primary text-white font-black text-2xl italic">{contact.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg md:text-xl font-black text-primary italic truncate max-w-[220px]">{contact.name}</CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{contact.expertise}</p>
                  </div>
                  <Button className="w-full bg-primary text-white hover:bg-primary/95 font-black h-12 rounded-2xl shadow-xl" asChild>
                    <Link href={`/dashboard/chat/${contact.id}`}>Iniciar Mentoria</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
