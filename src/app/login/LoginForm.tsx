
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Mail, ChevronRight, Loader2, Sparkles, ShieldCheck, GraduationCap, UserCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fluxo de criação automática para contas Demo
        if (error.message.includes('Invalid login credentials') || error.message.includes('not found')) {
          const role = email.includes('aluno') ? 'student' : (email.includes('professor') ? 'teacher' : 'admin');
          const fullName = email.includes('aluno') ? 'Estudante Demo' : (email.includes('professor') ? 'Prof. Marcos Mendes' : 'Coordenação Municipal');

          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role: role } }
          });

          if (signUpError) throw signUpError;

          // Tentativa resiliente de criar perfil (ignora se a tabela não existir ainda na demo)
          const userId = signUpData.user?.id;
          if (userId) {
            const table = (role === 'teacher' || role === 'admin') ? 'teachers' : 'profiles';
            try {
              await supabase.from(table).upsert({
                id: userId,
                name: fullName,
                email: email,
                last_access: new Date().toISOString()
              });
            } catch (dbErr) {
              console.warn("Tabela não encontrada, mas seguindo com login demo...");
            }
          }
          
          toast({ title: "Modo Demo Ativado", description: "Entrando no sistema..." });
          router.push(role === 'teacher' || role === 'admin' ? "/dashboard/teacher/home" : "/dashboard/home");
          return;
        }
        throw error;
      }

      // **FIX:** Força o redirecionamento correto para usuários demo já existentes
      const roleFromEmail = email.includes('aluno') ? 'student' : (email.includes('professor') ? 'teacher' : 'admin');
      router.push(roleFromEmail === 'teacher' || roleFromEmail === 'admin' ? "/dashboard/teacher/home" : "/dashboard/home");

    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro no Acesso", 
        description: err.message || "Verifique suas credenciais ou a conexão."
      });
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: 'student' | 'teacher' | 'coordination') => {
    const creds = {
      student: { email: "aluno@educore.gov.br", password: "admin123" },
      teacher: { email: "professor@educore.gov.br", password: "admin123" },
      coordination: { email: "coordenacao@educore.gov.br", password: "admin123" }
    };
    setEmail(creds[type].email);
    setPassword(creds[type].password);
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500 group border border-white/10">
          <Shield className="h-12 w-12 group-hover:scale-110 transition-transform" />
        </div>
        <div className="space-y-2">
          <h1 className="font-headline text-4xl font-black tracking-tighter text-white drop-shadow-lg">
            Edu<span className="text-accent">Core</span>
          </h1>
          <p className="text-white/70 font-medium flex items-center justify-center gap-2 italic">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            Portal de Gestão Inteligente
          </p>
        </div>
      </div>

      <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-2xl bg-white/95 animate-in zoom-in-95 duration-700">
        <CardHeader className="space-y-1 pb-6 pt-8 text-center bg-primary/5 border-b border-dashed">
          <CardTitle className="text-2xl font-bold text-primary italic">Acesso Restrito</CardTitle>
          <CardDescription className="font-medium text-muted-foreground">Utilize suas credenciais institucionais</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pt-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-primary/60">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-white rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Senha" className="font-bold text-primary/60">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-white rounded-xl" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black h-14 text-base shadow-xl rounded-2xl transition-all">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Entrar na Plataforma <ChevronRight className="h-5 w-5 ml-1" /></>}
            </Button>
          </form>

          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
              <Users className="h-3 w-3" /> Acesso Rápido (Demo Mode)
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" onClick={() => fillCredentials('student')} className="h-12 rounded-xl text-blue-700 font-black gap-3 text-xs justify-start px-6">
                <GraduationCap className="h-4 w-4" /> Entrar como Aluno
              </Button>
              <Button variant="outline" onClick={() => fillCredentials('teacher')} className="h-12 rounded-xl text-orange-700 font-black gap-3 text-xs justify-start px-6">
                <UserCircle className="h-4 w-4" /> Entrar como Professor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
