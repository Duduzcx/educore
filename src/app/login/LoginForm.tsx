
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Importando o componente Link
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Mail, ChevronRight, Loader2, Sparkles, ShieldCheck, GraduationCap, UserCircle, Users } from "lucide-react";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Componente de Login interativo com suporte a perfis demonstrativos.
 */

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword } = await import("firebase/auth");
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({ title: "Bem-vindo ao EduCore!", description: "Acesso autorizado com sucesso." });
      router.push("/dashboard/home");
    } catch (err: any) {
      // Lógica de Autocriação para demonstração
      const testEmails = ["aluno@educore.gov.br", "professor@educore.gov.br", "coordenacao@educore.gov.br"];
      
      if ((err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-disabled') && testEmails.includes(email)) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const db = getFirestore();

          if (email === "aluno@educore.gov.br") {
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              name: "Estudante Demo",
              email,
              profileType: "etec",
              institution: "ETEC Jorge Street",
              createdAt: new Date().toISOString()
            });
          } else {
            await setDoc(doc(db, "teachers", user.uid), {
              uid: user.uid,
              name: email === "professor@educore.gov.br" ? "Prof. Marcos Mendes" : "Coordenação Municipal",
              email,
              subjects: "Gestão e Tecnologia",
              createdAt: new Date().toISOString()
            });
          }
          router.push("/dashboard/home");
          return;
        } catch (createErr) {
          console.error(createErr);
        }
      }

      toast({ variant: "destructive", title: "Falha na Autenticação", description: "Credenciais inválidas ou erro de rede." });
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
          <form onSubmit={handleLogin} className="space-y-4"> {/* Reduzido o espaço para acomodar o novo link */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-primary/60">E-mail</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-12 bg-white rounded-xl" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Senha" className="font-bold text-primary/60">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 h-12 bg-white rounded-xl" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black h-14 text-base shadow-xl rounded-2xl active:scale-95 transition-all">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Entrar na Plataforma <ChevronRight className="h-5 w-5 ml-1" /></>}
            </Button>
            
            {/* Link para a página de registro */}
            <div className="text-center">
                <Link href="/register" className="text-xs font-bold text-primary/60 hover:text-primary transition-colors">
                    Não tem uma conta? Crie uma agora
                </Link>
            </div>
          </form>

          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
              <Users className="h-3 w-3" /> Acesso Rápido (Demo)
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" onClick={() => fillCredentials('student')} className="h-12 rounded-xl text-blue-700 font-black gap-3 text-xs justify-start px-6">
                <GraduationCap className="h-4 w-4" /> Aluno
              </Button>
              <Button variant="outline" onClick={() => fillCredentials('teacher')} className="h-12 rounded-xl text-orange-700 font-black gap-3 text-xs justify-start px-6">
                <UserCircle className="h-4 w-4" /> Professor
              </Button>
              <Button variant="outline" onClick={() => fillCredentials('coordination')} className="h-12 rounded-xl text-accent font-black gap-3 text-xs justify-start px-6">
                <ShieldCheck className="h-4 w-4" /> Coordenação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
