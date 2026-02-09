
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";

// Definição do tipo para o resultado da correção da IA
interface AIResponse {
  geral: {
    nota_final: number;
    feedback_geral: string;
  };
  competencias: {
    [key: string]: {
      nota: number;
      analise: string;
    };
  };
}

export default function AICorrectionPage() {
  const [essayTopic, setEssayTopic] = useState("");
  const [essayText, setEssayText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCorrection = async () => {
    if (!essayTopic.trim() || !essayText.trim()) {
      setError("Por favor, preencha o tema e o texto da redação.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResult(null);

    try {
      // TODO: Substituir pela chamada real à API quando o endpoint for criado
      // const response = await fetch('/api/ai/grade-essay', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ topic: essayTopic, text: essayText }),
      // });
      // if (!response.ok) {
      //   throw new Error('A resposta do servidor não foi bem-sucedida.');
      // }
      // const data = await response.json();

      // --- DADOS MOCKADOS PARA DESENVOLVIMENTO --- 
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula a latência da rede
      const mockData: AIResponse = {
        geral: {
          nota_final: 920,
          feedback_geral: "Excelente redação! O texto demonstra ótimo domínio da norma culta e uma argumentação muito bem estruturada. A proposta de intervenção é detalhada e criativa. Continue assim!",
        },
        competencias: {
          "Competência 1": { nota: 200, analise: "Domínio excelente da modalidade escrita formal da Língua Portuguesa. Não foram identificados desvios gramaticais ou de convenções da escrita significativos." },
          "Competência 2": { nota: 200, analise: "Compreensão perfeita do tema e uso de repertório sociocultural produtivo, como a citação do filósofo Zygmunt Bauman, que foi bem articulada com a argumentação." },
          "Competência 3": { nota: 160, analise: "A argumentação está clara e bem defendida na maior parte do texto. No terceiro parágrafo, a conexão entre a causa e a consequência poderia ser um pouco mais explícita para fortalecer o ponto." },
          "Competência 4": { nota: 200, analise: "Uso exemplar dos mecanismos de coesão textual. Os parágrafos estão bem conectados e as ideias fluem naturalmente." },
          "Competência 5": { nota: 160, analise: "A proposta de intervenção é boa e bem relacionada ao tema, mas poderia ser um pouco mais detalhada. Faltou especificar quais 'órgãos governamentais' seriam responsáveis e como a 'mídia' poderia atuar de forma prática." },
        }
      };
      // --- FIM DOS DADOS MOCKADOS ---
      
      setAiResult(mockData); // Substitua `mockData` por `data` quando a API estiver pronta

    } catch (e: any) {
      setError("Ocorreu um erro ao processar a correção. Por favor, tente novamente.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary italic flex items-center gap-3">
            Correção de Redação com IA
            <Badge className="bg-accent text-accent-foreground border-none">AURORA</Badge>
          </h1>
          <p className="text-muted-foreground font-medium">Cole o tema e o texto da redação para receber uma análise completa baseada nas 5 competências do ENEM.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Formulário de Submissão */}
        <Card className="w-full lg:w-1/2 lg:max-w-2xl shadow-xl border-none">
          <CardHeader>
            <CardTitle>Dados da Redação</CardTitle>
            <CardDescription>Insira as informações para que a Aurora possa realizar a análise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="essay-topic" className="font-bold">Tema da Redação</Label>
              <Textarea
                id="essay-topic"
                value={essayTopic}
                onChange={(e) => setEssayTopic(e.target.value)}
                placeholder="Ex: Os desafios da educação a distância no Brasil contemporâneo"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="essay-text" className="font-bold">Texto da Redação</Label>
              <Textarea
                id="essay-text"
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Cole aqui o texto completo da redação do aluno..."
                className="mt-2 min-h-[300px]"
              />
            </div>
            {error && <p className="text-sm font-bold text-destructive">{error}</p>}
            <Button onClick={handleCorrection} disabled={isLoading} className="w-full h-12 font-bold text-base shadow-lg">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando Análise...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Corrigir com Aurora IA</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Área de Resultados */}
        <Card className="w-full lg:w-1/2 lg:flex-1 sticky top-6 shadow-2xl border-primary/20 border-2">
          <CardHeader>
            <CardTitle>Análise da Aurora</CardTitle>
            <CardDescription>O resultado da correção será exibido aqui.</CardDescription>
          </CardHeader>
          <CardContent>
            {!aiResult && !isLoading && (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4 font-medium">Aguardando uma redação para analisar.</p>
              </div>
            )}
            {isLoading && (
              <div className="text-center text-primary py-12">
                <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                <p className="mt-4 font-bold">A Aurora está lendo e analisando o texto...</p>
              </div>
            )}
            {aiResult && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="text-center">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Nota Final</CardTitle>
                    <p className="text-6xl font-black text-primary">{aiResult.geral.nota_final}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-center text-primary/90 font-medium">{aiResult.geral.feedback_geral}</p>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  {Object.entries(aiResult.competencias).map(([key, value]) => (
                    <details key={key} className="border p-3 rounded-lg bg-white" open={value.nota < 200}>
                      <summary className="font-bold flex items-center justify-between cursor-pointer">
                        <span>{key}</span>
                        <Badge variant={value.nota === 200 ? "secondary" : "default"}>{value.nota} / 200</Badge>
                      </summary>
                      <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">{value.analise}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
