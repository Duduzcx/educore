"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  BookOpen, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentEssayPage() {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [text, setText] = useState("");
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [loadingGrading, setLoadingGrading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  const handleGenerateTopic = async () => {
    setLoadingTopic(true);
    try {
      const res = await fetch('/api/genkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId: 'essayTopicGenerator', input: {} })
      });
      const data = await res.json();
      if (data.success) {
        setTheme(data.result.title);
        toast({ title: "Tema Gerado!", description: "A Aurora selecionou um desafio para você." });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ title: "Erro na Aurora", description: "Tente novamente em instantes.", variant: "destructive" });
    } finally {
      setLoadingTopic(false);
    }
  };

  const handleSubmitEssay = async () => {
    if (text.length < 500) {
      toast({ title: "Texto muito curto", description: "Uma redação ENEM precisa de pelo menos 7 linhas (aprox. 500 caracteres).", variant: "destructive" });
      return;
    }

    setLoadingGrading(true);
    setResult(null);
    try {
      const res = await fetch('/api/genkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          flowId: 'essayEvaluator', 
          input: { theme, text } 
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        toast({ title: "Análise Concluída!", description: "Confira seu desempenho detalhado." });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ title: "Erro na Correção", description: "Não foi possível analisar seu texto agora.", variant: "destructive" });
    } finally {
      setLoadingGrading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic leading-none">Laboratório de Redação</h1>
          <p className="text-muted-foreground font-medium italic">Treine para o nota 1000 com correção instantânea da Aurora IA.</p>
        </div>
        <Button 
          onClick={handleGenerateTopic} 
          disabled={loadingTopic}
          className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl hover:scale-105 transition-all"
        >
          {loadingTopic ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
          Sugerir Tema Inédito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b border-dashed">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Badge className="bg-primary text-white border-none font-black text-[10px] px-3">PROPOSTA ATUAL</Badge>
                  <CardTitle className="text-2xl font-black text-primary italic">
                    {theme || "Aguardando definição de tema..."}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Extensão</p>
                  <p className={`text-xl font-black italic ${charCount < 500 ? 'text-orange-500' : 'text-green-600'}`}>
                    {charCount} caracteres
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Textarea 
                placeholder="Comece seu texto dissertativo-argumentativo aqui..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[500px] rounded-2xl bg-muted/20 border-none p-8 font-medium text-lg leading-relaxed italic resize-none focus-visible:ring-2 focus-visible:ring-accent/30"
              />
              <div className="mt-8 flex justify-end">
                <Button 
                  onClick={handleSubmitEssay} 
                  disabled={loadingGrading || !text || !theme}
                  className="bg-primary text-white font-black h-16 px-12 rounded-2xl shadow-2xl hover:scale-[1.02] transition-all text-lg"
                >
                  {loadingGrading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Send className="h-6 w-6 mr-2" />}
                  Enviar para a Aurora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {!result ? (
            <Card className="border-none shadow-xl bg-white rounded-[2rem] p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"><BookOpen className="h-6 w-6" /></div>
                <h3 className="font-black text-primary italic uppercase tracking-tight text-sm">Instruções de Escrita</h3>
              </div>
              <div className="space-y-4">
                {[
                  "Mínimo de 7 e máximo de 30 linhas.",
                  "Estrutura: Intro, Desenv. e Conclusão.",
                  "Apresente uma Proposta de Intervenção.",
                  "Respeite os Direitos Humanos."
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span className="text-xs font-bold italic text-primary/70">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-8 text-center relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                <div className="relative z-10 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Nota Final</p>
                  <h2 className="text-7xl font-black italic tracking-tighter text-accent">{result.total_score}</h2>
                  <p className="text-xs font-medium italic opacity-80 pt-4">"{result.general_feedback}"</p>
                </div>
              </Card>

              <Card className="border-none shadow-xl bg-white rounded-[2rem] p-6 space-y-4">
                <h3 className="text-[10px] font-black text-primary/40 uppercase tracking-widest px-2">Análise por Competência</h3>
                <div className="space-y-4">
                  {Object.entries(result.competencies).map(([key, comp]: [string, any], idx) => (
                    <div key={key} className="space-y-1 px-2">
                      <div className="flex justify-between text-[9px] font-black uppercase">
                        <span>Comp. {idx + 1}</span>
                        <span className="text-accent">{comp.score}/200</span>
                      </div>
                      <Progress value={(comp.score / 200) * 100} className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${(comp.score / 200) * 100}%` }} />
                      </Progress>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-xl bg-green-50 rounded-[2rem] p-6 space-y-4">
                <h3 className="text-[10px] font-black text-green-800 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Plano de Evolução
                </h3>
                <div className="space-y-3">
                  {result.suggestions.map((sug: string, i: number) => (
                    <p key={i} className="text-[11px] font-bold italic text-green-900/70 leading-relaxed">• {sug}</p>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
