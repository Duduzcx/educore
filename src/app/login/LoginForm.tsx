
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ChevronRight, Loader2, UserCircle, Users, GraduationCap, AlertCircle, BookOpen, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, isSupabaseConfigured, isUsingSecretKeyInBrowser } from "@/app/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) return;
    
    if (email.includes('@compromisso.com.br')) {
      startMockSession(email);
      return;
    }

    if (!isSupabaseConfigured || isUsingSecretKeyInBrowser) {
      setAuthError("Erro de configuração no banco de dados. Utilize o Acesso Rápido abaixo.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        setAuthError(error.message);
        return;
      }

      if (data.user) {
        setIsRedirecting(true);
        const { data: profile } = await supabase.from('profiles').select('profile_type, role').eq('id', data.user.id).single();
        const type = (profile?.profile_type || profile?.role || '').toLowerCase();
        
        let path = "/dashboard/home";
        if (type === 'admin' || type === 'gestor') path = "/dashboard/admin/home";
        else if (type === 'teacher' || type === 'mentor' || type === 'professor') path = "/dashboard/teacher/home";
        
        router.push(path);
      }
    } catch (err) {
      setLoading(false);
      setAuthError("Falha na conexão.");
    }
  };

  const startMockSession = (emailAddr: string) => {
    setLoading(true);
    setIsRedirecting(true);
    
    const role = emailAddr.includes('gestor') ? 'admin' : emailAddr.includes('mentor') ? 'teacher' : 'student';
    const name = role === 'admin' ? 'Gestor Master' : role === 'teacher' ? 'Mentor Expert' : 'Aluno Pro';
    
    localStorage.setItem('compromisso_mock_session', JSON.stringify({
      id: `mock-${role}`,
      email: emailAddr,
      role: role,
      name: name
    }));

    toast({ title: "Modo Demonstração", description: `Entrando como ${name}.` });
    
    setTimeout(() => {
      const path = role === 'admin' ? "/dashboard/admin/home" : role === 'teacher' ? "/dashboard/teacher/home" : "/dashboard/home";
      router.push(path);
    }, 800);
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10 relative">
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary text-white">
          <div className="h-20 w-20 rounded-3xl bg-accent flex items-center justify-center animate-bounce mb-4"><BookOpen className="h-10 w-10" /></div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Sincronizando...</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 text-center">
        <Link href="/" className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl rotate-3 hover:rotate-0 transition-all border border-white/10">
          <Shield className="h-12 w-12" />
        </Link>
        <h1 className="text-4xl font-black text-white italic">Compro<span className="text-accent">misso</span></h1>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-dashed p-8">
          <CardTitle className="text-xl font-black text-primary italic text-center">Entrar no Portal</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {authError && <Alert variant="destructive" className="bg-red-50 border-red-100"><AlertCircle className="h-4 w-4" /><AlertDescription className="text-xs font-bold">{authError}</AlertDescription></Alert>}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" required disabled={loading} />
            <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" required disabled={loading} />
            <Button type="submit" disabled={loading} className="w-full bg-primary h-14 rounded-xl font-black shadow-xl">Entrar Agora</Button>
          </form>
          <div className="pt-6 border-t border-dashed space-y-4">
            <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest text-center">Acesso Rápido Industrial</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => startMockSession('aluno@compromisso.com.br')} className="h-11 rounded-xl text-blue-700 font-black text-[9px]">ALUNO</Button>
              <Button variant="outline" onClick={() => startMockSession('mentor@compromisso.com.br')} className="h-11 rounded-xl text-orange-700 font-black text-[9px]">MENTOR</Button>
              <Button variant="outline" onClick={() => startMockSession('gestor@compromisso.com.br')} className="h-11 rounded-xl text-red-700 font-black text-[9px]">GESTOR</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
