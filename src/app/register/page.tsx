
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, School, User, ArrowRight, CheckCircle2, Loader2, Mail, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; // Importa o cliente Supabase

type Step = 1 | 2 | 3;
type ProfileType = "etec" | "uni" | "teacher";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [profileType, setProfileType] = useState<ProfileType>("etec");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    school: "",
    course: "",
    university: "",
    major: "",
    subject: "",
    experience: "",
    interests: ""
  });

  const nextStep = () => setStep((s) => (s + 1) as Step);
  const prevStep = () => setStep((s) => (s - 1) as Step);

  const handleFinish = async () => {
    if (!formData.email || !formData.password) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha e-mail e senha." });
      return;
    }

    setLoading(true);
    try {
      // 1. Criar o usuário no Supabase Auth
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { // Esses dados são adicionados à coluna `raw_user_meta_data` do objeto `user` do Auth
            full_name: fullName,
            profile_type: profileType,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Pega o usuário recém-criado da resposta do signUp
      const user = data.user;
      if (!user) throw new Error("Criação de usuário falhou. Nenhum usuário retornado.");

      // 2. Inserir os dados do perfil na tabela apropriada
      let profileError;
      if (profileType === "teacher") {
        const { error } = await supabase.from('teachers').insert({
          id: user.id, // Chave estrangeira para auth.users.id
          name: fullName,
          email: formData.email,
          subjects: formData.subject,
          experience: formData.experience,
          interests: formData.interests,
        });
        profileError = error;
      } else {
        const { error } = await supabase.from('profiles').insert({
          id: user.id, // Chave estrangeira para auth.users.id
          name: fullName,
          email: formData.email,
          profile_type: profileType,
          institution: profileType === "etec" ? formData.school : formData.university,
          course: profileType === "etec" ? formData.course : formData.major,
          interests: formData.interests,
        });
        profileError = error;
      }

      if (profileError) throw profileError;

      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado em breve. Verifique seu e-mail para confirmação.",
      });
      
      // Redireciona para o dashboard. O onAuthStateChange cuidará do estado de login.
      router.push("/dashboard/home");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha no Cadastro",
        description: error.message || "Não foi possível criar sua conta.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-black tracking-tight text-primary flex items-center justify-center gap-3">
            Comece a Aprender
            <Sparkles className="h-8 w-8 text-accent" />
          </h1>
          <p className="text-muted-foreground text-lg">Crie seu perfil personalizado em segundos</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-xs font-bold text-primary uppercase tracking-widest">
            <span>Passo {step} de 3: {step === 1 ? "Básico" : step === 2 ? "Perfil" : "Detalhes"}</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2 bg-muted rounded-full overflow-hidden" />
        </div>

        <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none overflow-hidden bg-white/90 backdrop-blur-md">
          <CardHeader className="bg-primary/5 pb-8 pt-8">
            <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm">
                {step}
              </span>
              {step === 1 && "Informações de Acesso"}
              {step === 2 && "Quem é você?"}
              {step === 3 && "Finalize seu Perfil"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 min-h-[420px]">
             {step === 1 && (
              <div key="step1" className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" placeholder="Seu nome" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} className="h-12 bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" placeholder="Seu sobrenome" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} className="h-12 bg-white/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input id="email" type="email" placeholder="nome@exemplo.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="pl-11 h-12 bg-white/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={(e) => updateField("password", e.target.value)} className="pl-11 h-12 bg-white/50" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
               <div key="step2" className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <RadioGroup 
                  value={profileType} 
                  onValueChange={(v) => setProfileType(v as ProfileType)} 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {[
                    { id: "etec", label: "Aluno ETEC", icon: School, desc: "Técnico" },
                    { id: "uni", label: "Universitário", icon: GraduationCap, desc: "Superior" },
                    { id: "teacher", label: "Professor", icon: User, desc: "Docente" }
                  ].map((p) => (
                    <div key={p.id}>
                      <Label
                        htmlFor={p.id}
                        className={`flex flex-col items-center justify-center rounded-2xl border-2 p-6 hover:bg-white cursor-pointer transition-all h-full text-center group ${
                          profileType === p.id ? "border-accent bg-white shadow-xl ring-4 ring-accent/5" : "border-border bg-white/50"
                        }`}
                      >
                        <RadioGroupItem value={p.id} id={p.id} className="sr-only" />
                        <div className={`p-5 rounded-full mb-4 transition-all ${profileType === p.id ? "bg-accent text-accent-foreground scale-110" : "bg-muted text-primary"}`}>
                          <p.icon className="h-10 w-10" />
                        </div>
                        <p className="font-bold text-lg">{p.label}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{p.desc}</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div key="step3" className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {profileType === "etec" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="school">Unidade ETEC</Label>
                      <Input id="school" placeholder="Ex: ETEC Jorge Street" value={formData.school} onChange={(e) => updateField("school", e.target.value)} className="h-12 bg-white/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Curso Técnico</Label>
                      <Input id="course" placeholder="Ex: Desenvolvimento de Sistemas" value={formData.course} onChange={(e) => updateField("course", e.target.value)} className="h-12 bg-white/50" />
                    </div>
                  </div>
                )}
                {profileType === "uni" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">Universidade</Label>
                      <Input id="university" placeholder="Ex: USP, FATEC, Mackenzie" value={formData.university} onChange={(e) => updateField("university", e.target.value)} className="h-12 bg-white/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Curso de Graduação</Label>
                      <Input id="major" placeholder="Ex: Engenharia Mecânica" value={formData.major} onChange={(e) => updateField("major", e.target.value)} className="h-12 bg-white/50" />
                    </div>
                  </div>
                )}
                {profileType === "teacher" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Disciplinas que Leciona</Label>
                      <Input id="subject" placeholder="Ex: Matemática, Física" value={formData.subject} onChange={(e) => updateField("subject", e.target.value)} className="h-12 bg-white/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp">Anos de Experiência</Label>
                      <Input id="exp" type="number" placeholder="0" value={formData.experience} onChange={(e) => updateField("experience", e.target.value)} className="h-12 bg-white/50" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="interests">Interesses Principais</Label>
                  <Input id="interests" placeholder="Ex: IA, UX Design, Astronomia" value={formData.interests} onChange={(e) => updateField("interests", e.target.value)} className="h-12 bg-white/50" />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/10 p-8 bg-muted/5">
            <Button 
              variant="ghost" 
              onClick={step === 1 ? () => router.push("/login") : prevStep} 
              disabled={loading}
              className="px-6 font-bold"
            >
              {step === 1 ? "Voltar ao Login" : "Voltar"}
            </Button>
            {step < 3 ? (
              <Button onClick={nextStep} className="bg-primary text-primary-foreground px-10 font-bold group shadow-xl shadow-primary/10">
                Continuar
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading} className="bg-accent text-accent-foreground px-10 font-bold shadow-xl shadow-accent/20 group">
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Finalizar Cadastro
              </Button>
            )}
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60">
          Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
