
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Calculator, Sparkles, Loader2 } from 'lucide-react';

// Tipagem para os resultados
interface EligibilityResult {
  isEligible: boolean;
  message: string;
  reason: string;
}

export default function ExemptionSimulatorPage() {
  // Estados do formulário
  const [familyIncome, setFamilyIncome] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [hasCadUnico, setHasCadUnico] = useState('');

  // Estados de controle da UI
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulation = () => {
    setIsLoading(true);
    setResult(null);

    // Simula uma pequena demora, como se fosse uma chamada de API real
    setTimeout(() => {
      const income = parseFloat(familyIncome);
      const minimumWage = 1412; // Salário mínimo de 2024 para referência

      // Lógica de elegibilidade (exemplo baseado em regras comuns)
      if (hasCadUnico === 'yes' && schoolType === 'public' && income <= 1.5 * minimumWage) {
        setResult({
          isEligible: true,
          message: 'Parabéns! Você tem alta probabilidade de ser elegível!',
          reason: 'Você atende aos critérios principais: inscrição no CadÚnico, estudou em escola pública e possui renda familiar per capita de até 1,5 salário mínimo.',
        });
      } else if (schoolType === 'public' && income <= 1.5 * minimumWage) {
         setResult({
          isEligible: true,
          message: 'Você provavelmente é elegível!',
          reason: 'Você atende aos critérios de renda e de ter cursado o ensino médio em escola pública. A inscrição no CadÚnico pode acelerar seu processo.',
        });
      } else {
        setResult({
          isEligible: false,
          message: 'Pouco provável que você seja elegível.',
          reason: 'Com base nos dados fornecidos, você não atende aos critérios principais de renda familiar ou tipo de escola exigidos pela maioria dos programas de isenção.',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Card className="bg-white shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-slate-800">Simulador de Isenção</span>
          </CardTitle>
          <CardDescription className="pt-2">Descubra se você tem direito à isenção da taxa de inscrição nos principais vestibulares do país.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-1 block">Qual a renda mensal total da sua família?</label>
            <Input 
              type="number"
              placeholder="Ex: 2100.50"
              value={familyIncome}
              onChange={(e) => setFamilyIncome(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div>
             <label className="text-sm font-semibold text-slate-600 mb-1 block">Você cursou todo o ensino médio em escola pública?</label>
             <Select value={schoolType} onValueChange={setSchoolType}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Selecione uma opção" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="public">Sim</SelectItem>
                    <SelectItem value="private">Não</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <div>
             <label className="text-sm font-semibold text-slate-600 mb-1 block">Sua família está inscrita no Cadastro Único (CadÚnico)?</label>
             <Select value={hasCadUnico} onValueChange={setHasCadUnico}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Selecione uma opção" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="yes">Sim</SelectItem>
                    <SelectItem value="no">Não</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <Button onClick={handleSimulation} disabled={isLoading || !familyIncome || !schoolType || !hasCadUnico} className="w-full sm:w-auto font-bold rounded-lg">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Simular Agora</>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={`shadow-md rounded-2xl animate-in fade-in duration-500 ${result.isEligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <CardContent className="p-6 flex items-start gap-4">
            {result.isEligible ? 
              <CheckCircle className="h-8 w-8 text-green-600 mt-1 shrink-0" /> : 
              <XCircle className="h-8 w-8 text-red-600 mt-1 shrink-0" />
            }
            <div>
              <h3 className={`font-bold text-lg ${result.isEligible ? 'text-green-800' : 'text-red-800'}`}>{result.message}</h3>
              <p className={`text-sm mt-1 ${result.isEligible ? 'text-green-700' : 'text-red-700'}`}>{result.reason}</p>
              <p className="text-xs text-slate-500 mt-3">*Este é um resultado preliminar. A confirmação final depende das regras específicas de cada edital de vestibular.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
