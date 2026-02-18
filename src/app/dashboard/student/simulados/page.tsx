"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, BookCheck, Target, Award, RotateCw, AlertTriangle, BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/AuthProvider';

const SIMULATION_SIZE = 10;

type Question = {
  id: string;
  question_text: string;
  options: { letter: string; text: string }[];
  correct_answer: string;
  subject: string;
  year: number;
};

type Answer = {
  questionId: string;
  selected: string;
  correct: string;
};

const mockQuestions: Question[] = [
  {
    id: 'q1',
    question_text: 'Em uma competição de ciências, uma equipe constrói um pequeno robô que se move em linha reta. A função que descreve a posição (P) do robô em metros, em relação ao tempo (t) em segundos, é P(t) = 2t + 3. Qual é a posição do robô após 5 segundos?',
    options: [
      { letter: 'a', text: '10 metros' },
      { letter: 'b', text: '13 metros' },
      { letter: 'c', text: '8 metros' },
      { letter: 'd', text: '15 metros' },
    ],
    correct_answer: 'b',
    subject: 'Matemática',
    year: 2023,
  },
  {
    id: 'q2',
    question_text: 'Qual das seguintes organelas celulares é responsável pela respiração celular e produção de ATP?',
    options: [
      { letter: 'a', text: 'Retículo Endoplasmático' },
      { letter: 'b', text: 'Complexo de Golgi' },
      { letter: 'c', text: 'Mitocôndria' },
      { letter: 'd', text: 'Lisossomo' },
    ],
    correct_answer: 'c',
    subject: 'Biologia',
    year: 2022,
  },
  {
    id: 'q3',
    question_text: 'A Lei da Inércia, ou Primeira Lei de Newton, afirma que um corpo em repouso tende a permanecer em repouso, a menos que uma força externa atue sobre ele. Essa afirmação está...',
    options: [
      { letter: 'a', text: 'Correta' },
      { letter: 'b', text: 'Incorreta' },
      { letter: 'c', text: 'Parcialmente correta' },
      { letter: 'd', text: 'Relativa' },
    ],
    correct_answer: 'a',
    subject: 'Física',
    year: 2023,
  },
  {
    id: 'q4',
    question_text: 'Qual movimento literário brasileiro teve como uma de suas principais características o sentimentalismo e a idealização da natureza?',
    options: [
      { letter: 'a', text: 'Barroco' },
      { letter: 'b', text: 'Arcadismo' },
      { letter: 'c', text: 'Modernismo' },
      { letter: 'd', text: 'Romantismo' },
    ],
    correct_answer: 'd',
    subject: 'Linguagens',
    year: 2021,
  },
  {
    id: 'q5',
    question_text: 'Durante o período da Guerra Fria, a polarização do mundo entre os blocos capitalista e socialista gerou diversos conflitos indiretos. Qual evento é considerado o marco da queda simbólica dessa divisão?',
    options: [
      { letter: 'a', text: 'Conferência de Ialta' },
      { letter: 'b', text: 'Queda do Muro de Berlim' },
      { letter: 'c', text: 'Crise dos Mísseis' },
      { letter: 'd', text: 'Guerra do Vietnã' },
    ],
    correct_answer: 'b',
    subject: 'História',
    year: 2022,
  },
  {
    id: 'q6',
    question_text: 'O fenômeno climático caracterizado pelo aquecimento anormal das águas do Oceano Pacífico e que altera os padrões de chuva no Brasil é conhecido como:',
    options: [
      { letter: 'a', text: 'La Niña' },
      { letter: 'b', text: 'El Niño' },
      { letter: 'c', text: 'Inversão Térmica' },
      { letter: 'd', text: 'Efeito Estufa' },
    ],
    correct_answer: 'b',
    subject: 'Geografia',
    year: 2023,
  },
  {
    id: 'q7',
    question_text: 'O Iluminismo foi um movimento intelectual que surgiu no século XVIII. Qual era um dos seus pilares fundamentais?',
    options: [
      { letter: 'a', text: 'O absolutismo monárquico' },
      { letter: 'b', text: 'A supremacia da fé sobre a razão' },
      { letter: 'c', text: 'O uso da razão e a liberdade individual' },
      { letter: 'd', text: 'A manutenção do sistema feudal' },
    ],
    correct_answer: 'c',
    subject: 'História',
    year: 2023,
  },
  {
    id: 'q8',
    question_text: 'Em química, o que define uma ligação iônica?',
    options: [
      { letter: 'a', text: 'Compartilhamento de elétrons' },
      { letter: 'b', text: 'Transferência de elétrons entre um metal e um não metal' },
      { letter: 'c', text: 'Atração entre moléculas polares' },
      { letter: 'd', text: 'Ligação entre dois átomos de hidrogênio' },
    ],
    correct_answer: 'b',
    subject: 'Química',
    year: 2022,
  },
  {
    id: 'q9',
    question_text: 'Qual a principal fonte de energia para os seres vivos na Terra, considerando a base da cadeia alimentar?',
    options: [
      { letter: 'a', text: 'Energia Geotérmica' },
      { letter: 'b', text: 'Energia Solar' },
      { letter: 'c', text: 'Energia Química' },
      { letter: 'd', text: 'Energia Nuclear' },
    ],
    correct_answer: 'b',
    subject: 'Biologia',
    year: 2024,
  },
  {
    id: 'q10',
    question_text: 'Sobre a globalização, é correto afirmar que:',
    options: [
      { letter: 'a', text: 'É um processo que isola as economias nacionais.' },
      { letter: 'b', text: 'Promove apenas o intercâmbio cultural, sem impactos econômicos.' },
      { letter: 'c', text: 'Caracteriza-se pela integração econômica, cultural e política mundial.' },
      { letter: 'd', text: 'Iniciou-se apenas no século XXI com a internet.' },
    ],
    correct_answer: 'c',
    subject: 'Geografia',
    year: 2023,
  }
];

