
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
  TrendingUp,
  Layout,
  Type,
  ChevronRight
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
        toast({ title: "Novo Tema Gerado!", description: "A Aurora selecionou um desafio para você." });
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
      toast({ title: "Texto insuficiente", description: "Escreva pelo menos 500 caracteres.", variant: "destructive" });
      return;
    }

    setLoadingGrading(true);
    setResult(null);
    try {
      const res = await fetch('/api/genkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId: 'essayEvaluator', input: { theme, text } })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        toast({ title: "Correção Finalizada!", description: "Sua análise já está disponível." });
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-2 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-black text-primary italic tracking-tighter">Laboratório de Redação</h1>
            <Badge className="bg-accent text-accent-foreground font-black px-3 py-1 shadow-lg animate-pulse hidden sm:flex">ENEM 2024</Badge>
          </div>
          <p className="text-muted-foreground font-medium text-sm md:text-lg italic max-w-2xl">
            Ambiente de alta performance para o nota 1000.
          </p>
        </div>
        <Button 
          onClick={handleGenerateTopic} 
          disabled={loadingTopic}
          className="rounded-2xl h-14 bg-accent text-accent-foreground font-black px-8 shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
        >
          {loadingTopic ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
          Sugerir Tema Inédito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo: Editor */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden transition-all duration-500 hover:shadow-primary/5">
            <CardHeader className="bg-primary/5 p-6 md:p-10 border-b border-dashed">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  <Badge className="bg-primary text-white border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">Desafio Proposto</Badge>
                  <CardTitle className="text-xl md:text-3xl font-black text-primary italic leading-tight truncate">
                    {theme || "Clique em 'Sugerir Tema' para começar..."}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4 bg-white/50 px-4 py-2 rounded-2xl border">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Extensão</p>
                    <p className={`text-xl font-black italic ${charCount < 500 ? 'text-orange-500' : 'text-green-600'}`}>
                      {charCount} <span className="text-[10px] uppercase font-bold text-muted-foreground/40">Chars</span>
                    </p>
                  </div>
                  <div className={`h-10 w-1 rounded-full ${charCount < 500 ? 'bg-orange-500' : 'bg-green-500'}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea 
                placeholder="Desenvolva sua tese, argumentos e proposta de intervenção..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[500px] md:min-h-[600px] border-none p-8 md:p-12 font-medium text-base md:text-xl leading-relaxed italic resize-none focus-visible:ring-0 bg-transparent text-primary/90"
              />
              <div className="p-6 md:p-10 bg-slate-50 border-t flex justify-end items-center gap-6">
                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest hidden sm:block italic">O rascunho não é salvo automaticamente.</p>
                <Button 
                  onClick={handleSubmitEssay} 
                  disabled={loadingGrading || !text || !theme}
                  className="bg-primary text-white font-black h-14 md:h-16 px-10 md:px-16 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-base md:text-lg border-none"
                >
                  {loadingGrading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Send className="h-6 w-6 mr-3 text-accent" />}
                  {loadingGrading ? "Aurora está corrigindo..." : "Entregar Redação"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Resultados/Instruções */}
        <div className="lg:col-span-4 space-y-6">
          {!result ? (
            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-primary text-white rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-accent/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent shadow-inner"><BookOpen className="h-6 w-6" /></div>
                    <h3 className="font-black text-white italic uppercase tracking-widest text-sm">Diretrizes da Banca</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      "Mínimo de 7 linhas manuscritas.",
                      "Domínio da norma culta da língua.",
                      "Proposta de intervenção detalhada.",
                      "Respeito total aos Direitos Humanos."
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        <span className="text-xs font-bold italic opacity-80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="border-none shadow-xl bg-white rounded-[2rem] p-8 space-y-4">
                <h3 className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-2">
                  <Layout className="h-3.5 w-3.5 text-accent" /> Dica da Aurora
                </h3>
                <p className="text-xs font-medium italic text-primary/70 leading-relaxed">
                  "Comece apresentando sua tese logo no primeiro parágrafo. Isso dá clareza ao seu ponto de vista para o corretor."
                </p>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-700">
              <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] p-10 text-center relative overflow-hidden ring-4 ring-accent/20">
                <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-accent/30 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Resultado Oficial</p>
                  <h2 className="text-8xl font-black italic tracking-tighter text-white drop-shadow-2xl">{result.total_score}</h2>
                  <div className="h-1 w-20 bg-accent mx-auto rounded-full" />
                  <p className="text-sm font-medium italic text-white/80 pt-4 leading-relaxed">"{result.general_feedback}"</p>
                </div>
              </Card>

              <Card className="border-none shadow-xl bg-white rounded-[2rem] p-8 space-y-6">
                <h3 className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-2">
                  <Type className="h-4 w-4 text-accent" /> Competências do ENEM
                </h3>
                <div className="space-y-5">
                  {Object.entries(result.competencies).map(([key, comp]: [string, any], idx) => (
                    <div key={key} className="space-y-2 group">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-primary group-hover:text-accent transition-colors">Competência {idx + 1}</span>
                        <span className="text-accent">{comp.score}/200</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${(comp.score / 200) * 100}%` }} />
                      </div>
                      <p className="text-[9px] text-muted-foreground font-medium italic leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{comp.feedback}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-xl bg-green-50 rounded-[2rem] p-8 space-y-6">
                <h3 className="text-[10px] font-black text-green-800 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Plano de Evolução
                </h3>
                <div className="space-y-4">
                  {result.suggestions.map((sug: string, i: number) => (
                    <div key={i} className="flex gap-3">
                      <ChevronRight className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold italic text-green-900/70 leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Button onClick={() => setResult(null)} variant="outline" className="w-full h-14 rounded-xl border-dashed font-black text-primary hover:bg-primary/5 uppercase text-xs">
                Reiniciar Laboratório
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
