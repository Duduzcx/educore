
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Wallet2, Users2, ArrowRight, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useUser, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function FinancialAidPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    eligible: boolean;
    perCapita: number;
    threshold: number;
  } | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    monthlyIncome: "",
    familySize: "1",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const income = Number(formData.monthlyIncome);
    const size = Number(formData.familySize);

    if (!formData.monthlyIncome || income < 0) {
      toast({
        title: "Valor Inválido",
        description: "Por favor, informe uma renda bruta mensal válida.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const perCapita = income / size;
      const minWage = 1621; // Salário Mínimo R$ 1.621,00
      const threshold = minWage * 1.5; // Teto de 1,5 SM = R$ 2.431,50
      const eligible = perCapita <= threshold;

      setResult({
        eligible: eligible,
        perCapita: perCapita,
        threshold: threshold
      });

      // Atualizar perfil do aluno no Firestore para comunicação com o professor
      if (user && firestore) {
        const userRef = doc(firestore, "users", user.uid);
        updateDocumentNonBlocking(userRef, {
          isFinancialAidEligible: eligible,
          lastFinancialSimulation: new Date().toISOString()
        });
      }

      setLoading(false);
      
      toast({
        title: "Cálculo Concluído",
        description: "Seu perfil foi atualizado para acompanhamento pedagógico.",
      });
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-primary flex items-center gap-3 italic">
          Simulador de Isenção
          <Sparkles className="h-7 w-7 text-accent" />
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Descubra se você atende aos critérios para isenção de taxas em vestibulares e concursos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden rounded-[2.5rem]">
            <CardHeader className="pb-4 p-8">
              <div className="h-12 w-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl font-black italic">Regra de 1,5 SM</CardTitle>
              <CardDescription className="text-primary-foreground/70 font-medium">
                Critério padrão do Governo Federal para isenção total.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              <div className="p-5 rounded-[1.5rem] bg-white/10 border border-white/10">
                <p className="font-black flex items-center gap-2 mb-2 text-sm uppercase tracking-widest text-accent">
                  <CheckCircle2 className="h-4 w-4" />
                  Teto de Isenção
                </p>
                <p className="text-sm opacity-90 leading-relaxed font-medium">
                  Sua renda dividida por cada morador da casa deve ser de até <strong>R$ 2.431,50</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border-none space-y-6 relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground shrink-0 shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-primary italic leading-none mb-1">Dúvida na Papelada?</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Fale com a Aurora</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
              "Não sabe onde conseguir o comprovante de renda? Me pergunte sobre ID Jovem ou CadÚnico!"
            </p>
            <Button asChild variant="outline" className="w-full font-black h-12 rounded-xl border-dashed border-primary/20 hover:bg-primary hover:text-white transition-all">
              <Link href="/dashboard/support">Consultar a Aurora</Link>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <Card className="shadow-2xl border-none bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-muted/10 p-10">
              <CardTitle className="text-2xl font-black text-primary italic">Dados da Residência</CardTitle>
              <CardDescription className="font-medium">O cálculo é feito com base na renda bruta de todos os moradores.</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="income" className="text-[10px] font-black uppercase tracking-widest text-primary/50 flex items-center gap-2">
                      <Wallet2 className="h-4 w-4" />
                      Renda Bruta Familiar Mensal (Total)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary/30">R$</span>
                      <Input 
                        id="income" 
                        type="number" 
                        placeholder="Ex: 3500" 
                        className="pl-14 h-16 bg-muted/30 border-none text-xl font-black rounded-2xl focus:ring-accent" 
                        value={formData.monthlyIncome}
                        onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="familySize" className="text-[10px] font-black uppercase tracking-widest text-primary/50 flex items-center gap-2">
                      <Users2 className="h-4 w-4" />
                      Quantas pessoas residem na casa?
                    </Label>
                    <Select value={formData.familySize} onValueChange={(v) => setFormData({...formData, familySize: v})}>
                      <SelectTrigger id="familySize" className="h-16 bg-muted/30 border-none text-xl font-black rounded-2xl px-6">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <SelectItem key={n} value={n.toString()} className="text-base font-bold py-3">
                            {n} {n === 1 ? 'Pessoa' : 'Pessoas'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-primary hover:bg-primary/95 text-white h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Calcular Elegibilidade"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && (
            <Card className={`animate-in zoom-in-95 slide-in-from-top-4 duration-500 border-none shadow-2xl rounded-[2.5rem] overflow-hidden ${result.eligible ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
              <div className={`p-8 flex items-center gap-6 ${result.eligible ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  {result.eligible ? <CheckCircle2 className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                </div>
                <div>
                  <CardTitle className="text-2xl font-black italic">
                    {result.eligible ? "Dentro do Limite" : "Fora do Critério"}
                  </CardTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">
                    {result.eligible ? "ELEGÍVEL PARA ISENÇÃO TOTAL" : "RENDA PER CAPITA ACIMA DO TETO"}
                  </p>
                </div>
              </div>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-3xl border-2 border-muted/20 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sua Renda por Pessoa</span>
                    <span className="text-2xl font-black text-primary">R$ {result.perCapita.toFixed(2)}</span>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border-2 border-muted/20 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Limite do Programa</span>
                    <span className="text-2xl font-black text-primary">R$ {result.threshold.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-8 bg-white rounded-3xl border-2 border-dashed border-primary/10 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/5 rounded-xl">
                      <Info className="h-6 w-6 text-primary shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-black text-primary italic">Relatório da Aurora:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        {result.eligible 
                          ? "Boas notícias! Sua renda familiar permite solicitar a isenção de taxas. Já atualizei seu perfil para que seus professores possam te orientar sobre os próximos passos."
                          : "Atenção: sua renda por pessoa ultrapassa o limite de 1,5 salário mínimo. No entanto, você ainda pode buscar isenções por outros critérios (como alunos de escola pública). Fale comigo para saber mais!"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black h-16 rounded-2xl shadow-xl shadow-accent/20">
                  <Link href="/dashboard/support">
                    Ver Documentos Necessários
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