export default function SimuladoPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'loading' | 'active' | 'finished' | 'error'>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(() => {
    setGameState('loading');
    setError(null);
    setTimeout(() => {
      const shuffledData = [...mockQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffledData.slice(0, SIMULATION_SIZE));
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setGameState('active');
    }, 1000);
  }, []);

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswer = {
      questionId: questions[currentQuestionIndex].id,
      selected: selectedAnswer,
      correct: questions[currentQuestionIndex].correct_answer,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameState('finished');
    }
  };

  const resetSimulation = () => {
    setGameState('idle');
  };

  const score = answers.filter(a => a.selected === a.correct).length;

  if (gameState === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
        <p className="text-lg font-black text-primary italic animate-pulse">Aurora calibrando questões...</p>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
        <div className="h-full w-full flex items-center justify-center animate-in fade-in">
            <Card className="w-full max-w-lg text-center p-8 shadow-2xl rounded-[3rem] bg-white border-none">
                <CardHeader>
                    <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
                    <CardTitle className="text-3xl font-black text-primary italic mt-4">Ops! Algo deu errado</CardTitle>
                    <CardDescription className="text-md font-medium text-muted-foreground mt-2">
                        {error}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={resetSimulation} className="h-14 rounded-2xl font-black text-lg px-10">
                        <RotateCw className="h-5 w-5 mr-3" />
                        Voltar ao Início
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (gameState === 'finished') {
    const performance = (score / questions.length) * 100;
    return (
      <div className="h-full w-full flex items-center justify-center animate-in fade-in">
        <Card className="w-full max-w-2xl text-center p-8 shadow-2xl rounded-[3rem] bg-white border-none">
          <CardHeader>
            <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Award className="h-12 w-12 text-yellow-600" />
            </div>
            <CardTitle className="text-4xl font-black text-primary italic mt-4">Simulado Concluído!</CardTitle>
            <CardDescription className="text-xl font-medium text-muted-foreground mt-2">
              Você acertou {score} de {questions.length} questões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-8 space-y-2">
                <div className="flex justify-between text-xs font-black uppercase text-primary/40">
                  <span>Performance Geral</span>
                  <span>{performance.toFixed(0)}%</span>
                </div>
                <Progress value={performance} className="h-4 bg-muted rounded-full" />
                <p className='font-black text-accent italic text-xl mt-4'>
                  {performance >= 70 ? "EXCELENTE RESULTADO!" : performance >= 50 ? "BOM CAMINHO, CONTINUE!" : "FOCO NOS ESTUDOS!"}
                </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={resetSimulation} variant="outline" className="flex-1 h-14 rounded-2xl font-black text-lg shadow-sm border-dashed">
                Início
              </Button>
              <Button onClick={fetchQuestions} className="flex-1 h-14 rounded-2xl font-black text-lg bg-primary shadow-xl">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'active') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in space-y-8">
        <div className='bg-white p-6 rounded-3xl shadow-sm border-b-4 border-accent'>
            <div className='flex justify-between items-center mb-4'>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <BrainCircuit className="h-5 w-5 text-accent" />
                  </div>
                  <p className='font-black text-primary text-xs md:text-sm uppercase tracking-widest'>QUESTÃO {currentQuestionIndex + 1} / {questions.length}</p>
                </div>
                <Badge variant="outline" className='font-black text-[10px] uppercase bg-primary text-white border-none h-7 px-4'>
                  {currentQuestion.subject} • {currentQuestion.year}
                </Badge>
            </div>
            <Progress value={progress} className="h-2 bg-muted rounded-full overflow-hidden" />
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden animate-in slide-in-from-right-4 duration-500">
          <CardHeader className='p-8 md:p-12 bg-muted/5'>
            <CardDescription className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed text-justify italic">
              "{currentQuestion.question_text}"
            </CardDescription>
          </CardHeader>
          <CardContent className='p-8 md:p-12 pt-4'>
            <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} className="space-y-4">
              {currentQuestion.options.map((opt) => (
                <Label 
                  key={opt.letter} 
                  className={`flex items-start gap-5 text-base p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${
                    selectedAnswer === opt.letter ? 'border-accent bg-accent/5 ring-4 ring-accent/5' : 'border-muted/20 hover:border-accent/40'
                  }`}
                >
                  <RadioGroupItem value={opt.letter} id={opt.letter} className="mt-1" />
                  <div className="flex gap-4">
                    <span className={`font-black text-lg italic ${selectedAnswer === opt.letter ? 'text-accent' : 'text-primary/30'}`}>
                      {opt.letter.toUpperCase()}.
                    </span>
                    <span className="font-medium text-slate-700 leading-snug">{opt.text}</span>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white shadow-xl">
          <p className="text-[10px] font-black uppercase text-primary/40 px-4 italic">Pense com calma antes de responder.</p>
          <Button 
            onClick={handleNextQuestion} 
            disabled={selectedAnswer === null} 
            className="h-14 rounded-2xl font-black text-lg px-12 bg-primary hover:bg-primary/95 shadow-2xl transition-all active:scale-95"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Próxima Questão' : 'Finalizar Simulado'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center animate-in fade-in duration-1000">
        <Card className="w-full max-w-xl text-center p-10 md:p-16 shadow-2xl rounded-[3rem] bg-white border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            
            <CardHeader className="relative z-10">
                <div className="h-24 w-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <BookCheck className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-4xl md:text-5xl font-black text-primary italic tracking-tighter leading-none">
                  Simulado <span className="text-accent">Compromisso</span>
                </CardTitle>
                <CardDescription className="text-lg md:text-xl font-medium text-muted-foreground mt-4 italic">
                    Avalie seus conhecimentos com questões reais focadas na sua aprovação.
                </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-8 mt-6">
                <div className="flex items-center justify-center gap-8 py-4 border-y border-dashed">
                  <div className="text-center">
                    <p className="text-2xl font-black text-primary italic">{mockQuestions.length}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Banco de Dados</p>
                  </div>
                  <div className="h-8 w-px bg-muted" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-primary italic">IA</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Avaliação</p>
                  </div>
                </div>
                <Button onClick={fetchQuestions} className="w-full h-16 rounded-2xl font-black text-xl px-12 bg-primary hover:bg-primary/95 shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group">
                    <Target className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Começar Agora
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
