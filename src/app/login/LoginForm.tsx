'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ChevronRight, Loader2, Sparkles, UserCircle, Users, GraduationCap, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, isSupabaseConfigured } from "@/app/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email || !password) return;
    
    if (!isSupabaseConfigured) {
      setAuthError("Configuração Pendente: As chaves do Supabase não foram encontradas no ambiente (Netlify/Local).");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setAuthError("E-mail ou senha incorretos. Certifique-se de que criou este usuário no painel do Supabase.");
        } else {
          setAuthError(error.message);
        }
        throw error;
      }

      if (data.user) {
        toast({ title: "Login bem-sucedido!", description: "Bem-vindo(a) ao Compromisso." });
        
        const userRole = data.user.user_metadata?.role || 'student';

        if (userRole === 'teacher' || userRole === 'admin') {
            router.push("/dashboard/teacher/home");
        } else {
            router.push("/dashboard/home");
        }
      }

    } catch (err: any) {
      console.error("Erro Login:", err);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: 'student' | 'teacher') => {
    const creds = {
      student: { email: "aluno@compromisso.com.br", password: "aluno123" },
      teacher: { email: "professor@compromisso.com.br", password: "professor123" }
    };
    setEmail(creds[type].email);
    setPassword(creds[type].password);
    setAuthError(null);
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500 group border border-white/10">
          <Shield className="h-12 w-12 group-hover:scale-110 transition-transform" />
        </div>
        <div className="space-y-2">
          <h1 className="font-headline text-4xl font-black tracking-tighter text-white drop-shadow-lg">
            Compro<span className="text-accent">misso</span>
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
          <CardDescription className="font-medium text-muted-foreground">Utilize suas credenciais do curso</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pt-8 space-y-6">
          {authError && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-black uppercase text-[10px] tracking-widest">Erro de Acesso</AlertTitle>
              <AlertDescription className="text-xs font-medium">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-primary/60">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-white rounded-xl" placeholder="seu@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Senha" className="font-bold text-primary/60">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-white rounded-xl" placeholder="••••••••" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black h-14 text-base shadow-xl rounded-2xl transition-all">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Entrar na Plataforma <ChevronRight className="h-5 w-5 ml-1" /></>}
            </Button>
          </form>

          <div className="pt-6 space-y-4 border-t border-dashed">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
              <Users className="h-3 w-3" /> Acesso Rápido (Demo)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => fillCredentials('student')} className="h-12 rounded-xl text-blue-700 font-black gap-2 text-[10px] justify-start px-4">
                <GraduationCap className="h-4 w-4" /> ALUNO
              </Button>
              <Button variant="outline" onClick={() => fillCredentials('teacher')} className="h-12 rounded-xl text-orange-700 font-black gap-2 text-[10px] justify-start px-4">
                <UserCircle className="h-4 w-4" /> MENTOR
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
